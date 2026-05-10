import { spawnSync } from 'node:child_process';

const protocols = (process.env.PROTOCOLS ?? 'h1-proxy,h2,h3')
  .split(',')
  .map((protocol) => protocol.trim())
  .filter(Boolean);

for (const protocol of protocols) {
  console.log(`\n=== Benchmark ${protocol} ===\n`);

  const result = spawnSync('node', ['benchmarks/h2load/run.js', protocol], {
    encoding: 'utf8',
    shell: false,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
