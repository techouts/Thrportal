import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

// Simple login without hashing (for initial setup). Consider hashing later.
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("check")
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const foundUser = await User.findOne({ where: { email } });
    const user = foundUser?.toJSON();
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '7d' });
    return res.json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response) {
  return res.json({ user: req.user });
}



