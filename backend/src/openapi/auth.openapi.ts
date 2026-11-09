import { z } from 'zod';
import { registry } from './registry.js';
import { registerSchema, loginSchema } from '../modules/auth/auth.schemas.js';
import { DataResponseSchema, ErrorResponseSchema } from './common.js';

const UserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(['TEACHER', 'STUDENT']),
    className: z.string().optional(),
  })
  .openapi('User');

const AuthSuccessSchema = z
  .object({
    user: UserSchema,
    token: z.string(),
  })
  .openapi('AuthSuccess');

registry.registerPath({
  method: 'post',
  path: '/auth/register',
  summary: 'Daftar pengguna baru',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema.openapi('RegisterInput'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Pengguna berhasil terdaftar',
      content: {
        'application/json': {
          schema: DataResponseSchema(AuthSuccessSchema, 'RegisterResponse'),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    409: {
      description: 'Email sudah terdaftar',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  summary: 'Masuk',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema.openapi('LoginInput'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Berhasil masuk',
      content: {
        'application/json': {
          schema: DataResponseSchema(AuthSuccessSchema, 'LoginResponse'),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Kredensial tidak valid',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  summary: 'Profil pengguna saat ini',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Profil pengguna saat ini',
      content: {
        'application/json': {
          schema: DataResponseSchema(
            z.object({ user: UserSchema }).openapi('MeData'),
            'MeResponse',
          ),
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});
