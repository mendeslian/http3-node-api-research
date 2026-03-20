import { env } from '../config/env.js';
import { stableStringify } from '../utils/stableStringify.js';

function repeatChar(char, length) {
  if (length <= 0) return '';
  return char.repeat(length);
}

function createSeedUser(id) {
  const paddedId = String(id).padStart(6, '0');
  return {
    id: String(id),
    name: `User ${paddedId}`,
    email: `user${paddedId}@example.test`,
    bio: repeatChar('a', env.DEFAULT_USER_BIO_SIZE),
  };
}

function fnv1a32(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const seedUsers = Array.from({ length: env.SEED_USERS_COUNT }, (_, idx) =>
  createSeedUser(idx + 1),
);
const customUsersById = new Map();

function parsePositiveInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function listUsers(size) {
  const n = parsePositiveInt(size) ?? env.DEFAULT_LIST_SIZE;
  const bounded = Math.min(n, env.MAX_LIST_SIZE);
  return seedUsers.slice(0, bounded);
}

function getUserById(id) {
  const numericId = parsePositiveInt(id);
  if (numericId && numericId <= seedUsers.length) {
    return seedUsers[numericId - 1];
  }
  return customUsersById.get(String(id)) ?? null;
}

function createOrUpdateUser(input) {
  const stable = stableStringify(input);
  const id = `c_${fnv1a32(stable).toString(16).padStart(8, '0')}`;

  const name = input?.name?.trim?.() || `Custom ${id}`;
  const email = input?.email?.trim?.() || `${id}@example.test`;

  const user = {
    id,
    name,
    email,
    bio: repeatChar('b', env.DEFAULT_USER_BIO_SIZE),
  };

  customUsersById.set(id, user);
  return user;
}

export { createOrUpdateUser, getUserById, listUsers };
