import { createApp } from './app.js';
import { connectSequelize } from './db/sequelize.js';

async function start() {
  const app = createApp();

  try {
    await connectSequelize();
    console.log('Sequelize connected');
  } catch (err) {
    console.error('Failed to connect to database (Sequelize):', err);
    process.exit(1);
  }

  const port = Number(process.env.PORT ?? 3004);
  const host = "0.0.0.0"; // Allow external connections

  app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });
}

start();

