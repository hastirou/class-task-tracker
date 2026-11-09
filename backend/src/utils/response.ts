import type { Response } from 'express';

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

interface SuccessBody<T> {
  data: T;
  meta: ResponseMeta | Record<string, never>;
}

export const success = <T>(
  res: Response,
  data: T,
  meta: ResponseMeta | Record<string, never> = {},
  status = 200,
) => {
  const body: SuccessBody<T> = { data, meta };
  res.status(status).json(body);
};

export const error = (
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
) => {
  const body: { error: { code: string; message: string; details?: unknown } } = {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  res.status(status).json(body);
};
