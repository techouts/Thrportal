import { createApp } from './app.js';

async function start() {
  const app = createApp();
  // No DB required for Hello World boilerplate

  const port = Number(process.env.PORT ?? 3004);
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start();
