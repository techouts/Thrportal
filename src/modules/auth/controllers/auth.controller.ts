import { Request, Response, NextFunction } from 'express';
import { loginUser } from '../services/auth.service.js';

// Simple login without hashing (for initial setup). Consider hashing later.
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
   const result = await loginUser(email, password);
   return res.json(result);
  } catch (err:any) {
    return res.status(401).json({ message: err.message || "Login failed" });
  }
}

export async function me(req: Request, res: Response) {
  return res.json({ user: req.user });
}



