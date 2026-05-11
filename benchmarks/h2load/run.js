import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const PROFILES = {
  smoke: {
    requests: 30,
    clients: 3,
    threads: 1,
    maxStreams: 1,
  },
  baseline: {
    requests: 300,
    clients: 20,
    threads: 2,
    maxStreams: 1,
  },
  high_rps: {
    requests: 1500,
    clients: 100,
    threads: 4,
    maxStreams: 1,
  },
};

const PROTOCOLS = new Set(['h1', 'h1-proxy', 'h2', 'h3']);

function readPositiveInt(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function readNonNegativeInt(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function getProtocol() {
  const protocol = (process.argv[2] ?? process.env.PROTOCOL ?? 'h1').toLowerCase();
  if (!PROTOCOLS.has(protocol)) {
    throw new Error(
      `Unsupported protocol "${protocol}". Use h1, h1-proxy, h2 or h3.`,
    );
  }
  return protocol;
}

function getProfile() {
  const profileName = process.env.PROFILE ?? 'baseline';
  return {
    name: profileName,
    config: PROFILES[profileName] ?? PROFILES.baseline,
  };
}

function getPath() {
  const scenario = process.env.SCENARIO ?? 'users_large_list';

  switch (scenario) {
    case 'health':
      return { scenario, path: '/health' };

    case 'server_delay': {
      const delayMs = readNonNegativeInt('DELAY_MS', 250);
      return { scenario, path: `/delay?ms=${delayMs}` };
    }

    case 'compute': {
      const iterations = readPositiveInt('COMPUTE_ITERATIONS', 50000);
      return { scenario, path: `/compute?iterations=${iterations}` };
    }

    case 'stream': {
      const chunks = readPositiveInt('STREAM_CHUNKS', 10);
      const chunkSize = readPositiveInt('STREAM_CHUNK_SIZE', 1024);
      return { scenario, path: `/stream?chunks=${chunks}&chunkSize=${chunkSize}` };
    }

    case 'users_large_list':
    default: {
      const usersSize = readPositiveInt('USERS_SIZE', 1000);
      return { scenario: 'users_large_list', path: `/users?size=${usersSize}` };
    }
  }
}

function getBaseUrl(protocol) {
  if (protocol === 'h1') {
    return process.env.H1_URL ?? 'http://host.docker.internal:3000';
  }

  if (protocol === 'h1-proxy') {
    return process.env.H1_PROXY_URL ?? 'https://host.docker.internal:8443';
  }

  if (protocol === 'h2') {
    return process.env.H2_URL ?? 'https://host.docker.internal:8443';
  }

  return process.env.H3_URL ?? 'https://host.docker.internal:8443';
}

function getDockerArgs(protocol, url, profile) {
  const requests = readPositiveInt('REQUESTS', profile.requests);
  const clients = readPositiveInt('CLIENTS', profile.clients);
  const threads = readPositiveInt('THREADS', profile.threads);
  const maxStreams = readPositiveInt('MAX_STREAMS', profile.maxStreams);
  const activeTimeout = readPositiveInt('ACTIVE_TIMEOUT', 30);
  const inactivityTimeout = readPositiveInt('INACTIVITY_TIMEOUT', 30);

  const args = ['run', '--rm', 'tvsjsdock/h2load-http3'];

  if (protocol === 'h1' || protocol === 'h1-proxy') {
    args.push('--h1');
  } else {
    args.push(`--npn-list=${protocol}`);
  }

  args.push(
    '-n',
    String(requests),
    '-c',
    String(clients),
    '-t',
    String(threads),
    '-m',
    String(maxStreams),
    '-T',
    String(activeTimeout),
    '-N',
    String(inactivityTimeout),
    url,
  );

  return {
    args,
    requests,
    clients,
    threads,
    maxStreams,
    activeTimeout,
    inactivityTimeout,
  };
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

const protocol = getProtocol();
const { name: profileName, config: profile } = getProfile();
const { scenario, path } = getPath();
const url = `${getBaseUrl(protocol)}${path}`;
const {
  args,
  requests,
  clients,
  threads,
  maxStreams,
  activeTimeout,
  inactivityTimeout,
} = getDockerArgs(protocol, url, profile);

const header = [
  `protocol=${protocol}`,
  `profile=${profileName}`,
  `scenario=${scenario}`,
  `requests=${requests}`,
  `clients=${clients}`,
  `threads=${threads}`,
  `maxStreams=${maxStreams}`,
  `activeTimeout=${activeTimeout}s`,
  `inactivityTimeout=${inactivityTimeout}s`,
  `url=${url}`,
  '',
].join('\n');

console.log(header);

const result = spawnSync('docker', args, {
  encoding: 'utf8',
  shell: false,
});

const output = `${header}${result.stdout ?? ''}${result.stderr ?? ''}`;
const resultsDir = join(process.cwd(), 'benchmarks', 'results');
mkdirSync(resultsDir, { recursive: true });

const resultPath = join(
  resultsDir,
  `${timestamp()}-${protocol}-${profileName}-${scenario}.txt`,
);
writeFileSync(resultPath, output);

process.stdout.write(result.stdout ?? '');
process.stderr.write(result.stderr ?? '');
console.log(`\nSaved result: ${resultPath}`);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
