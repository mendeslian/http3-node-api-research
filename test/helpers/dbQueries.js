// Helpers para consultas usadas nos testes.
// Mantém `api.test.js` focado nos casos de uso, sem poluir com detalhes do DB.

export function makeDbQueries(db) {
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
    const row = await db(DB_USERS_TABLE).withSchema(DB_SCHEMA).select('id').first();
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

  return { getUsersCount, getMinUserId, getMaxUserId };
}

