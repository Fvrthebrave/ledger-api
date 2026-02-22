import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: dbUrl
});

pool.on('connect', () => {
  console.log('Connected to database');
})