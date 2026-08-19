import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

const { createApp } = await import('../src/app.js');
const app = createApp();

test('GET /health retorna ok', async () => {
  const res = await request(app).get('/health').expect(200);
  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.time, 'string');
});

test('POST /v1/echo ecoa mensagem', async () => {
  const res = await request(app).post('/v1/echo').send({ message: 'ola' }).expect(200);
  assert.deepEqual(res.body, { echo: 'ola' });
});

test('POST /v1/echo valida body', async () => {
  const res = await request(app).post('/v1/echo').send({}).expect(400);
  assert.equal(res.body.error, 'ValidationError');
  assert.ok(Array.isArray(res.body.details));
});
