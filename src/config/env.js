import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .optional()
      .default('development'),
    PORT: z.coerce.number().int().positive().optional().default(3000),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).optional().default(1),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .optional()
      .default('info'),
    RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().optional().default(100),
    SEED_USERS_COUNT: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(1000),
    DEFAULT_LIST_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(100),
    MAX_LIST_SIZE: z.coerce.number().int().positive().optional().default(5000),
    DEFAULT_USER_BIO_SIZE: z.coerce
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(256),
    DEFAULT_DELAY_MS: z.coerce
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(0),
    MAX_DELAY_MS: z.coerce.number().int().positive().optional().default(60_000),
    DEFAULT_COMPUTE_ITERATIONS: z.coerce
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(50_000),
    MAX_COMPUTE_ITERATIONS: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(50_000_000),
    DEFAULT_STREAM_CHUNKS: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(10),
    MAX_STREAM_CHUNKS: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(10_000),
    DEFAULT_STREAM_CHUNK_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(1024),
    MAX_STREAM_CHUNK_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .optional()
      .default(256 * 1024),
  })
  .passthrough();

export const env = EnvSchema.parse(process.env);
