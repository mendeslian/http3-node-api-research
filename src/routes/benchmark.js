import express from 'express';

import { compute, delay, stream } from '../controllers/benchmarkController.js';
import {
  createUser,
  getUser,
  getUsers,
} from '../controllers/usersController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const benchmarkRouter = express.Router();

benchmarkRouter.get('/users', asyncHandler(getUsers));
benchmarkRouter.get('/users/:id', asyncHandler(getUser));
benchmarkRouter.post('/users', asyncHandler(createUser));

benchmarkRouter.get('/delay', asyncHandler(delay));
benchmarkRouter.get('/compute', asyncHandler(compute));
benchmarkRouter.get('/stream', asyncHandler(stream));

export { benchmarkRouter };
