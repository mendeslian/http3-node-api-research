import assert from 'node:assert/strict';
import test from 'node:test';

// Suite voltada ao "modo proxy".
// Ela não comprova que o tráfego foi HTTP/3 (porque Node/supertest não negociam h3),
// mas deixa bem claro quando você está testando "via proxy" e valida sinais
// importantes (ex.: Alt-Svc anunciando h3).

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

const { createApp } = await import('../src/app.js');
const { makeRequester, getTestTarget } = await import('./helpers/httpClient.js');

const app = createApp();
const http = makeRequester(app);

test('proxy: quando TEST_URL está setado, esperamos HTTPS e Alt-Svc', async () => {
  const target = getTestTarget();

  // Se você rodar sem proxy, esse teste só documenta e encerra.
  if (!target) {
    assert.ok(true, 'TEST_URL não definido -> pulando checks de proxy');
    return;
  }

  assert.ok(target.startsWith('https://'), 'Para proxy, use URL https://...');

  // Bate no /health só para capturar headers.
  const res = await http.get('/health').expect(200);

  // NGINX http3/quic anuncia via Alt-Svc para permitir upgrade do cliente para h3.
  const altSvc = res.headers['alt-svc'];
  assert.ok(typeof altSvc === 'string' && altSvc.includes('h3=":8443"'));
});

