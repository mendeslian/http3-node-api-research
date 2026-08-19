import assert from 'node:assert/strict';
import { before, describe, test } from 'node:test';

import {
  API_URL,
  PROXY_URL,
  fetchH1Health,
  fetchH3Health,
  fetchHttpsHealth,
  fetchProxyHeaders,
  hasCurl,
  hasDocker,
  nginxLogsContainHttp3,
  waitForUrl,
} from './helpers/docker.js';

describe('protocolo H3 vs H1', { concurrency: 1 }, () => {
  before(() => {
    assert.ok(
      hasDocker(),
      'Docker não está rodando. Inicie o Docker Desktop e tente novamente.',
    );
    assert.ok(hasCurl(), 'curl não encontrado no PATH.');
  });

  test('API H1 responde', async () => {
    await waitForUrl(`${API_URL}/health`);
    const body = fetchH1Health();
    assert.equal(body.status, 'ok');
  });

  test('proxy HTTPS responde', async () => {
    await waitForUrl(`${PROXY_URL}/health`);
    const body = fetchHttpsHealth();
    assert.equal(body.status, 'ok');
  });

  test('H3: resposta equivalente ao H1', () => {
    const h1 = fetchH1Health();
    const { body: h3 } = fetchH3Health();

    assert.equal(h3.status, h1.status);
    assert.equal(typeof h3.time, 'string');
    assert.equal(typeof h1.time, 'string');
  });

  test('H3: Alt-Svc anuncia h3 na porta 8443', () => {
    const headers = fetchProxyHeaders();
    const altSvc = headers['alt-svc'];

    assert.ok(typeof altSvc === 'string', 'Header Alt-Svc ausente');
    assert.ok(altSvc.includes('h3=":8443"'), `Alt-Svc inesperado: ${altSvc}`);
  });

  test('H3: protocolo confirmado via cliente QUIC', () => {
    const { method } = fetchH3Health();
    assert.ok(['curl', 'h2load'].includes(method), `Método inesperado: ${method}`);
  });

  test('H3: logs NGINX registram HTTP/3.0', () => {
    fetchH3Health();
    assert.ok(
      nginxLogsContainHttp3(),
      'Logs do NGINX não contêm protocol="HTTP/3.0". Rode: docker compose logs nginx',
    );
  });
});
