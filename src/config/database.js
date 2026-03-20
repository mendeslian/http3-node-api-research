import 'dotenv/config';
import knex from 'knex';

const sslEnabled =
  (process.env.DB_SSL ?? '').toLowerCase() === 'true' ||
  process.env.DB_SSL === '1';
const sslRejectUnauthorized =
  (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'false').toLowerCase() ===
    'true' || process.env.DB_SSL_REJECT_UNAUTHORIZED === '1';

export const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'http3_research',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    ...(sslEnabled
      ? { ssl: { rejectUnauthorized: sslRejectUnauthorized } }
      : {}),
  },
  pool: { min: 0, max: 10 },
});
