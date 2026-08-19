import { spawnSync } from 'node:child_process';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const PROXY_URL = process.env.PROXY_URL ?? 'https://localhost:8443';
const HEALTH_PATH = '/health';
const COMPOSE_FILE = process.env.COMPOSE_FILE ?? 'docker-compose.yml';

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
    ...options,
  });
}

export function hasDocker() {
  const result = run('docker', ['info'], { stdio: 'ignore' });
  return result.status === 0;
}

export function hasCurl() {
  const result = run('curl', ['--version'], { stdio: 'ignore' });
  return result.status === 0;
}

export async function waitForUrl(url, attempts = 30, intervalMs = 1000) {
  for (let i = 0; i < attempts; i += 1) {
    const result = run('curl', ['-fsS', url]);
    if (result.status === 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`URL indisponível após ${attempts}s: ${url}`);
}

export function fetchH1Health() {
  const result = run('curl', ['-fsS', `${API_URL}${HEALTH_PATH}`]);
  if (result.status !== 0) {
    throw new Error(`Falha ao buscar H1 ${API_URL}${HEALTH_PATH}: ${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

export function fetchHttpsHealth() {
  const result = run('curl', ['-fsSk', `${PROXY_URL}${HEALTH_PATH}`]);
  if (result.status !== 0) {
    throw new Error(`Falha ao buscar HTTPS ${PROXY_URL}${HEALTH_PATH}: ${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

export function fetchProxyHeaders() {
  const result = run('curl', ['-fsSIk', `${PROXY_URL}${HEALTH_PATH}`]);
  if (result.status !== 0) {
    throw new Error(`Falha ao buscar headers do proxy: ${result.stderr}`);
  }

  const headers = {};
  for (const line of result.stdout.split('\n')) {
    const trimmed = line.replace(/\r$/, '');
    const separator = trimmed.indexOf(':');
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim().toLowerCase();
    const value = trimmed.slice(separator + 1).trim();
    headers[key] = value;
  }

  return headers;
}

export function fetchH3Health() {
  const curlResult = run('docker', [
    'run',
    '--rm',
    '--add-host=host.docker.internal:host-gateway',
    'curlimages/curl:latest',
    '--http3-only',
    '-fsSk',
    `https://host.docker.internal:8443${HEALTH_PATH}`,
  ]);

  if (curlResult.status === 0 && curlResult.stdout) {
    return { body: JSON.parse(curlResult.stdout), method: 'curl' };
  }

  const h2loadResult = run('docker', [
    'run',
    '--rm',
    '--add-host=host.docker.internal:host-gateway',
    'tvsjsdock/h2load-http3',
    '--npn-list=h3',
    '-n',
    '5',
    '-c',
    '1',
    '-t',
    '1',
    '-m',
    '1',
    `https://host.docker.internal:8443${HEALTH_PATH}`,
  ]);

  const output = `${h2loadResult.stdout ?? ''}${h2loadResult.stderr ?? ''}`;
  if (!/application protocol:\s*h3/i.test(output)) {
    throw new Error(`HTTP/3 não confirmado:\n${output}`);
  }

  const bodyResult = run('docker', [
    'run',
    '--rm',
    '--add-host=host.docker.internal:host-gateway',
    'curlimages/curl:latest',
    '--http3-only',
    '-fsSk',
    `https://host.docker.internal:8443${HEALTH_PATH}`,
  ]);

  if (bodyResult.status === 0 && bodyResult.stdout) {
    return { body: JSON.parse(bodyResult.stdout), method: 'h2load' };
  }

  return { body: fetchHttpsHealth(), method: 'h2load' };
}

export function nginxLogsContainHttp3() {
  const result = run('docker', ['compose', '-f', COMPOSE_FILE, 'logs', '--no-color', 'nginx']);
  if (result.status !== 0) {
    throw new Error(`Falha ao ler logs do NGINX: ${result.stderr}`);
  }
  return result.stdout.includes('protocol="HTTP/3.0"');
}

export { API_URL, PROXY_URL, HEALTH_PATH };
