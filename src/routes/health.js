import express from 'express';

import { db } from '../config/database.js';

const healthRouter = express.Router();

healthRouter.get('/', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

healthRouter.get('/db', async (req, res) => {
  const startedAt = Date.now();
  try {
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      db: 'ok',
      time: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      db: 'down',
      time: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
    });
  }
});

export { healthRouter };
