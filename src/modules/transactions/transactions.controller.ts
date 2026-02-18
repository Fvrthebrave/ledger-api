import { Request, Response } from 'express';
import {
  createTransaction,
  getTransactionsByAccount
} from './transactions.service';

export async function handleCreateTransaction(req: Request, res: Response) {
  try {
    const { accountId, amount, type } = req.body;

    if(!accountId || !amount || !type) {
      return res.status(400).json({ error: 'Account ID, amount and type are required' });
    }

    if(!['credit', 'debit'].includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const transaction = await createTransaction(accountId, amount, type);
    res.status(201).json(transaction);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function handleGetTransactionsByAccount(req: Request, res: Response) {
  const accountId  = Number(req.params.accountId);

  const transactions = await getTransactionsByAccount(accountId);

  res.json(transactions);
}