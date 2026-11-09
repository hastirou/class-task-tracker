import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

const projectRoot = process.cwd();

export default defineConfig({
  schema: path.resolve(projectRoot, 'prisma/schema.prisma'),
  migrations: {
    path: path.resolve(projectRoot, 'prisma/migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
