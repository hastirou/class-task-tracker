import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors.js';
import { error } from '../utils/response.js';
import { env } from '../config/env.js';

interface PrismaKnownError {
  code?: string;
  meta?: {
    target?: unknown;
  };
}

interface NamedError {
  name?: string;
  errors?: unknown;
}

const isPrismaError = (err: unknown): err is PrismaKnownError =>
  typeof err === 'object' && err !== null && 'code' in err;

const isNamedError = (err: unknown): err is NamedError =>
  typeof err === 'object' && err !== null && ('name' in err || 'errors' in err);

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    error(res, err.statusCode, err.code, err.message);
    return;
  }

  if (isPrismaError(err) && err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? (err.meta.target as string[]).join(', ') : 'field';
    error(res, 409, 'CONFLICT', `${target} already exists`, { target: err.meta?.target });
    return;
  }

  if (isNamedError(err) && err.name === 'ZodError') {
    error(res, 400, 'VALIDATION_ERROR', 'Validation failed', err.errors);
    return;
  }

  if (isNamedError(err) && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
    error(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
    return;
  }

  console.error(err);

  if (env.NODE_ENV === 'development') {
    error(res, 500, 'INTERNAL_ERROR', 'Internal server error', { reason: err instanceof Error ? err.message : String(err) });
    return;
  }

  error(res, 500, 'INTERNAL_ERROR', 'Internal server error');
};
