import { logger } from '../config/logger.js';

function chunkLength(chunk, encoding) {
  if (!chunk) return 0;
  if (Buffer.isBuffer(chunk)) return chunk.length;
  return Buffer.byteLength(String(chunk), encoding);
}

function requestMetrics(req, res, next) {
  const start = process.hrtime.bigint();
  let bytesSent = 0;

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  res.write = (chunk, encoding, cb) => {
    const enc = typeof encoding === 'string' ? encoding : undefined;
    bytesSent += chunkLength(chunk, enc);
    return originalWrite(chunk, encoding, cb);
  };

  res.end = (chunk, encoding, cb) => {
    const enc = typeof encoding === 'string' ? encoding : undefined;
    bytesSent += chunkLength(chunk, enc);
    return originalEnd(chunk, encoding, cb);
  };

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const log = req?.log ?? logger;
    log.info(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        bytesSent,
      },
      'metricas_requisicao',
    );
  });

  next();
}

export { requestMetrics };
