import { db } from '../config/database.js';

const TABLE = process.env.DB_USERS_TABLE ?? 'user';
const DB_SCHEMA = process.env.DB_SCHEMA ?? 'dev';

function normalizeUserRow(row) {
  if (!row) return row;
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : row.created_at;
  const updatedAt =
    row.updated_at instanceof Date
      ? row.updated_at.toISOString()
      : row.updated_at;
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    bio: row.bio,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

async function findAll(limit) {
  const rows = await db(TABLE)
    .withSchema(DB_SCHEMA)
    .select('id', 'name', 'email', 'bio', 'created_at', 'updated_at')
    .orderBy('id', 'asc')
    .limit(limit);
  return rows.map(normalizeUserRow);
}

async function findById(id) {
  const row = await db(TABLE)
    .withSchema(DB_SCHEMA)
    .select('id', 'name', 'email', 'bio', 'created_at', 'updated_at')
    .where({ id })
    .first();
  return normalizeUserRow(row);
}

async function create(input) {
  const inserted = await db(TABLE)
    .withSchema(DB_SCHEMA)
    .insert({
      name: input.name,
      email: input.email,
      bio: input.bio,
    })
    .returning(['id', 'name', 'email', 'bio', 'created_at', 'updated_at']);
  return normalizeUserRow(inserted[0]);
}

export { create, findAll, findById };
