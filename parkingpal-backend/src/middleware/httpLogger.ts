import morgan, { StreamOptions } from 'morgan';
import { Request, Response } from 'express';
import { appLogger, getTraceId, redact } from '../logger';

/**
 * Custom Morgan stream that writes to Winston logger
 */
const stream: StreamOptions = {
  write: (message: string) => {
    // Morgan adds newline, remove it
    const trimmed = message.trim();
    if (trimmed) {
      appLogger.http(trimmed);
    }
  },
};

// Register custom Morgan tokens

/**
 * Trace ID from request context
 */
morgan.token('trace-id', (req: Request) => req.traceId || getTraceId());

/**
 * User ID from authenticated request
 */
morgan.token('user-id', (req: Request) => req.user?.id || 'anonymous');

/**
 * Real client IP, accounting for proxies (X-Forwarded-For)
 */
morgan.token('real-ip', (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
});

/**
 * Determine log level based on HTTP status code
 */
function getLogLevel(status: number): 'info' | 'warn' | 'error' {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
}

/**
 * Custom Morgan format function for structured logging
 *
 * For successful requests: simple one-line log
 * For error responses (4xx/5xx): detailed log with request context
 */
const customFormat = (
  tokens: morgan.TokenIndexer<Request, Response>,
  req: Request,
  res: Response
): string => {
  const status = parseInt(tokens.status(req, res) || '0', 10);
  const responseTime = tokens['response-time'](req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const contentLength = tokens.res(req, res, 'content-length') || '0';
  const traceId = tokens['trace-id'](req, res);
  const userId = tokens['user-id'](req, res);
  const realIp = tokens['real-ip'](req, res);

  // Build base message
  const baseMsg = `${method} ${url} ${status} ${responseTime}ms`;

  // For 4xx/5xx errors, log detailed context separately
  if (status >= 400) {
    const meta: Record<string, unknown> = {
      method,
      url,
      status,
      responseTimeMs: parseFloat(responseTime || '0'),
      contentLength: parseInt(contentLength, 10),
      traceId,
      userId,
      ip: realIp,
      userAgent: req.headers['user-agent'],
    };

    // Include redacted request body for errors (helpful for debugging)
    if (req.body && Object.keys(req.body).length > 0) {
      meta.requestBody = redact(req.body);
    }

    // Include query params
    if (Object.keys(req.query).length > 0) {
      meta.query = req.query;
    }

    // Include route params
    if (req.params && Object.keys(req.params).length > 0) {
      meta.params = req.params;
    }

    // Log at appropriate level
    const level = getLogLevel(status);
    if (level === 'error') {
      appLogger.error(`HTTP ${baseMsg}`, meta);
    } else {
      appLogger.warn(`HTTP ${baseMsg}`, meta);
    }

    // Return empty string since we logged manually
    // This prevents Morgan from double-logging
    return '';
  }

  // For success responses, return simple format for Morgan to log
  return `${method} ${url} ${status} ${responseTime}ms - ${contentLength}b [${userId}]`;
};

/**
 * HTTP Logger Middleware
 *
 * Uses Morgan integrated with Winston for HTTP request/response logging.
 *
 * Features:
 * - Logs all requests with traceId, userId, timing
 * - Different log levels based on status code (info/warn/error)
 * - Includes redacted request body for error responses
 * - Skips health check to reduce noise
 *
 * Position in middleware chain:
 * - AFTER: tracingMiddleware (needs traceId)
 * - AFTER: express.json() (needs access to req.body for error logging)
 * - BEFORE: Routes
 */
export const httpLoggerMiddleware = morgan(customFormat, {
  stream,
  // Skip noisy endpoints
  skip: (req: Request) => {
    const skipPaths = ['/health', '/favicon.ico', '/robots.txt'];
    return skipPaths.includes(req.url);
  },
});

/**
 * Optional: Request-start logging middleware
 *
 * Logs when a request starts (useful for debugging slow/hanging requests).
 * Only active in development mode.
 */
export function requestStartLogger(
  req: Request,
  _res: Response,
  next: () => void
): void {
  if (process.env.NODE_ENV === 'development') {
    appLogger.debug(`--> ${req.method} ${req.url}`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
  next();
}
