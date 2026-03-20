import * as userRepository from '../repositories/userRepository.js';
import { stableStringify } from '../utils/stableStringify.js';

function repeatChar(char, length) {
  if (length <= 0) return '';
  return char.repeat(length);
}

function fnv1a32(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function parsePositiveInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

async function listUsers(size) {
  const n = parsePositiveInt(size) ?? Number(process.env.DEFAULT_LIST_SIZE ?? 100);
  const bounded = Math.min(n, Number(process.env.MAX_LIST_SIZE ?? 5000));
  return userRepository.findAll(bounded);
}

async function getUserById(id) {
  return userRepository.findById(String(id)) ?? null;
}

async function createOrUpdateUser(input) {
  const stable = stableStringify(input);
  const id = `c_${fnv1a32(stable).toString(16).padStart(8, '0')}`;

  const name = input?.name?.trim?.() || `Custom ${id}`;
  const email = input?.email?.trim?.() || `${id}@example.test`;

  const user = {
    id,
    name,
    email,
    bio: repeatChar('b', Number(process.env.DEFAULT_USER_BIO_SIZE ?? 256)),
  };

  return userRepository.upsert(user);
}

export { createOrUpdateUser, getUserById, listUsers };
