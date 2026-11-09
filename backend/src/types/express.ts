import type { ZodError } from 'zod';

export type AuthUser = {
  userId: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  className?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
      validatedBody?: unknown;
      validatedQuery?: Record<string, unknown>;
      validatedParams?: Record<string, unknown>;
      zodError?: ZodError;
    }
  }
}

export {};
