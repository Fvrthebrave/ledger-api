import { pool } from '../../config/db';

export async function createTransactionForUser(
  accountId: number,
  userId: number,
  amount: number,
  type: 'credit' | 'debit'
) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if(!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Invalid transaction amount');
    }
  
    const updateQuery = 
    type === 'debit'
    ? `
      UPDATE accounts
      SET balance = balance - $3
      WHERE id = $2
      AND user_id = $1
      AND balance >= $3
      RETURNING balance
    `
    :`
      UPDATE accounts
      SET balance = balance + $3
      WHERE id = $2
      and userId = $1
      RETURNING balance
    `;

    const updateResult = await client.query(updateQuery, [
      userId,
      accountId,
      amount
    ]);

    if(updateResult.rowCount === 0) {
      throw new Error('Unauthorized or insufficient funds');
    }
  
    const insertResult = await client.query(
      `INSERT INTO transactions (account_id, amount, type)
       VALUES ($1, $2, $3)
       RETURNING *`,
       [accountId, amount, type]
    );
  
    await client.query('COMMIT');
  
    return {
      transaction: insertResult.rows[0],
      balance: updateResult.rows[0].balance
    };
  } catch(err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.release();
  }
}

export async function getTransactionsByAccount(accountId: number, userId: number) {
  const result = await pool.query(
    `
      SELECT t.*
      FROM transactions t
      JOIN accounts a on t.account_id = a.id
      WHERE t.account_id = $1
      AND a.user_id = $2
    `,
    [accountId, userId]
  );

  return result.rows;
}