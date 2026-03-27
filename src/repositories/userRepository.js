import { db } from '../config/database.js';

const TABLE = 'users';

function buildSeedUser(i) {
  const createdAt = new Date('2026-03-20T21:44:14.777Z').toISOString();
  return {
    id: i,
    name: `User ${i}`,
    email: `user${i}@email.com`,
    bio: `Bio do usuário ${i}`,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

const seedUsers = Array.from({ length: 1000 }, (_, idx) =>
  buildSeedUser(idx + 1),
);
const customUsers = new Map();
let nextId = seedUsers.length + 1;

const memRepo = {
  findAll: (limit) => Promise.resolve(seedUsers.slice(0, limit)),
  findById: (id) => {
    const n = Number(id);
    if (Number.isInteger(n) && n >= 1 && n <= seedUsers.length) {
      return Promise.resolve(seedUsers[n - 1]);
    }
    return Promise.resolve(customUsers.get(String(id)));
  },
  create: (input) => {
    const id = nextId;
    nextId += 1;
    const now = new Date().toISOString();
    const user = {
      id,
      name: input.name,
      email: input.email,
      bio: input.bio,
      created_at: now,
      updated_at: now,
    };
    customUsers.set(String(id), user);
    return Promise.resolve(user);
  },
};

const isTest = process.env.NODE_ENV === 'test';

function findAll(limit) {
  if (isTest) return memRepo.findAll(limit);
  return db(TABLE)
    .select('id', 'name', 'email', 'bio', 'created_at', 'updated_at')
    .orderBy('id', 'asc')
    .limit(limit);
}

function findById(id) {
  if (isTest) return memRepo.findById(id);
  return db(TABLE)
    .select('id', 'name', 'email', 'bio', 'created_at', 'updated_at')
    .where({ id })
    .first();
}

async function create(input) {
  if (isTest) return memRepo.create(input);
  const inserted = await db(TABLE)
    .insert({
      name: input.name,
      email: input.email,
      bio: input.bio,
    })
    .returning(['id', 'name', 'email', 'bio', 'created_at', 'updated_at']);
  return inserted[0];
}

export { create, findAll, findById };
