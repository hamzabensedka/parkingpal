import rateLimit from 'express-rate-limit';
import { RATE_LIMITS, HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

/**
 * Rate limiter for authentication routes (login, register)
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_ATTEMPTS,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * Rate limiter for password reset requests
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: RATE_LIMITS.PASSWORD_RESET.WINDOW_MS,
  max: RATE_LIMITS.PASSWORD_RESET.MAX_ATTEMPTS,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * Rate limiter for email verification requests
 * 10 requests per hour per IP
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: RATE_LIMITS.EMAIL_VERIFICATION.WINDOW_MS,
  max: RATE_LIMITS.EMAIL_VERIFICATION.MAX_ATTEMPTS,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * Rate limiter for token refresh requests
 * 20 requests per hour per IP
 */
export const tokenRefreshLimiter = rateLimit({
  windowMs: RATE_LIMITS.TOKEN_REFRESH.WINDOW_MS,
  max: RATE_LIMITS.TOKEN_REFRESH.MAX_ATTEMPTS,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    });
  },
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    });
  },
});
