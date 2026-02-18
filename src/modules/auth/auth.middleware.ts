import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not defined in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;
interface TokenPayload extends JwtPayload {
  userId: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if(!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    req.user = {
      userId: decoded.userId
    }

    next();
  } catch(err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}