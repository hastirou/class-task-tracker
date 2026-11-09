import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env' });

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(65535))
      .default('3000'),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('1d'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    TEACHER_REGISTRATION_CODE: z.string().min(1),
    SERVE_FRONTEND: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .default('false'),
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const lines = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('\n');
  console.error('Invalid environment variables:\n%s', lines);
  process.exit(1);
}

export const env = parsed.data;
