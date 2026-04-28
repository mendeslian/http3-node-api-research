import { spawn } from 'node:child_process';

import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const forwardedEnvNames = [
  'BENCH_PROFILE',
  'BENCH_PATH',
  'DURATION',
  'RATE_FACTOR',
  'RATE',
  'PRE_ALLOCATED_VUS',
  'MAX_VUS',
  'SLEEP_MS',
  'REQUEST_TIMEOUT',
  'EXPECTED_STATUS',
  'MIN_BYTES',
  'THRESHOLD_P95',
  'FAILED_RATE',
  'USERS_SIZE',
  'STREAM_CHUNKS',
  'STREAM_CHUNK_SIZE',
  'COMPUTE_ITERATIONS',
  'DELAY_MS',
];

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

const targetUrl = readOption('--target') ?? process.env.TARGET_URL;
const args = ['run'];

if (hasFlag('--insecure')) {
  args.push('--insecure-skip-tls-verify');
}

if (targetUrl) {
  args.push('-e', `TARGET_URL=${targetUrl}`);
}

for (const name of forwardedEnvNames) {
  if (process.env[name]) {
    args.push('-e', `${name}=${process.env[name]}`);
  }
}

args.push('benchmarks/load-test.js');

const child = spawn('k6', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
