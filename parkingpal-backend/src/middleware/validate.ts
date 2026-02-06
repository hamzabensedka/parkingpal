import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

/**
 * Validation middleware factory
 * Creates a middleware that validates request body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = <T>(schema: ZodSchema<T>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Parse and validate request body
      const validated = await schema.parseAsync(req.body);

      // Replace body with validated data (includes transformations)
      req.body = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          details[path] = err.message;
        });

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          details,
        });
        return;
      }

      // Re-throw non-Zod errors
      next(error);
    }
  };
};

/**
 * Validate request query parameters
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          details[path] = err.message;
        });

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          details,
        });
        return;
      }

      next(error);
    }
  };
};

/**
 * Validate request params
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          details[path] = err.message;
        });

        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: ERROR_MESSAGES.VALIDATION_ERROR,
          details,
        });
        return;
      }

      next(error);
    }
  };
};
