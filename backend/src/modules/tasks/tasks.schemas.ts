import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  dueDate: z.coerce.date(),
  className: z.string().min(1).max(100),
});

export const taskUpdateSchema = taskSchema.partial();

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['done', 'pending']).optional(),
  className: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const taskParamsSchema = z.object({
  id: z.string().uuid(),
});
