import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runWithTraceContext, setUserId, TraceContext } from '../logger';

/**
 * Header names for trace ID propagation
 * X-Request-ID is a common standard for distributed tracing
 */
const TRACE_ID_HEADER = 'x-request-id';

/**
 * Tracing Middleware
 *
 * Generates or extracts a trace ID and stores it in AsyncLocalStorage.
 * The trace ID is available throughout the entire request lifecycle.
 *
 * Features:
 * - Extracts existing X-Request-ID header (for distributed tracing)
 * - Generates UUID v4 if no header present
 * - Attaches traceId to response header for client correlation
 * - Stores in AsyncLocalStorage for access anywhere without prop drilling
 *
 * Position in middleware chain:
 * - AFTER: Helmet, CORS (security headers should be first)
 * - BEFORE: express.json() body parsing (so even parse errors have traceId)
 * - BEFORE: All route handlers
 */
export function tracingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Extract existing trace ID from header or generate new one
  const incomingTraceId = req.headers[TRACE_ID_HEADER];
  const traceId =
    typeof incomingTraceId === 'string' && incomingTraceId.length > 0
      ? incomingTraceId
      : uuidv4();

  // Attach to response header for client correlation
  res.setHeader(TRACE_ID_HEADER, traceId);

  // Also attach to request object for easy access in controllers
  req.traceId = traceId;

  // Create trace context with request start time
  const context: TraceContext = {
    traceId,
    startTime: Date.now(),
  };

  // Run the rest of the request within this trace context
  runWithTraceContext(context, () => {
    next();
  });
}

/**
 * Middleware to enrich trace context with authenticated user ID
 *
 * Call this AFTER authentication middleware to add userId to all subsequent logs.
 * This is optional - userId will be undefined in logs before authentication.
 */
export function attachUserToTrace(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.id) {
    setUserId(req.user.id);
  }
  next();
}

// Extend Express Request type to include traceId
declare global {
  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}
