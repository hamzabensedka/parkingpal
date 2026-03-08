import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { getTraceId, getUserId, getStartTime } from './trace-context';
import { redact } from './redact';

/**
 * Log levels following npm convention
 * Lower number = higher severity
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Colors for console output in development
 */
const LOG_COLORS: Record<string, string> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(LOG_COLORS);

/**
 * Determine environment and log level
 */
const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

/**
 * Custom format that injects traceId and userId from AsyncLocalStorage
 */
const traceFormat = winston.format((info) => {
  info.traceId = getTraceId();
  const userId = getUserId();
  if (userId) {
    info.userId = userId;
  }
  info.service = 'parkingpal-api';
  return info;
});

/**
 * Format for structured JSON logs (production + file logging)
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  traceFormat(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Format for human-readable console logs (development)
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSS' }),
  traceFormat(),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, traceId, userId, ...meta }) => {
    const userStr = userId ? ` [user:${userId}]` : '';
    const cleanMeta = { ...meta };
    // Remove winston internal fields
    delete cleanMeta.service;

    const metaStr = Object.keys(cleanMeta).length > 0
      ? `\n${JSON.stringify(cleanMeta, null, 2)}`
      : '';
    return `${timestamp} [${traceId}]${userStr} ${level}: ${message}${metaStr}`;
  })
);

// Build transports array
const transports: winston.transport[] = [];

// Console transport
if (isDevelopment) {
  // Colorized, human-readable in development
  transports.push(
    new winston.transports.Console({
      level: logLevel,
      format: consoleFormat,
    })
  );
} else {
  // JSON format in production for log aggregators (CloudWatch, ELK, etc.)
  transports.push(
    new winston.transports.Console({
      level: logLevel,
      format: jsonFormat,
    })
  );
}

// Rotating file transport for errors only
transports.push(
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: jsonFormat,
    maxSize: '20m',
    maxFiles: '14d', // Keep 14 days of error logs
    zippedArchive: true,
  })
);

// Rotating file transport for all logs
transports.push(
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: jsonFormat,
    maxSize: '50m',
    maxFiles: '7d', // Keep 7 days of combined logs
    zippedArchive: true,
  })
);

// Create the Winston logger instance
const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: logLevel,
  transports,
  exitOnError: false,
});

/**
 * Typed logger interface with standard methods and specialized helpers
 */
export interface Logger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  http(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;

  // Specialized logging methods
  payment(action: string, meta: Record<string, unknown>): void;
  security(action: string, meta: Record<string, unknown>): void;
}

/**
 * Calculate duration from request start time
 */
function getDuration(): number | undefined {
  const startTime = getStartTime();
  if (startTime) {
    return Date.now() - startTime;
  }
  return undefined;
}

/**
 * Application logger with auto-redaction and specialized methods
 * All log methods automatically redact sensitive fields
 */
export const appLogger: Logger = {
  error: (message, meta) => {
    const duration = getDuration();
    logger.error(message, { ...redact(meta), ...(duration !== undefined && { durationMs: duration }) });
  },

  warn: (message, meta) => {
    const duration = getDuration();
    logger.warn(message, { ...redact(meta), ...(duration !== undefined && { durationMs: duration }) });
  },

  info: (message, meta) => {
    logger.info(message, redact(meta));
  },

  http: (message, meta) => {
    logger.http(message, redact(meta));
  },

  debug: (message, meta) => {
    logger.debug(message, redact(meta));
  },

  /**
   * Payment-specific logging with [PAYMENT] prefix
   * Includes category field for filtering in log aggregators
   */
  payment: (action, meta) => {
    const duration = getDuration();
    logger.info(`[PAYMENT] ${action}`, {
      category: 'payment',
      ...redact(meta),
      ...(duration !== undefined && { durationMs: duration }),
    });
  },

  /**
   * Security-related logging with [SECURITY] prefix
   * Logged at warn level for visibility
   */
  security: (action, meta) => {
    logger.warn(`[SECURITY] ${action}`, {
      category: 'security',
      ...redact(meta),
    });
  },
};

// Export raw winston logger for advanced use cases
export { logger as rawLogger };
