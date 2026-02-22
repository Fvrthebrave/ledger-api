import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../users/users.service';

const JWT_SECRET = process.env.JWT_SECRET;

export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);

  if(!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if(!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
}
