import { Request, Response } from 'express';
import { createUser } from './users.service';

export async function handleCreateUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if(!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await createUser(email, password);

    res.status(201).json(user);
  } catch(err: any) {
    if(err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
