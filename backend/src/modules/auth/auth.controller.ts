import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as authService from './auth.service.js';
import { success } from '../../utils/response.js';
import type { AuthUser } from '../../middleware/auth.js';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.validatedBody as authService.RegisterInput);
  success(res, result, {}, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.validatedBody as { email: string; password: string };
  const result = await authService.login(email, password);
  success(res, result);
});

export const me = asyncHandler((req: Request, res: Response) => {
  const user = req.user as AuthUser;
  success(res, { user });
});
