import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { requestMetrics } from './middlewares/requestMetrics.js';
import { routes } from './routes/index.js';

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY_HOPS);

  app.use(requestLogger);
  app.use(requestMetrics);
  app.use(helmet());
  app.use(cors());
  app.use(compression());

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    rateLimit({
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
      max: Number(process.env.RATE_LIMIT_MAX ?? 100),
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { createApp };
