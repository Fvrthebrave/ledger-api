import { Request, Response } from 'express';
import {
  createTransactionForUser,
  getTransactionsByAccount
} from './transactions.service';

export async function handleCreateTransaction(req: Request, res: Response) {
  try {
    const accountId = Number(req.body.accountId);
    const amount = Number(req.body.amount);
    const type = req.body.type as 'credit' || 'debit';

    const userId = req.user!.userId;

    if(!accountId || !amount || !type) {
      return res.status(400).json({ error: 'Account ID, amount and type are required' });
    }

    if(!['credit', 'debit'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const transaction = await createTransactionForUser(accountId, userId, amount, type);
    res.status(201).json(transaction);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function handleGetTransactionsByAccount(req: Request, res: Response) {
  const accountId  = Number(req.params.accountId);
  const userId = req.user!.userId;

  const transactions = await getTransactionsByAccount(accountId, userId);

  res.json(transactions);
}