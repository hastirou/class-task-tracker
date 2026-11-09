import type { Request, Response, NextFunction } from 'express';

type HandlerFn = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export const asyncHandler = (fn: HandlerFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
