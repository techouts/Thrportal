// pool.ts
import 'dotenv/config';
import { Pool } from 'pg';

// const databaseUrl = process.env.DATABASE_URL;

// if (!databaseUrl) {
//   console.warn('DATABASE_URL not set. DB routes will error if called.');
// }

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // optional, can override below values
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5433,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password',
  database: process.env.PGDATABASE || 'THr',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
