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
    SELECT * FROM users WHERE id = $1`, 
    [accountId]
  );

  return result.rows[0];
}

export async function getAccountBalance(accountId: number) {
  const result = await pool.query(`
      SELECT COALESCE(SUM(
        CASE
          WHEN type = 'credit' THEN amount
          WHEN type = 'debit' THEN -amount
        END
      ), 0) as balance
      FROM transactions
      WHERE account_id = $1`,
      [accountId]
    );

    return result.rows[0].balance;
}