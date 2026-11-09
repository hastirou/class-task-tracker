import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as tasksService from './tasks.service.js';
import { success } from '../../utils/response.js';
import type { AuthUser } from '../../middleware/auth.js';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const task = await tasksService.create(req.validatedBody as tasksService.TaskInput, req.user as AuthUser);
  success(res, task, {}, 201);
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  // SAFETY: validatedQuery is populated by Zod middleware to match TaskQuery.
  const result = await tasksService.list(req.validatedQuery as unknown as tasksService.TaskQuery, req.user as AuthUser);
  success(res, result.tasks, result.meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const task = await tasksService.getById(id, req.user as AuthUser);
  success(res, task);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  const task = await tasksService.update(id, req.validatedBody as tasksService.TaskUpdateInput, req.user as AuthUser);
  success(res, task);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  await tasksService.remove(id, req.user as AuthUser);
  success(res, null, {}, 204);
});

export const complete = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  await tasksService.complete(id, req.user as AuthUser);
  success(res, null, {}, 204);
});

export const uncomplete = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string };
  await tasksService.uncomplete(id, req.user as AuthUser);
  success(res, null, {}, 204);
});
