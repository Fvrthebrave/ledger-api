import { Request, Response } from 'express';
import {
  AccountNotFoundError,
  createAccount,
  DuplicateTransferError,
  getAccountById,
  getAccountBalanceForUser,
  InsufficientFundsError,
  InvalidTransferError,
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
    return res.status(400).json({ error: 'AccountId is required' });
  }

  const account = await getAccountById(accountId);

  if(!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  res.status(200).json(account);
}

export async function handleGetAccountBalanceForUser(req: Request, res: Response) {
  try {
    const accountId = Number(req.params.id);
    const userId = req.user!.userId;

    if (!Number.isInteger(accountId)) {
      return res.status(400).json({ error: 'Invalid account id' });
    }


    const balance = await getAccountBalanceForUser(accountId, userId);
    res.status(200).json({ balance });
  } catch (err: any) {
    if (err instanceof AccountNotFoundError) {
      return res.status(404).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleTransfer(req: Request, res: Response) {
  try {
    const { transferId, fromAccountId, toAccountId, amountCents } = req.body;
    const userId = req.user!.userId;

    const parsedFromId = Number(fromAccountId);
    const parsedToId = Number(toAccountId);
    const parsedAmount = Number(amountCents);

    if (
      typeof transferId !== 'string' ||
      !Number.isInteger(parsedFromId) ||
      !Number.isInteger(parsedToId) ||
      !Number.isInteger(parsedAmount)
    ) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }


    const result = await transferBetweenAccounts(
      transferId,
      parsedFromId,
      parsedToId,
      userId,
      parsedAmount
    );

    res.status(200).json(result);
  } catch(err: any) {
    if(err instanceof InvalidTransferError) {
      return res.status(400).json({ error: err.message });
    }

    if(err instanceof DuplicateTransferError) {
      return res.status(409).json({ error: err.message });
    }

    if(err instanceof InsufficientFundsError) {
      return res.status(422).json({ error: err.message });
    }

    if(err instanceof AccountNotFoundError) {
      return res.status(404).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
