import { pool } from '../../config/db';

export async function createTransaction(
  accountId: number,
  amount: number,
  type: 'credit' | 'debit'
) {
  const result = await pool.query(
    `
    INSERT INTO transactions (account_id, amount, type)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [accountId, amount, type]
  );

  return result.rows[0];
}

export async function getTransactionsByAccount(accountId: number) {
  const result = await pool.query(
    `
      SELECT * FROM transactions
      WHERE account_id = $1
      ORDER BY created_at DESC
    `,
    [accountId]
  );

  return result.rows;
}