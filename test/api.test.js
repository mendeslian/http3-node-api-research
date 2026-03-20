import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

const { createApp } = await import('../src/app.js');

test('GET /health retorna ok', async () => {
  const app = createApp();

  const res = await request(app).get('/health').expect(200);

  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.time, 'string');
});

test('POST /v1/echo ecoa mensagem', async () => {
  const app = createApp();

  const res = await request(app)
    .post('/v1/echo')
    .send({ message: 'ola' })
    .expect(200);

  assert.deepEqual(res.body, { echo: 'ola' });
});

test('POST /v1/echo valida body', async () => {
  const app = createApp();

  const res = await request(app).post('/v1/echo').send({}).expect(400);

  assert.equal(res.body.error, 'ValidationError');
  assert.ok(Array.isArray(res.body.details));
});

test('GET /users respeita size e retorna determinístico', async () => {
  const app = createApp();

  const res = await request(app).get('/users?size=10').expect(200);

  assert.equal(Array.isArray(res.body), true);
  assert.equal(res.body.length, 10);
  assert.equal(res.body[0].id, '1');
  assert.equal(res.body[9].id, '10');
});

test('GET /users/:id retorna usuário seed e 404 quando não existe', async () => {
  const app = createApp();

  const res = await request(app).get('/users/1').expect(200);
  assert.equal(res.body.id, '1');
  assert.equal(typeof res.body.bio, 'string');

  await request(app).get('/users/999999').expect(404);
});

test('POST /users é determinístico (mesmo body => mesmo id) e permite lookup', async () => {
  const app = createApp();

  const body = { name: 'Alice', email: 'alice@example.test' };

  const res1 = await request(app).post('/users').send(body).expect(201);
  const res2 = await request(app).post('/users').send(body).expect(201);

  assert.equal(typeof res1.body.id, 'string');
  assert.ok(res1.body.id.startsWith('c_'));
  assert.equal(res1.body.id, res2.body.id);

  const lookup = await request(app).get(`/users/${res1.body.id}`).expect(200);
  assert.deepEqual(lookup.body, res1.body);
});

test('GET /delay retorna delayedMs configurado', async () => {
  const app = createApp();

  const res = await request(app).get('/delay?ms=5').expect(200);
  assert.equal(res.body.delayedMs, 5);
});

test('GET /compute retorna resultado determinístico', async () => {
  const app = createApp();

  const res = await request(app).get('/compute?iterations=1000').expect(200);
  assert.equal(res.body.iterations, 1000);
  assert.equal(res.body.result, 499500);
});

test('GET /stream retorna dados em chunks', async () => {
  const app = createApp();

  const res = await request(app)
    .get('/stream?chunks=3&chunkSize=5')
    .buffer(true)
    .parse((stream, cb) => {
      let data = '';
      stream.setEncoding('utf8');
      stream.on('data', (chunk) => {
        data += chunk;
      });
      stream.on('end', () => cb(null, data));
    })
    .expect(200);

  assert.ok(res.body.includes('000000:'));
  assert.ok(res.body.includes('000001:'));
  assert.ok(res.body.includes('000002:'));
});
