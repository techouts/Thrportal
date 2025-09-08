import express from 'express';
import { router as usersRouter } from './routes/users.js';

export const createApp = () => {
  const app = express();

  app.get('/', (_req, res) => {
    res.send('Hello World');
  });

  app.use('/api/users', usersRouter);

  return app;
};
