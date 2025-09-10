import { Sequelize } from 'sequelize';
import "../modules/auth/models/user.model.ts";

// Mirror pool.ts behavior: allow DATABASE_URL override, otherwise use individual vars with same defaults
export const sequelize =  new Sequelize(
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
 try {
    await sequelize.authenticate();
    
    // Create tables automatically (without dropping existing data)
    await sequelize.sync({ alter: true });
    console.log("✅ All models were synchronized successfully");
  } catch (error) {
    console.error("❌ Sequelize connection failed:", error);
    throw error;
  }
}


