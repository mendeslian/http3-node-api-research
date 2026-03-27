import * as userRepository from '../repositories/userRepository.js';

function repeatChar(char, length) {
  if (length <= 0) return '';
  return char.repeat(length);
}

function parsePositiveInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

async function listUsers(size) {
  const n =
    parsePositiveInt(size) ?? Number(process.env.DEFAULT_LIST_SIZE ?? 100);
  const bounded = Math.min(n, Number(process.env.MAX_LIST_SIZE ?? 5000));
  return userRepository.findAll(bounded);
}

async function getUserById(id) {
  const n = parsePositiveInt(id);
  if (!n) return null;
  return userRepository.findById(n) ?? null;
}

async function createUser(input) {
  const name = input?.name?.trim?.() || `User ${Date.now()}`;
  const email = input?.email?.trim?.() || `user${Date.now()}@example.test`;

  const user = {
    name,
    email,
    bio:
      input?.bio?.trim?.() ||
      repeatChar('b', Number(process.env.DEFAULT_USER_BIO_SIZE ?? 256)),
  };

  return userRepository.create(user);
}

export { createUser, getUserById, listUsers };
