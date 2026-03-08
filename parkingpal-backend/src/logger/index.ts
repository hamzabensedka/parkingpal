/**
 * Logger Module - Barrel Export
 *
 * Provides structured logging with request tracing for the ParkingPal API.
 *
 * Usage:
 * ```typescript
 * import { appLogger, getTraceId, redact } from './logger';
 *
 * // Standard logging (auto-redacts sensitive fields)
 * appLogger.info('User logged in', { userId: '123', email: 'user@example.com' });
 *
 * // Payment-specific logging
 * appLogger.payment('Confirmation complete', { bookingId, amount });
 *
 * // Get trace ID for external service calls
 * const traceId = getTraceId();
 * ```
 */

// Logger instance and interface
export { appLogger, Logger, rawLogger } from './logger';

// Trace context utilities
export {
  getTraceContext,
  getTraceId,
  getUserId,
  setUserId,
  getStartTime,
  runWithTraceContext,
  TraceContext,
} from './trace-context';

// Redaction utilities
export { redact, redactString, redactHeaders } from './redact';
