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
  })
  .passthrough();

export const env = EnvSchema.parse(process.env);
