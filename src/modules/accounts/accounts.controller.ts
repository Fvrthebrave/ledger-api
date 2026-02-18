import { Request, Response } from 'express';
import {
  createAccount,
  getAccountById,
  getAccountBalance
} from './accounts.service';

export async function handleCreateAccount(req: Request, res: Response) {
  try {
    const { userId, name } = req.body;

    if(!userId || !name) {
      return res.status(400).json({ error: 'userID and name are required' });
    }

    const account = await createAccount(userId, name);
    res.status(201).json(account);
  } catch(err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleGetAccountById(req: Request, res: Response) {
  const accountId = Number(req.params.id);

  if(!accountId) {
    res.status(400).json({ error: 'userID is required' });
  }

  const account = await getAccountById(accountId);

  if(!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.status(201).json(account);
}

export async function handleGetAccountBalance(req: Request, res: Response) {
  const accountId = Number(req.params.id);

  const balance = await getAccountBalance(accountId);
  res.json({ balance });
}

