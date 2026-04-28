import 'dotenv/config';

const sslEnabled =
    (process.env.DB_SSL ?? '').toLowerCase() === 'true' ||
    process.env.DB_SSL === '1';

const sslRejectUnauthorized =
    (process.env.DB_SSL_REJECT_UNAUTHORIZED ?? 'false').toLowerCase() === 'true' ||
    process.env.DB_SSL_REJECT_UNAUTHORIZED === '1';

export default {
    development: {
        client: 'pg',
        searchPath: [process.env.DB_SCHEMA ?? 'public'],
        connection: {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT ?? 5432),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ...(sslEnabled
                ? { ssl: { rejectUnauthorized: sslRejectUnauthorized } }
                : {}),
        },
        migrations: {
            directory: './migrations',
        },
    },
};