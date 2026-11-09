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
  summary: 'Buat tugas (khusus GURU)',
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
      description: 'Tugas berhasil dibuat',
      content: {
        'application/json': {
          schema: DataResponseSchema(TaskSchema, 'CreateTaskResponse'),
        },
      },
    },
    400: {
      description: 'Kesalahan validasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Tidak terautentikasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Tidak memiliki akses',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tasks',
  summary: 'Daftar tugas',
  tags: ['Tasks'],
  security: bearer,
  request: {
    query: TaskQuerySchema,
  },
  responses: {
    200: {
      description: 'Daftar tugas',
      content: {
        'application/json': {
          schema: DataResponseSchema(z.array(TaskSchema), 'ListTasksResponse'),
        },
      },
    },
    400: {
      description: 'Kesalahan validasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Tidak terautentikasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/tasks/{id}',
  summary: 'Detail tugas berdasarkan ID',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
  },
  responses: {
    200: {
      description: 'Detail tugas',
      content: {
        'application/json': { schema: DataResponseSchema(TaskSchema, 'GetTaskResponse') },
      },
    },
    400: {
      description: 'Kesalahan validasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Tidak terautentikasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Tidak memiliki akses',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Tugas tidak ditemukan',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/tasks/{id}',
  summary: 'Perbarui tugas (khusus pemilik GURU)',
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
      description: 'Tugas berhasil diperbarui',
      content: {
        'application/json': { schema: DataResponseSchema(TaskSchema, 'UpdateTaskResponse') },
      },
    },
    400: {
      description: 'Kesalahan validasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Tidak terautentikasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Tidak memiliki akses',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Tugas tidak ditemukan',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/tasks/{id}',
  summary: 'Hapus tugas (khusus pemilik GURU)',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
  },
  responses: {
    204: { description: 'Tugas berhasil dihapus' },
    400: {
      description: 'Kesalahan validasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Tidak terautentikasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Tidak memiliki akses',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Tugas tidak ditemukan',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/tasks/{id}/complete',
  summary: 'Tandai tugas selesai (khusus SISWA)',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
  },
  responses: {
    204: { description: 'Tugas ditandai selesai' },
    400: {
      description: 'Kesalahan validasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Tidak terautentikasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Tidak memiliki akses',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Tugas tidak ditemukan',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/tasks/{id}/complete',
  summary: 'Batalkan penyelesaian tugas (khusus SISWA)',
  tags: ['Tasks'],
  security: bearer,
  request: {
    params: taskParamsSchema.openapi('TaskParams'),
  },
  responses: {
    204: { description: 'Penyelesaian tugas dibatalkan' },
    400: {
      description: 'Kesalahan validasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Tidak terautentikasi',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    403: {
      description: 'Tidak memiliki akses',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    404: {
      description: 'Tugas tidak ditemukan',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});
