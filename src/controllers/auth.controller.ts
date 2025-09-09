import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';

// Simple login without hashing (for initial setup). Consider hashing later.
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const { rows } = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0] as { id: number; email: string; password: string };

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    next(err);
  }
}


