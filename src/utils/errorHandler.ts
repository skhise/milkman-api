import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const errorHandler = (err: Error | unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Handle case where err might not be an Error instance
  let error: Error;
  if (err instanceof Error) {
    error = err;
  } else if (err && typeof err === 'object' && 'message' in err) {
    error = err as Error;
  } else {
    error = new Error(String(err || 'Unknown error'));
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const payload = {
    message: error.message || 'Internal server error',
    ...(error instanceof ApiError && error.details ? { details: error.details } : {}),
  };

  // Log errors (use proper logging service in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  } else {
    // In production, log to proper logging service
    // TODO: Integrate with logging service (Winston, Pino, etc.)
    console.error('Error:', error.message);
  }

  res.status(statusCode).json(payload);
};
