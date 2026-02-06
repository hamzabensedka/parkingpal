import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  details?: Record<string, string>;
  reason?: string;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: Record<string, string>,
    reason?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.reason = reason;
    this.name = 'ApiError';

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, string>): ApiError {
    return new ApiError(message, HTTP_STATUS.BAD_REQUEST, details);
  }

  static unauthorized(message: string = ERROR_MESSAGES.INVALID_CREDENTIALS): ApiError {
    return new ApiError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message: string, reason?: string): ApiError {
    return new ApiError(message, HTTP_STATUS.FORBIDDEN, undefined, reason);
  }

  static notFound(message: string = ERROR_MESSAGES.NOT_FOUND): ApiError {
    return new ApiError(message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, HTTP_STATUS.CONFLICT);
  }

  static tooManyRequests(message: string = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED): ApiError {
    return new ApiError(message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }

  static internal(message: string = ERROR_MESSAGES.INTERNAL_ERROR): ApiError {
    return new ApiError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  // Log error in development
  if (env.isDevelopment) {
    console.error('Error:', err);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string> = {};
    err.errors.forEach((error) => {
      const path = error.path.join('.');
      details[path] = error.message;
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details,
    });
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    const response: {
      success: false;
      error: string;
      details?: Record<string, string>;
      reason?: string;
    } = {
      success: false,
      error: err.message,
    };

    if (err.details) response.details = err.details;
    if (err.reason) response.reason = err.reason;

    return res.status(err.statusCode).json(response);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target?.[0] || 'field';
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: `${target.charAt(0).toUpperCase() + target.slice(1)} already exists`,
      });
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND,
      });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.TOKEN_EXPIRED,
    });
  }

  // Default to internal server error
  const statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = env.isDevelopment ? err.message : ERROR_MESSAGES.INTERNAL_ERROR;

  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
};
