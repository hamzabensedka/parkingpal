import { AsyncLocalStorage } from 'async_hooks';

/**
 * Trace context stored in AsyncLocalStorage
 * Available throughout the entire request lifecycle
 */
export interface TraceContext {
  traceId: string;
  userId?: string;
  startTime: number;
}

// Single AsyncLocalStorage instance for the entire application
const asyncLocalStorage = new AsyncLocalStorage<TraceContext>();

/**
 * Get current trace context from AsyncLocalStorage
 * Returns undefined if called outside of a request context
 */
export function getTraceContext(): TraceContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Get trace ID from current context
 * Returns 'no-trace' if not in request context (e.g., startup, cron jobs)
 */
export function getTraceId(): string {
  return getTraceContext()?.traceId ?? 'no-trace';
}

/**
 * Get user ID from current context
 */
export function getUserId(): string | undefined {
  return getTraceContext()?.userId;
}

/**
 * Set user ID in current context
 * Call this after authentication middleware to enrich trace context
 */
export function setUserId(userId: string): void {
  const ctx = getTraceContext();
  if (ctx) {
    ctx.userId = userId;
  }
}

/**
 * Get request start time from current context
 */
export function getStartTime(): number | undefined {
  return getTraceContext()?.startTime;
}

/**
 * Run callback within a trace context
 * Used by tracing middleware to wrap the entire request lifecycle
 */
export function runWithTraceContext<T>(
  context: TraceContext,
  callback: () => T
): T {
  return asyncLocalStorage.run(context, callback);
}

export { asyncLocalStorage };
