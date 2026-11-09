import { z } from 'zod';
import { registry } from './registry.js';
import { DataResponseSchema, ErrorResponseSchema } from './common.js';
import { taskSchema, taskUpdateSchema, taskParamsSchema } from '../modules/tasks/tasks.schemas.js';

const TaskSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().nullable(),
    dueDate: z.date(),
    className: z.string(),
    createdById: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    completed: z.boolean(),
    completedAt: z.date().nullable(),
  })
  .openapi('Task');

const TaskQuerySchema = z
  .object({
    search: z.string().optional(),
    status: z.enum(['done', 'pending']).optional(),
    className: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  })
  .openapi('TaskQuery');

const bearer = [{ bearerAuth: [] as string[] }];

registry.registerPath({
  method: 'post',
  path: '/tasks',
  summary: 'Create a task (TEACHER only)',
  tags: ['Tasks'],
  security: bearer,
  request: {
    body: {
      content: {
        'application/json': {
          schema: taskSchema.openapi('CreateTaskInput'),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Task created',
      content: {
        'application/json': {
          schema: DataResponseSchema(TaskSchema, 'CreateTaskResponse'),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tasks',
  summary: 'List tasks',
  tags: ['Tasks'],
  security: bearer,
  request: {
    query: TaskQuerySchema,
  },
  responses: {
    200: {
      description: 'List of tasks',
      content: {
        'application/json': {
          schema: DataResponseSchema(z.array(TaskSchema), 'ListTasksResponse'),
        },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tasks/{id}',
  summary: 'Get task by ID',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
  },
  responses: {
    200: {
      description: 'Task details',
      content: {
        'application/json': { schema: DataResponseSchema(TaskSchema, 'GetTaskResponse') },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Task not found',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/tasks/{id}',
  summary: 'Update a task (TEACHER owner only)',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
    body: {
      content: {
        'application/json': {
          schema: taskUpdateSchema.openapi('UpdateTaskInput'),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Task updated',
      content: {
        'application/json': { schema: DataResponseSchema(TaskSchema, 'UpdateTaskResponse') },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Task not found',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/tasks/{id}',
  summary: 'Delete a task (TEACHER owner only)',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
  },
  responses: {
    204: { description: 'Task deleted' },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Task not found',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/tasks/{id}/complete',
  summary: 'Mark task as complete (STUDENT only)',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
  },
  responses: {
    204: { description: 'Marked as complete' },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Task not found',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/tasks/{id}/complete',
  summary: 'Undo task completion (STUDENT only)',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
  },
  responses: {
    204: { description: 'Completion undone' },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Task not found',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});
