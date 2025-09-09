import { createApp } from './app.js';

async function start() {
  const app = createApp();

  const port = Number(process.env.PORT ?? 3004);
  const host = "0.0.0.0"; // Allow external connections

  app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });
}

start();

