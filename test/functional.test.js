import assert from 'node:assert/strict';
import test from 'node:test';

// Suite de testes FUNCIONAIS (sem focar em protocolo).
// Roda tanto em "direct(app)" quanto "via proxy", dependendo de TEST_URL.
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

const { createApp } = await import('../src/app.js');
const { db } = await import('../src/config/database.js');
const { makeRequester, getTestTarget } = await import('./helpers/httpClient.js');
const { makeDbQueries } = await import('./helpers/dbQueries.js');

const app = createApp();
const http = makeRequester(app);

const { getUsersCount, getMinUserId, getMaxUserId } = makeDbQueries(db);

test('meta: imprime target em uso (direct vs proxy)', () => {
  const target = getTestTarget();
  assert.ok(true, `Testing target: ${target ?? 'direct(app)'} `);
});

test('GET /health retorna ok', async () => {
  const res = await http.get('/health').expect(200);
  assert.equal(res.body.status, 'ok');
  assert.equal(typeof res.body.time, 'string');
});

test('POST /v1/echo ecoa mensagem', async () => {
  const res = await http.post('/v1/echo').send({ message: 'ola' }).expect(200);
  assert.deepEqual(res.body, { echo: 'ola' });
});

test('POST /v1/echo valida body', async () => {
  const res = await http.post('/v1/echo').send({}).expect(400);
  assert.equal(res.body.error, 'ValidationError');
  assert.ok(Array.isArray(res.body.details));
});

test('GET /users busca até o tamanho máximo permitido', async () => {
  const maxListSize = Number(process.env.MAX_LIST_SIZE ?? 5000);
  const requestedSize = maxListSize * 10;
  const total = await getUsersCount();
  const expected = Math.min(total, maxListSize);

  const res = await http.get(`/users?size=${requestedSize}`).expect(200);

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
  const minId = await getMinUserId();
  if (minId === null) {
    await http.get('/users/1').expect(404);
    return;
  }

  const res = await http.get(`/users/${minId}`).expect(200);
  assert.equal(typeof res.body.id, 'number');
  assert.equal(res.body.id, Number(minId));

  const maxId = await getMaxUserId();
  const missingId = maxId === null ? 999999 : Number(maxId) + 999999;
  await http.get(`/users/${missingId}`).expect(404);
});

test('POST /users cria usuário e permite lookup', async () => {
  const stamp = String(Date.now());
  const body = {
    name: `Alice ${stamp}`,
    email: `alice.${stamp}@example.test`,
    bio: 'Hello',
  };

  const created = await http.post('/users').send(body).expect(201);
  const lookup = await http.get(`/users/${created.body.id}`).expect(200);
  assert.deepEqual(lookup.body, created.body);

  // Cleanup: evita "sujar" o banco com usuários de teste.
  const DB_SCHEMA = process.env.DB_SCHEMA ?? 'dev';
  const DB_USERS_TABLE = process.env.DB_USERS_TABLE ?? 'user';
  await db(DB_USERS_TABLE).withSchema(DB_SCHEMA).where({ id: created.body.id }).del();
});

test('GET /delay retorna delayedMs configurado', async () => {
  const res = await http.get('/delay?ms=5').expect(200);
  assert.equal(res.body.delayedMs, 5);
});

test('GET /compute retorna resultado determinístico', async () => {
  const res = await http.get('/compute?iterations=1000').expect(200);
  assert.equal(res.body.iterations, 1000);
  assert.equal(res.body.result, 499500);
});

test('GET /stream retorna dados em chunks', async () => {
  const res = await http
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

