import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import '../types/express.js';

type Source = 'body' | 'query' | 'params';

const keyForSource = (source: Source) => {
  if (source === 'params') return 'validatedParams';
  if (source === 'query') return 'validatedQuery';
  return 'validatedBody';
};

export const validate = <T>(schema: ZodSchema<T>, source: Source = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const raw: unknown =
      source === 'params' ? req.params : source === 'query' ? req.query : req.body;

    const result = schema.safeParse(raw);

    if (!result.success) {
      const err = new Error('Validation failed');
      Object.assign(err, { name: 'ZodError', errors: result.error.errors, zodError: result.error });
      next(err);
      return;
    }

    Object.assign(req, { [keyForSource(source)]: result.data });
    next();
  };
};

export const transformZodErrorToResponse = (err: ZodError) =>
  err.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));
