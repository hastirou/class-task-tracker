import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../../utils/errors.js';
import type { AuthUser } from '../../middleware/auth.js';

const TEACHER_ROLE = 'TEACHER' as const;
const STUDENT_ROLE = 'STUDENT' as const;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: typeof TEACHER_ROLE | typeof STUDENT_ROLE;
  className?: string;
  teacherCode?: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: typeof TEACHER_ROLE | typeof STUDENT_ROLE;
    className?: string;
  };
  token: string;
}

const createToken = (user: AuthUser): string => jwt.sign(user, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as never });

const userWithoutPassword = (user: { id: string; name: string; email: string; role: string; className?: string | null }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as typeof TEACHER_ROLE | typeof STUDENT_ROLE,
  className: user.className ?? undefined,
});

export const register = async (input: RegisterInput): Promise<AuthResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (input.role === TEACHER_ROLE) {
    if (input.teacherCode !== env.TEACHER_REGISTRATION_CODE) {
      throw ValidationError('Invalid teacher registration code');
    }
  } else {
    if (!input.className || input.className.trim().length === 0) {
      throw ValidationError('Class name is required for students');
    }
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    throw ConflictError('Email already registered');
  }

  const created = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(input.password),
      role: input.role,
      className: input.role === STUDENT_ROLE ? input.className?.trim() ?? null : null,
    },
  });

  const userPayload: AuthUser = {
    userId: created.id,
    email: created.email,
    role: created.role,
    className: created.className ?? undefined,
  };

  return {
    user: userWithoutPassword(created),
    token: createToken(userPayload),
  };
};

export const login = async (email: string, password: string): Promise<AuthResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw UnauthorizedError('Invalid credentials');
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    throw UnauthorizedError('Invalid credentials');
  }

  const userPayload: AuthUser = {
    userId: user.id,
    email: user.email,
    role: user.role,
    className: user.className ?? undefined,
  };

  return {
    user: userWithoutPassword(user),
    token: createToken(userPayload),
  };
};
