// Application Constants

// Authentication
export const AUTH = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  PASSWORD_REQUIREMENTS: 'Password must be at least 8 characters with uppercase, lowercase, and number',

  // Token expiry times (in milliseconds)
  EMAIL_VERIFICATION_EXPIRES_MS: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_EXPIRES_MS: 60 * 60 * 1000, // 1 hour

  // Bcrypt salt rounds
  BCRYPT_SALT_ROUNDS: 10,

  // Token lengths
  TOKEN_LENGTH: 32,
} as const;

// User Types
export const USER_TYPES = ['renter', 'host', 'both'] as const;
export type UserTypeValue = (typeof USER_TYPES)[number];

// Rate Limiting
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 5,
  },
  PASSWORD_RESET: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_ATTEMPTS: 3,
  },
  EMAIL_VERIFICATION: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_ATTEMPTS: 10,
  },
  TOKEN_REFRESH: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_ATTEMPTS: 20,
  },
} as const;

// File Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
} as const;

// Validation
export const VALIDATION = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  NAME_REGEX: /^[a-zA-ZÀ-ÿ\s'-]+$/,

  // French phone number regex
  PHONE_REGEX: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,

  EMAIL_MAX_LENGTH: 255,
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  PHONE_EXISTS: 'Phone number already registered',
  ACCOUNT_SUSPENDED: 'Your account has been suspended',
  ACCOUNT_NOT_ACTIVE: 'Your account is not active',
  EMAIL_NOT_VERIFIED: 'Please verify your email first',

  // Tokens
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  NO_TOKEN: 'No token provided',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',

  // Validation
  VALIDATION_ERROR: 'Validation Error',
  INVALID_INPUT: 'Invalid input data',

  // General
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',

  // Spots
  SPOT_NOT_FOUND: 'Spot not found',
  SPOT_NOT_OWNER: 'You are not the owner of this spot',
  SPOT_ALREADY_ACTIVE: 'Spot is already active',
  MIN_PHOTOS_REQUIRED: 'At least one photo is required',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTERED: 'Account created successfully. Please verify your email.',
  LOGGED_IN: 'Login successful',
  LOGGED_OUT: 'Logged out successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET_SENT: 'If that email exists, we sent a password reset link',
  PASSWORD_RESET_SUCCESS: 'Password reset successful. Please login with your new password.',
  PROFILE_UPDATED: 'Profile updated successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',

  // Spots
  SPOT_CREATED: 'Spot created successfully',
  SPOT_UPDATED: 'Spot updated successfully',
  SPOT_DELETED: 'Spot deleted successfully',
  SPOT_PAUSED: 'Spot paused',
  SPOT_ACTIVATED: 'Spot activated',
} as const;
