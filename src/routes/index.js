import express from 'express';

import { healthRouter } from './health.js';

const routes = express.Router();

routes.use('/health', healthRouter);

export { routes };
