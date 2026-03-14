import express from 'express';

import { echo } from '../controllers/echoController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const v1Router = express.Router();

v1Router.post('/echo', asyncHandler(echo));

export { v1Router };
