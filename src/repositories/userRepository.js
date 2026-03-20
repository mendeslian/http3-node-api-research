import { db } from '../config/database.js';

const TABLE = 'users';

// ── Fallback em memória para NODE_ENV=test ────────────────────────────────────
function buildSeedUser(i) {
    const paddedId = String(i).padStart(6, '0');
    return {
        id: String(i),
        name: `User ${paddedId}`,
        email: `user${paddedId}@example.test`,
        bio: 'a'.repeat(Number(process.env.DEFAULT_USER_BIO_SIZE ?? 256)),
    };
}

const seedUsers = Array.from({ length: 1000 }, (_, idx) => buildSeedUser(idx + 1));
const customUsers = new Map();

const memRepo = {
    findAll: (limit) => Promise.resolve(seedUsers.slice(0, limit)),
    findById: (id) => {
        const n = Number(id);
        if (Number.isInteger(n) && n >= 1 && n <= seedUsers.length) {
            return Promise.resolve(seedUsers[n - 1]);
        }
        return Promise.resolve(customUsers.get(String(id)));
    },
    upsert: (user) => {
        customUsers.set(user.id, user);
        return Promise.resolve(user);
    },
};
// ─────────────────────────────────────────────────────────────────────────────

const isTest = process.env.NODE_ENV === 'test';

function findAll(limit) {
    if (isTest) return memRepo.findAll(limit);
    return db(TABLE).select('*').orderBy('id', 'asc').limit(limit);
}

function findById(id) {
    if (isTest) return memRepo.findById(id);
    return db(TABLE).where({ id }).first();
}

async function upsert(user) {
    if (isTest) return memRepo.upsert(user);
    await db(TABLE)
        .insert(user)
        .onConflict('id')
        .merge(['name', 'email', 'bio', 'updated_at']);
    return db(TABLE).where({ id: user.id }).first();
}

export { findAll, findById, upsert };
