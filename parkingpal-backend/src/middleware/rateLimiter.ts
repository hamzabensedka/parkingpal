import rateLimit, { Options } from 'express-rate-limit';
import { Request } from 'express';
import { RATE_LIMITS, HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

/**
 * Generate a rate limit key that combines IP and user ID (if authenticated).
 * For authenticated requests: `user:{userId}`
 * For unauthenticated requests: `ip:{ip}`
 */
const getUserOrIpKey = (req: Request): string => {
  // If user is authenticated, use their user ID as the key
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  // Fall back to IP address for unauthenticated requests
  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
};

/**
 * Generate a rate limit key that uses only IP address.
 * Used for pre-auth routes where user ID is not yet available.
 */
const getIpOnlyKey = (req: Request): string => {
  return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
};

/**
 * Common handler for rate limit exceeded responses
 */
const rateLimitHandler = (req: Request, res: any) => {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  });
};

/**
 * Rate limiter for authentication routes (login, register)
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_ATTEMPTS,
  keyGenerator: getIpOnlyKey,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: rateLimitHandler,
});

/**
 * Rate limiter for password reset requests
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: RATE_LIMITS.PASSWORD_RESET.WINDOW_MS,
  max: RATE_LIMITS.PASSWORD_RESET.MAX_ATTEMPTS,
  keyGenerator: getIpOnlyKey,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Rate limiter for email verification requests
 * 10 requests per hour per IP
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: RATE_LIMITS.EMAIL_VERIFICATION.WINDOW_MS,
  max: RATE_LIMITS.EMAIL_VERIFICATION.MAX_ATTEMPTS,
  keyGenerator: getIpOnlyKey,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Rate limiter for token refresh requests
 * 20 requests per hour per IP/User
 */
export const tokenRefreshLimiter = rateLimit({
  windowMs: RATE_LIMITS.TOKEN_REFRESH.WINDOW_MS,
  max: RATE_LIMITS.TOKEN_REFRESH.MAX_ATTEMPTS,
  keyGenerator: getUserOrIpKey,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * General API rate limiter (IP-based for public routes)
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyGenerator: getIpOnlyKey,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ========================================
// USER-SPECIFIC RATE LIMITERS
// For authenticated API endpoints
// ========================================

/**
 * Rate limiter for authenticated API calls (per user)
 * 200 requests per 15 minutes per user
 * Higher limit than IP-based since users are authenticated
 */
export const userApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  keyGenerator: getUserOrIpKey,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * Rate limiter for booking creation (per user)
 * 10 bookings per hour per user to prevent abuse
 */
export const bookingCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: getUserOrIpKey,
  message: {
    success: false,
    error: 'Too many booking requests. Please wait before creating more bookings.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Too many booking requests. Please wait before creating more bookings.',
    });
  },
});

/**
 * Rate limiter for spot/listing creation (per user)
 * 5 listings per day per user
 */
export const spotCreateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  keyGenerator: getUserOrIpKey,
  message: {
    success: false,
    error: 'Too many listing creation attempts. Please wait before creating more listings.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Too many listing creation attempts. Please wait before creating more listings.',
    });
  },
});

/**
 * Rate limiter for search requests (per user or IP)
 * 60 searches per minute to prevent scraping
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyGenerator: getUserOrIpKey,
  message: {
    success: false,
    error: 'Too many search requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Too many search requests. Please slow down.',
    });
  },
});

/**
 * Rate limiter for review submissions (per user)
 * 20 reviews per day per user
 */
export const reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  keyGenerator: getUserOrIpKey,
  message: {
    success: false,
    error: 'Too many review submissions. Please wait before submitting more reviews.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Too many review submissions. Please wait before submitting more reviews.',
    });
  },
});

/**
 * Rate limiter for SMS verification code requests (per user)
 * 5 codes per hour per user
 */
export const smsCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: getUserOrIpKey,
  message: {
    success: false,
    error: 'Too many verification code requests. Please wait before requesting another code.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: 'Too many verification code requests. Please wait before requesting another code.',
    });
  },
});
