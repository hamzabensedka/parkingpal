import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { appLogger, getTraceId, redact } from '../logger';

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
 * Build error context for logging
 * Includes request details with redacted sensitive data
 */
function buildErrorContext(req: Request): Record<string, unknown> {
  const context: Record<string, unknown> = {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  // Add redacted body for non-GET requests
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    context.body = redact(req.body);
  }

  return context;
}

/**
 * Global error handler middleware
 *
 * Features:
 * - Structured logging with traceId for all errors
 * - Different log levels based on error severity (warn for 4xx, error for 5xx)
 * - traceId included in all error responses for client correlation
 * - Sensitive data automatically redacted from logs
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  const traceId = getTraceId();
  const errorContext = buildErrorContext(req);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details: Record<string, string> = {};
    err.errors.forEach((error) => {
      const path = error.path.join('.');
      details[path] = error.message;
    });

    appLogger.warn('Validation error', {
      ...errorContext,
      errorType: 'ZodError',
      validationErrors: details,
    });

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      details,
      traceId,
    });
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    const logLevel = err.statusCode >= 500 ? 'error' : 'warn';

    appLogger[logLevel](err.message, {
      ...errorContext,
      errorType: 'ApiError',
      statusCode: err.statusCode,
      details: err.details,
      reason: err.reason,
      stack: env.isDevelopment ? err.stack : undefined,
    });

    const response: {
      success: false;
      error: string;
      details?: Record<string, string>;
      reason?: string;
      traceId: string;
    } = {
      success: false,
      error: err.message,
      traceId,
    };

    if (err.details) response.details = err.details;
    if (err.reason) response.reason = err.reason;

    return res.status(err.statusCode).json(response);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };

    appLogger.warn('Prisma error', {
      ...errorContext,
      errorType: 'PrismaError',
      prismaCode: prismaError.code,
      prismaMeta: prismaError.meta,
    });

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target?.[0] || 'field';
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        error: `${target.charAt(0).toUpperCase() + target.slice(1)} already exists`,
        traceId,
      });
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: ERROR_MESSAGES.NOT_FOUND,
        traceId,
      });
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    appLogger.warn('JWT error - invalid token', {
      ...errorContext,
      errorType: 'JsonWebTokenError',
    });

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.INVALID_TOKEN,
      traceId,
    });
  }

  if (err.name === 'TokenExpiredError') {
    appLogger.warn('JWT error - token expired', {
      ...errorContext,
      errorType: 'TokenExpiredError',
    });

    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      error: ERROR_MESSAGES.TOKEN_EXPIRED,
      traceId,
    });
  }

  // Unhandled error - log full stack trace
  appLogger.error('Unhandled error', {
    ...errorContext,
    errorType: err.name,
    message: err.message,
    stack: err.stack,
  });

  // Default to internal server error
  const statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = env.isDevelopment ? err.message : ERROR_MESSAGES.INTERNAL_ERROR;

  return res.status(statusCode).json({
    success: false,
    error: message,
    traceId,
  });
};

/**
 * Not found handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  const traceId = getTraceId();

  appLogger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  return res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
    traceId,
  });
};
