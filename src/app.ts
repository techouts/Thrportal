import express from 'express';
import { router as aggregateRoutes } from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.send('Hello World');
  });

  app.use('/api', aggregateRoutes);

  return app;
};
