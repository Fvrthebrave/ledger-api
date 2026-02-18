import app from './app'
import { pool } from './config/db';

const PORT = process.env.PORT;

app.listen(PORT, async() => {
  app.listen(3001, () => console.log('Listening'));
});