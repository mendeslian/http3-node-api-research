function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePositiveInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function getDelayMs(queryMs) {
  const parsed = parsePositiveInt(queryMs);
  const ms = parsed ?? Number(process.env.DEFAULT_DELAY_MS ?? 0);
  return Math.min(ms, Number(process.env.MAX_DELAY_MS ?? 60_000));
}

function getComputeIterations(queryIterations) {
  const parsed = parsePositiveInt(queryIterations);
  const it = parsed ?? Number(process.env.DEFAULT_COMPUTE_ITERATIONS ?? 50_000);
  return Math.min(it, Number(process.env.MAX_COMPUTE_ITERATIONS ?? 50_000_000));
}

function computeWork(iterations) {
  let acc = 0;
  for (let i = 0; i < iterations; i += 1) {
    acc = (acc + i) % 1_000_003;
  }
  return acc;
}

function getStreamConfig(query) {
  const chunks = Math.min(
    parsePositiveInt(query?.chunks) ?? Number(process.env.DEFAULT_STREAM_CHUNKS ?? 10),
    Number(process.env.MAX_STREAM_CHUNKS ?? 10_000),
  );
  const chunkSize = Math.min(
    parsePositiveInt(query?.chunkSize) ?? Number(process.env.DEFAULT_STREAM_CHUNK_SIZE ?? 1024),
    Number(process.env.MAX_STREAM_CHUNK_SIZE ?? 262_144),
  );
  return { chunks, chunkSize };
}

async function streamChunks({ req, res, chunks, chunkSize }) {
  const chunk = Buffer.alloc(chunkSize, 'z');
  let aborted = false;

  req.on('close', () => {
    aborted = true;
  });

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-store');

  for (let i = 0; i < chunks; i += 1) {
    if (aborted) return;
    const header = Buffer.from(`${String(i).padStart(6, '0')}:`);
    res.write(header);
    res.write(chunk);
    res.write('\n');
    await new Promise((resolve) => setImmediate(resolve));
  }

  res.end();
}

export {
  computeWork,
  getComputeIterations,
  getDelayMs,
  getStreamConfig,
  sleep,
  streamChunks,
};
