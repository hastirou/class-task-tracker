import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  className?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(UnauthorizedError('Missing or invalid authorization header'));
    return;
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    next(UnauthorizedError('Invalid or expired token'));
  }
};

export const requireRole = (...roles: Array<'TEACHER' | 'STUDENT'>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(UnauthorizedError());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(UnauthorizedError());
      return;
    }

    next();
  };
};

export const requireTeacher = requireRole('TEACHER');
export const requireStudent = requireRole('STUDENT');
