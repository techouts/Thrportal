import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool.js';

export async function listUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const { rows } = await pool.query('SELECT id, email, created_at FROM users ORDER BY id ASC LIMIT 100');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as { email: string };
    const { rows } = await pool.query(
      'INSERT INTO users (email) VALUES ($1) RETURNING id, email, created_at',
      [email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}
