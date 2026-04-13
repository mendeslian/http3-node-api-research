import 'dotenv/config';
import { createSecureServer } from 'node:http2';

import { createApp } from './app.js';
import { db } from './config/database.js';
import { logger } from './config/logger.js';

// Para rodar H2 nativo no Node, precisamos de certificados (mesmo que auto-assinados)
// No cenário com Caddy, o Caddy já faz o TLS. Aqui é para teste direto.
const options = {
  // key: readFileSync('server.key'),
  // cert: readFileSync('server.crt'),
  allowHTTP1: true,
};

const app = createApp();

// Nota: O Express não suporta o módulo 'http2' nativamente sem um bridge.
// Este é um exemplo de como seria a estrutura base.
const server = createSecureServer(options, (req, res) => {
  app(req, res);
});

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, '0.0.0.0', async () => {
  logger.info(
    { port: PORT, protocol: 'HTTP/2' },
    'Server is running with HTTP/2 Support',
  );

  try {
    await db.raw('SELECT 1');
    logger.info(
      { host: process.env.DB_HOST, db: process.env.DB_NAME },
      'Database connected',
    );
  } catch (err) {
    logger.error({ err }, 'Database connection failed');
  }
});
