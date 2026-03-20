import { z } from 'zod';

import {
  createOrUpdateUser,
  getUserById,
  listUsers,
} from '../services/userService.js';

const ListUsersQuerySchema = z.object({
  size: z.coerce.number().int().positive().optional(),
});

const UserIdParamsSchema = z.object({
  id: z.string().min(1),
});

const CreateUserBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().min(1).optional(),
  })
  .passthrough();

async function getUsers(req, res) {
  const query = ListUsersQuerySchema.parse(req.query);
  const users = await listUsers(query.size);
  res.json(users);
}

async function getUser(req, res) {
  const params = UserIdParamsSchema.parse(req.params);
  const user = await getUserById(params.id);
  if (!user) {
    res.status(404).json({ error: 'UserNotFound' });
    return;
  }
  res.json(user);
}

async function createUser(req, res) {
  const body = CreateUserBodySchema.parse(req.body);
  const user = await createOrUpdateUser(body);
  res.status(201).json(user);
}

export { createUser, getUser, getUsers };
