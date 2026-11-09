import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';

type Source = 'body' | 'query' | 'params';

const extractSource = (req: Request, source: Source): Record<string, unknown> => {
  if (source === 'params') return req.params;
  if (source === 'query') return req.query;
  return req.body as Record<string, unknown>;
};

export const validate = <T>(schema: ZodSchema<T>, source: Source = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(extractSource(req, source));

    if (!result.success) {
      Object.assign(req, { zodError: result.error });
      next(new Error('Validation failed'));
      return;
    }

    const key = source === 'params' ? 'validatedParams' : source === 'query' ? 'validatedQuery' : 'validatedBody';
    Object.assign(req, { [key]: result.data });
    next();
  };
};

export const transformZodErrorToResponse = (err: ZodError) =>
  err.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
  }));
