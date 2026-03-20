import { z } from 'zod';

import {
  computeWork,
  getComputeIterations,
  getDelayMs,
  getStreamConfig,
  sleep,
  streamChunks,
} from '../services/benchmarkService.js';

const DelayQuerySchema = z.object({
  ms: z.coerce.number().int().positive().optional(),
});

const ComputeQuerySchema = z.object({
  iterations: z.coerce.number().int().positive().optional(),
});

const StreamQuerySchema = z
  .object({
    chunks: z.coerce.number().int().positive().optional(),
    chunkSize: z.coerce.number().int().positive().optional(),
  })
  .passthrough();

async function delay(req, res) {
  const query = DelayQuerySchema.parse(req.query);
  const ms = getDelayMs(query.ms);
  await sleep(ms);
  res.json({ delayedMs: ms });
}

async function compute(req, res) {
  const query = ComputeQuerySchema.parse(req.query);
  const iterations = getComputeIterations(query.iterations);
  const result = computeWork(iterations);
  res.json({ iterations, result });
}

async function stream(req, res) {
  const query = StreamQuerySchema.parse(req.query);
  const { chunks, chunkSize } = getStreamConfig(query);
  await streamChunks({ req, res, chunks, chunkSize });
}

export { compute, delay, stream };
