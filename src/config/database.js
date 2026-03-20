import 'dotenv/config';
import knex from 'knex';


export const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST ?? '',
        port: Number(process.env.DB_PORT ?? 5432),
        database: process.env.DB_NAME ?? '',
        user: process.env.DB_USER ?? '',
        password: process.env.DB_PASSWORD ?? '',
        ssl: { rejectUnauthorized: false },
    },
    pool: { min: 0, max: 10 },
});
