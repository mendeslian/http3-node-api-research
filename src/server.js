import 'dotenv/config';
import { createServer } from 'node:http';

import { createApp } from './app.js';
import { logger } from './config/logger.js';

const app = createApp();
const server = createServer(app);

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, '0.0.0.0', () => {
  logger.info({ port: PORT }, 'Servidor em execução');
});
