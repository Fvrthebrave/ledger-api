
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../app';
import { pool } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET as string;

function generateTestToken(userId: number) {
  return jwt.sign(
    {userId},
    JWT_SECRET,
    { expiresIn: '1h' }
  )
};

describe("Transactions API", async () => {

  beforeEach(async () => {
    await pool.query('DELETE FROM transactions');
    await pool.query('DELETE FROM accounts');
    await pool.query('DELETE FROM users');
  });

  // seed test user and account
  const user = await pool.query(
    `
    INSERT INTO users (email, password)
    VALUES ('test@test.com, 'ashed')
    RETURNING id
    `
  );

  await pool.query(
    `
    INSERT INTO accounts (id, user_id, balance)
    VALUES (1, $1, 100)
    `,
    [user.rows[0].id]
  );

  it('should credit account', async () => {
    const userId = user.rows[0].id;
    const token = generateTestToken(userId);

    const res = await request(app)
      .post('/transactions')
      .set('Authorization', 'Bearer ${token}')
      .send({
        accountId: 1,
        amount: 50,
        type: 'credit'
      });

      expect(res.status).toBe(201);
      expect(res.body.balance).toBe(150);
  });

  it('should reject missing token', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        accountId: 1,
        amount: 50,
        type: 'credit'
      });

      expect(res.status).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
    .post('/transactions')
    .set('Authrorization', 'Bearer invalidToken')
    .send({
      accountId: 1,
      amount: 50,
      type: 'credit'
    });

    expect(res.status).toBe(401);
  });
});