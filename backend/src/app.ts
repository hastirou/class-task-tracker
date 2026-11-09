import express, { type Request, type Response } from 'express';
import { env } from './config/env.js';

export const app = express();

app.use(express.json({ limit: '10kb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ data: { status: 'ok', env: env.NODE_ENV }, meta: {} });
});
