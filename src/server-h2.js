import 'dotenv/config';
import { createSecureServer } from 'node:http2';

import { createApp } from './app.js';
import { db } from './config/database.js';
import { logger } from './config/logger.js';

// Para rodar H2 nativo no Node, precisamos de certificados (mesmo que auto-assinados)
// No cenário com proxy (ex: NGINX), o proxy pode fazer o TLS. Aqui é para teste direto.
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
    'Servidor em execução com suporte a HTTP/2',
  );

  try {
    await db.raw('SELECT 1');
    logger.info(
      { host: process.env.DB_HOST, db: process.env.DB_NAME },
      'Banco de dados conectado',
    );
  } catch (err) {
    logger.error({ err }, 'Falha ao conectar ao banco de dados');
  }
});
