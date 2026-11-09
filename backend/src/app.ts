import './openapi/zod-extend.js';
import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { success } from './utils/response.js';
import { NotFoundError } from './utils/errors.js';
import { logger } from './utils/logger.js';
import authRoutes from './modules/auth/auth.routes.js';
import tasksRoutes from './modules/tasks/tasks.routes.js';
import { openApiDocument } from './openapi/document.js';

export const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  const isDocs =
    req.path === '/docs' ||
    req.path.startsWith('/docs/') ||
    req.path === '/api/docs' ||
    req.path.startsWith('/api/docs/');
  helmet(isDocs ? { contentSecurityPolicy: false } : {})(req, res, next);
});

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.use(pinoHttp({ logger }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req: Request, res: Response) => {
  success(res, { status: 'ok', env: env.NODE_ENV });
});

app.get('/api/openapi.json', (_req: Request, res: Response) => {
  res.json(openApiDocument);
});

app.use(['/docs', '/api/docs'], swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/tasks', tasksRoutes);

app.use('/api', (_req: Request, _res: Response, next: NextFunction) => {
  next(NotFoundError('Route'));
});

app.use(errorHandler);
