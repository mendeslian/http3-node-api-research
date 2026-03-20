import express from 'express';

import { benchmarkRouter } from './benchmark.js';
import { healthRouter } from './health.js';
import { v1Router } from './v1.js';

const routes = express.Router();

routes.use('/health', healthRouter);
routes.use('/v1', v1Router);
routes.use(benchmarkRouter);

export { routes };
