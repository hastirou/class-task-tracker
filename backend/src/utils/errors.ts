export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const UnauthorizedError = (message = 'Unauthorized') =>
  new AppError(message, 401, 'UNAUTHORIZED');

export const ForbiddenError = (message = 'Forbidden') =>
  new AppError(message, 403, 'FORBIDDEN');

export const NotFoundError = (resource = 'Resource') =>
  new AppError(`${resource} not found`, 404, 'NOT_FOUND');

export const ConflictError = (message = 'Conflict') =>
  new AppError(message, 409, 'CONFLICT');

export const ValidationError = (message = 'Validation failed') =>
  new AppError(message, 400, 'VALIDATION_ERROR');
