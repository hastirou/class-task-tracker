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
  summary: 'Register a new user',
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
      description: 'User registered successfully',
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
      description: 'Email already registered',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/auth/login',
  summary: 'Log in',
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
      description: 'Login successful',
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
      description: 'Invalid credentials',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/auth/me',
  summary: 'Get current user profile',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user profile',
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
