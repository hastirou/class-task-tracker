import { z } from 'zod';

export const ErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z.string().openapi({ example: 'Validation failed' }),
      details: z.any().optional(),
    }),
  })
  .openapi('ErrorResponse');

export const PaginationMetaSchema = z
  .object({
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  })
  .openapi('PaginationMeta');

// Generic wrapper: { data, meta }
export const DataResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T, name: string) =>
  z
    .object({
      data: dataSchema,
      meta: z.record(z.any()).default({}),
    })
    .openapi(name);
