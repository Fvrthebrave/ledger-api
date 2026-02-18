import app from './app'
import { pool } from './config/db';

const PORT = process.env.PORT;

app.listen(PORT, async() => {
  try {
    await pool.query('SELECT 1');
    console.log(`Server running on port ${PORT}`);
  } catch(err) {
    console.log(err);
  }
});