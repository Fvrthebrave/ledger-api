import { pool } from '../../config/db';

export class InvalidTransferError extends Error {}
export class InsufficientFundsError extends Error {}
export class AccountNotFoundError extends Error {}
export class DuplicateTransferError extends Error {}

export async function createAccount(userId: number, name: string) {
  const result = await pool.query(`
    INSERT INTO accounts (user_id, name, balance_cents)
    VALUES ($1, $2, 0)
    RETURNING *`,
    [userId, name]
  );

  return result.rows[0];
}

export async function getAccountById(accountId: number) {
  const result = await pool.query(`
    SELECT * FROM accounts WHERE id = $1`, 
    [accountId]
  );

  return result.rows[0];
}

export async function getAccountBalanceForUser(accountId: number, userId: number) {
  const result = await pool.query(`
    SELECT balance_cents
    FROM accounts
    WHERE id = $1 AND user_id = $2`,
    [accountId, userId]
  );

  if(result.rowCount === 0) {
    throw new AccountNotFoundError('Unauthorized or invalid account');
  }
  return result.rows[0].balance_cents;
}

export async function transferBetweenAccounts(
  transferId: string,
  fromAccountId: number,
  toAccountId: number,
  userId: number,
  amountCents: number
) {
  
  if(fromAccountId === toAccountId) {
    throw new InvalidTransferError('Cannot transfer to the same account');
  }

  if(!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new InvalidTransferError('Amount must be a positive integer (cents)');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const transferInsert = await client.query(
      `
      INSERT INTO transfers (
        external_transfer_id,
        user_id
        from_account_id,
        to_account_id,
        amount_cents
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (external_transfer_id)
      DO NOTHING
      RETURNING id
      `,
      [transferId, userId, fromAccountId, toAccountId, amountCents]
    );

    if (transferInsert.rowCount === 0) {
      // Already exists — return success safely
      await client.query('ROLLBACK');
      return { message: 'Transfer already processed' };
    }

    const internalTransferId = transferInsert.rows[0].id;

    // Lock both accounts in consistent order.
    const [firstId, secondId] =
    fromAccountId < toAccountId
    ? [fromAccountId, toAccountId]
    : [toAccountId, fromAccountId];

    const lockRes = await client.query(
      `SELECT id FROM accounts WHERE id IN ($1, $2) 
       AND user_id = $3
       ORDER BY id
       FOR UPDATE
      `,
      [firstId, secondId, userId]
    );

    if (lockRes.rowCount !== 2) {
      throw new AccountNotFoundError('One or both accounts not found or unauthorized');
    }

    const debitResult = await client.query(
      `
      UPDATE accounts SET balance_cents = balance_cents - $1
      WHERE id = $2
        AND user_id = $3
        AND balance_cents >= $1
        RETURNING *
      `,
      [amountCents, fromAccountId, userId]
    );

    if(debitResult.rowCount === 0) {
      throw new InsufficientFundsError('Unauthorized or insufficient funds');
    }

    const creditResult = await client.query(
      `
      UPDATE accounts
      SET balance_cents = balance_cents + $1
      WHERE id = $2
        AND user_id = $3
      RETURNING *
      `,
      [amountCents, toAccountId, userId]
    );

    if(creditResult.rowCount === 0) {
      throw new AccountNotFoundError('Destination account not found');
    }

    await client.query(
      `
      INSERT INTO transactions (account_id, amount_cents, type, transfer_id)
      VALUES ($1, $2, $3, $4)
      `,
      [fromAccountId, amountCents, 'debit', internalTransferId]
    );
    
    await client.query(
      `
      INSERT INTO transactions (account_id, amount_cents, type, transfer_id)
      VALUES ($1, $2, $3, $4)
      `,
      [toAccountId, amountCents, 'credit', internalTransferId]
    );

    await client.query('COMMIT');
    return { message: 'Transfer successful' };
  } catch(err: any) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
