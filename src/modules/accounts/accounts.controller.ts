import { Request, Response } from 'express';
import {
  createAccount,
  getAccountById,
  getAccountBalanceForUser,
  transferBetweenAccounts
} from './accounts.service';

export async function handleCreateAccount(req: Request, res: Response) {
  try {
    const name = req.body.name
    const userId = (req as any).user.userId;

    if(!userId || !name) {
      return res.status(400).json({ error: 'userID and name are required' });
    }

    const account = await createAccount(userId, name);
    res.status(201).json(account);
  } catch(err: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleGetAccountById(req: Request, res: Response) {
  const accountId = Number(req.params.id);

  if(!accountId) {
    return res.status(400).json({ error: 'userID is required' });
  }

  const account = await getAccountById(accountId);

  if(!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.status(201).json(account);
}

export async function handleGetAccountBalanceForUser(req: Request, res: Response) {
  try {
    const accountId = Number(req.params.id);
    const userId = req.user!.userId;
  
    const balance = await getAccountBalanceForUser(accountId, userId);
    res.json({ balance });
  }catch(err: any) {
    if(err.message === 'Unauthorized or invalid account') {
      return res.status(403).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleTransfer(req: Request, res: Response) {
  try {
    const { transferId, fromAccountId, toAccountId, amount } = req.body;
    const userId = req.user!.userId;

    if(!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const result = await transferBetweenAccounts(
      transferId,
      Number(fromAccountId),
      Number(toAccountId),
      userId,
      Number(amount)
    );

    res.status(200).json(result);
  } catch(err: any) {
    res.status(400).json({ error: err.message });
  }
}

