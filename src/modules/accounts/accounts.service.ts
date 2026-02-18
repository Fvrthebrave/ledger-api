import { pool } from '../../config/db';

export async function createAccount(userId: number, name: string) {
  const result = await pool.query(`
    INSERT INTO accounts (user_id, name)
    VALUES ($1, $2)
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
  try {
    const result = await pool.query(`
      SELECT balance
      FROM accounts
      WHERE id = $1 AND user_id = $2`,
      [accountId, userId]
    );

    if(result.rowCount === 0) {
      throw new Error('Unauthorized or invalid account');
    }
    return result.rows[0].balance;
  } catch(err: any) {
    throw err;
  }
}

export async function transferBetweenAccounts(
  transferId: string,
  fromAccountId: number,
  toAccountId: number,
  userId: number,
  amount: number
) {
  if(fromAccountId === toAccountId) {
    throw new Error('Cannot transfer to the same account');
  }

  if(amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const transferInsert = await client.query(
      `
      INSERT into transfers (id, user_id, from_account_id, to_account_id, amount)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
      RETURNING *
      `,
      [transferId, userId, fromAccountId, toAccountId, amount]
    )

    if(transferInsert.rowCount === 0) {
      await client.query('ROLLBACK');
      return { message: 'Transfer already processed' }
    }

    // Lock both accounts in consistent order.
    const [firstId, secondId] =
    fromAccountId < toAccountId
    ? [fromAccountId, toAccountId]
    : [toAccountId, fromAccountId];


    console.log('Locking accounts...');
    await client.query(
      `SELECT id FROM accounts WHERE id IN ($1, $2) FOR UPDATE`,
      [firstId, secondId]
    );

    console.log('Debiting...');
    const debitResult = await client.query(
      `
      UPDATE accounts SET balance = balance - $1
      WHERE id = $2
        AND user_id = $3
        AND balance >= $1
        RETURNING *
      `,
      [amount, fromAccountId, userId]
    );

    if(debitResult.rowCount === 0) {
      throw new Error('Unauthorized or insufficient funds');
    }

    console.log('Crediting...');
    const creditResult = await client.query(
      `
      UPDATE accounts
      SET balance = balance + $1
      WHERE id = $2
        AND user_id = $3
      RETURNING *
      `,
      [amount, toAccountId, userId]
    );

    if(creditResult.rowCount === 0) {
      throw new Error('Destination account not found');
    }


    console.log('Inserting ledger...');
    await client.query(
      `
      INSERT INTO transactions (account_id, amount, type)
      VALUES ($1, $2, $3, $4)
      `,
      [fromAccountId, amount, 'debit', transferId]
    );
    
    await client.query(
      `
      INSERT INTO transactions (account_id, amount, type)
      VALUES ($1, $2, $3, $4)
      `,
      [toAccountId, amount, 'credit', transferId]
    );

    await client.query('COMMIT');
    return { message: 'Transfer successful' };
  } catch(err: any) {
    await client.query('ROLLBACK');
    return { message: 'Transfer unsuccessful', error: err };
  } finally {
    client.release();
  }
}