import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

// Mirror pool.ts behavior: allow DATABASE_URL override, otherwise use individual vars with same defaults
export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions:
        process.env.NODE_ENV === 'production'
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
      logging: false,
    })
  : new Sequelize(
      process.env.PGDATABASE || 'THr',
      process.env.PGUSER || 'postgres',
      process.env.PGPASSWORD || 'password',
      {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5433,
        dialect: 'postgres',
        dialectOptions:
          process.env.NODE_ENV === 'production'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
        logging: false,
      }
    );

export async function connectSequelize() {
  await sequelize.authenticate();
}


