const { z } = require("zod");

const roles = ["admin", "atendente"];

const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    userName: z.string().min(1),
    password: z.string().min(6),
    role: z.enum(roles),
    active: z.boolean().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

const createBootstrapUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    userName: z.string().min(1),
    password: z.string().min(6),
    role: z.enum(roles).optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    userName: z.string().min(1).optional(),
    password: z.string().min(6).optional(),
    currentPassword: z.string().min(6).optional(),
    role: z.enum(roles).optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}),
});

const userIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: z.string().min(1),
  }),
  query: z.object({}),
});

module.exports = {
  createUserSchema,
  createBootstrapUserSchema,
  updateUserSchema,
  userIdSchema,
};
