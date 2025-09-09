import express from 'express';
import { router as usersRouter } from './routes/users.js';
import { router as authRouter } from './routes/auth.js';

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.send('Hello World');
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);

  return app;
};
