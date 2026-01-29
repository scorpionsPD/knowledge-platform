import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from './errorHandler';

/**
 * Generic validation middleware using Zod schemas
 * Validates request body, query params, and URL params
 * Provides detailed error messages for invalid input
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        next(
          new ApiError(400, 'Validation failed', true, {
            errors
          })
        );
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validates pagination parameters
 * Ensures page and limit are within acceptable ranges
 */
export function validatePagination(req: Request, _res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  if (page < 1) {
    return next(new ApiError(400, 'Page number must be greater than 0'));
  }

  if (limit < 1 || limit > 100) {
    return next(new ApiError(400, 'Limit must be between 1 and 100'));
  }

  // Attach validated values to request
  req.query.page = page.toString();
  req.query.limit = limit.toString();

  next();
}

/**
 * Validates UUID format for ID parameters
 */
export function validateUUID(paramName: string = 'id') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return next(new ApiError(400, `Invalid ${paramName} format`));
    }

    next();
  };
}
