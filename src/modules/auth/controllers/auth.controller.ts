import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../../employee/models/user.model.js';

// Simple login without hashing (for initial setup). Consider hashing later.
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("check")
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    console.log(JSON.stringify(user),"hell");
    console.log(user,"user")
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



