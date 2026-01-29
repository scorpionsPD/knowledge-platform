import { NextFunction, Request, Response } from 'express';

/**
 * Custom error class with status code and additional metadata
 * for structured error responses across the API
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    public details?: unknown
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 * Provides consistent error responses with appropriate HTTP status codes
 * Separates operational errors from programming errors
 * Logs errors for monitoring and debugging
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown = undefined;

  // Handle known ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  }
  // Handle Prisma errors
  else if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string; meta?: unknown };
    statusCode = 400;
    if (prismaError.code === 'P2002') {
      message = 'A record with this data already exists';
      details = prismaError.meta;
    } else if (prismaError.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    } else {
      message = 'Database operation failed';
    }
  }
  // Handle validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  }

  // Log error for monitoring (in production, send to logging service)
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('Server error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userId: (req.user as { id?: string })?.id
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn('Client error:', {
      message: err.message,
      url: req.url,
      method: req.method,
      statusCode
    });
  }

  // Send error response
  const response: {
    message: string;
    details?: unknown;
    stack?: string;
  } = { message };

  if (details) {
    response.details = details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * Eliminates need for try-catch in every route
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
