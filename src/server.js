import 'dotenv/config';
import { createServer } from 'node:http';

import { createApp } from './app.js';
import { db } from './config/database.js';
import { logger } from './config/logger.js';

const app = createApp();
const server = createServer(app);

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, async () => {
  logger.info({ port: PORT }, 'Server is running');

  try {
    await db.raw('SELECT 1');
    logger.info({ host: process.env.DB_HOST, db: process.env.DB_NAME }, 'Database connected');
  } catch (err) {
    logger.error({ err }, 'Database connection failed');
  }
});
