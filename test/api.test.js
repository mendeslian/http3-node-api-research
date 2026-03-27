import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

const { createApp } = await import('../src/app.js');
const { db } = await import('../src/config/database.js');

const DB_SCHEMA = process.env.DB_SCHEMA ?? 'dev';
const DB_USERS_TABLE = process.env.DB_USERS_TABLE ?? 'user';

async function getUsersCount() {
  const row = await db(DB_USERS_TABLE)
    .withSchema(DB_SCHEMA)
    .count('* as c')
    .first();
  return Number(row?.c ?? 0);
}

async function getMinUserId() {
  const row = await db(DB_USERS_TABLE)
    .withSchema(DB_SCHEMA)
    .select('id')
    .first();
  return row?.id ?? null;
}

async function getMaxUserId() {
  const row = await db(DB_USERS_TABLE)
    .withSchema(DB_SCHEMA)
    .select('id')
    .orderBy('id', 'desc')
    .first();
  return row?.id ?? null;
}

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

test('GET /users busca até o tamanho máximo permitido', async () => {
  const app = createApp();

  const maxListSize = Number(process.env.MAX_LIST_SIZE ?? 5000);
  const requestedSize = maxListSize * 10;
  const total = await getUsersCount();
  const expected = Math.min(total, maxListSize);

  const res = await request(app)
    .get(`/users?size=${requestedSize}`)
    .expect(200);

  assert.equal(Array.isArray(res.body), true);
  assert.equal(res.body.length, expected);
  if (expected >= 1) {
    const u = res.body[0];
    assert.equal(typeof u.id, 'number');
    assert.equal(typeof u.name, 'string');
    assert.equal(typeof u.email, 'string');
    assert.equal(typeof u.bio, 'string');
    assert.equal(typeof u.created_at, 'string');
    assert.equal(typeof u.updated_at, 'string');
  }
  for (let i = 1; i < res.body.length; i += 1) {
    assert.ok(res.body[i].id >= res.body[i - 1].id);
  }
});

test('GET /users/:id retorna usuário seed e 404 quando não existe', async () => {
  const app = createApp();

  const minId = await getMinUserId();
  if (minId === null) {
    await request(app).get('/users/1').expect(404);
    return;
  }

  const res = await request(app).get(`/users/${minId}`).expect(200);
  assert.equal(typeof res.body.id, 'number');
  assert.equal(res.body.id, Number(minId));
  assert.equal(typeof res.body.name, 'string');
  assert.equal(typeof res.body.email, 'string');
  assert.equal(typeof res.body.bio, 'string');
  assert.equal(typeof res.body.created_at, 'string');
  assert.equal(typeof res.body.updated_at, 'string');

  const maxId = await getMaxUserId();
  const missingId = maxId === null ? 999999 : Number(maxId) + 999999;
  await request(app).get(`/users/${missingId}`).expect(404);
});

test('POST /users cria usuário e permite lookup', async () => {
  const app = createApp();

  const stamp = String(Date.now());
  const body = {
    name: `Alice ${stamp}`,
    email: `alice.${stamp}@example.test`,
    bio: 'Hello',
  };

  const created = await request(app).post('/users').send(body).expect(201);

  assert.equal(typeof created.body.id, 'number');
  assert.equal(created.body.name, body.name);
  assert.equal(created.body.email, body.email);
  assert.equal(created.body.bio, body.bio);

  const lookup = await request(app)
    .get(`/users/${created.body.id}`)
    .expect(200);
  assert.deepEqual(lookup.body, created.body);

  await db(DB_USERS_TABLE)
    .withSchema(DB_SCHEMA)
    .where({ id: created.body.id })
    .del();
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
