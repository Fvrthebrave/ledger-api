import express from 'express';
import usersRoutes from './modules/users/users.routes';
import accountRoutes from './modules/accounts/accounts.routes';
import transRoutes from './modules/transactions/transactions.routes';
import authRoutes from './modules/auth/auth.routes';
import { authenticate } from './modules/auth/auth.middleware';
import  cors  from 'cors';
const app = express();


app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'  
}));

app.use('/login', authRoutes);
app.use('/users', authenticate, usersRoutes);
app.use('/accounts', authenticate, accountRoutes);
app.use('/transactions', authenticate, transRoutes);

export default app;