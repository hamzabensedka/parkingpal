import axios from 'axios';

// ─── Types ───

export type ErrorCategory =
  | 'network'
  | 'timeout'
  | 'auth'
  | 'validation'
  | 'business'
  | 'not_found'
  | 'rate_limit'
  | 'server'
  | 'unknown';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface AppError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  title: string;
  message: string;
  /** Original error for dev logging — NEVER shown to user */
  originalError?: unknown;
  /** Validation field errors from backend `details` */
  fieldErrors?: Record<string, string>;
  /** Whether a retry is plausible */
  retryable: boolean;
  /** Auto-dismiss timeout in ms. null = user must dismiss */
  autoDismissMs: number | null;
  /** Backend traceId for support */
  traceId?: string;
}

// ─── Severity Map ───

const CATEGORY_SEVERITY: Record<ErrorCategory, ErrorSeverity> = {
  network: 'warning',
  timeout: 'warning',
  auth: 'error',
  validation: 'info',
  business: 'error',
  not_found: 'info',
  rate_limit: 'warning',
  server: 'error',
  unknown: 'error',
};

// ─── Auto-dismiss Map (ms) ───

const CATEGORY_AUTO_DISMISS: Record<ErrorCategory, number | null> = {
  network: 5000,
  timeout: 5000,
  auth: null,
  validation: null,
  business: null,
  not_found: null,
  rate_limit: 4000,
  server: null,
  unknown: null,
};

// ─── Backend Error → Friendly Message Map ───

interface FriendlyError {
  title: string;
  message: string;
  category: ErrorCategory;
}

const BACKEND_ERROR_MAP: Record<string, FriendlyError> = {
  // Auth
  'Invalid email or password': {
    title: 'Login Failed',
    message: 'The email or password you entered is incorrect.',
    category: 'auth',
  },
  'Email already registered': {
    title: 'Email Taken',
    message: 'An account with this email already exists. Try signing in instead.',
    category: 'validation',
  },
  'Phone number already registered': {
    title: 'Phone Taken',
    message: 'This phone number is already linked to another account.',
    category: 'validation',
  },
  'Your account has been suspended': {
    title: 'Account Suspended',
    message: 'Your account has been suspended. Please contact support.',
    category: 'auth',
  },
  'Your account is not active': {
    title: 'Account Inactive',
    message: 'Your account is not active. Please contact support.',
    category: 'auth',
  },
  'Please verify your email first': {
    title: 'Email Not Verified',
    message: 'Please check your inbox and verify your email before signing in.',
    category: 'auth',
  },
  'Invalid or expired token': {
    title: 'Link Expired',
    message: 'This link has expired. Please request a new one.',
    category: 'auth',
  },
  'Token has expired': {
    title: 'Link Expired',
    message: 'This link has expired. Please request a new one.',
    category: 'auth',
  },

  // Spots
  'Spot not found': {
    title: 'Spot Not Found',
    message: 'This parking spot is no longer available.',
    category: 'not_found',
  },
  'You are not the owner of this spot': {
    title: 'Not Authorized',
    message: 'You can only manage your own parking spots.',
    category: 'auth',
  },
  'Spot is already active': {
    title: 'Already Active',
    message: 'This spot is already active.',
    category: 'business',
  },
  'At least one photo is required': {
    title: 'Photo Required',
    message: 'Please add at least one photo of your parking spot.',
    category: 'validation',
  },

  // Bookings
  'Booking not found': {
    title: 'Booking Not Found',
    message: 'This booking could not be found.',
    category: 'not_found',
  },
  'This time slot is already booked': {
    title: 'Time Slot Unavailable',
    message: 'Someone else has already booked this time. Please choose a different time.',
    category: 'business',
  },
  'You cannot book your own spot': {
    title: 'Cannot Book Own Spot',
    message: "You can't create a booking for your own parking spot.",
    category: 'business',
  },
  'Your vehicle size is not accepted at this spot': {
    title: 'Vehicle Too Large',
    message: "This parking spot doesn't accommodate your vehicle size. Please try a different spot.",
    category: 'business',
  },
  'This booking cannot be cancelled': {
    title: 'Cannot Cancel',
    message: 'This booking can no longer be cancelled.',
    category: 'business',
  },
  'Only pending bookings can be confirmed': {
    title: 'Cannot Confirm',
    message: 'Only pending bookings can be confirmed.',
    category: 'business',
  },

  // General
  'Resource not found': {
    title: 'Not Found',
    message: "The item you're looking for doesn't exist or has been removed.",
    category: 'not_found',
  },
  'Too many requests, please try again later': {
    title: 'Too Many Requests',
    message: "You're doing that too fast. Please wait a moment.",
    category: 'rate_limit',
  },
};

// ─── Helper: build AppError ───

function buildAppError(
  category: ErrorCategory,
  title: string,
  message: string,
  originalError: unknown,
  overrides?: Partial<AppError>,
): AppError {
  return {
    category,
    severity: CATEGORY_SEVERITY[category],
    title,
    message,
    retryable: ['network', 'timeout', 'server', 'rate_limit', 'unknown'].includes(category),
    autoDismissMs: CATEGORY_AUTO_DISMISS[category],
    originalError,
    ...overrides,
  };
}

// ─── Main Classifier ───

export function classifyError(error: unknown): AppError {
  // 1. Axios errors
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const backendData = (error as any).backendError ?? error.response?.data;
    const backendMsg: string | undefined = backendData?.error;
    const traceId: string | undefined = backendData?.traceId;
    const details: Record<string, string> | undefined = backendData?.details;

    // No response at all → network or timeout
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED') {
        return buildAppError(
          'timeout',
          'Request Timed Out',
          'The server took too long to respond. Please try again.',
          error,
          { traceId },
        );
      }
      return buildAppError(
        'network',
        'No Connection',
        'Please check your internet connection and try again.',
        error,
        { traceId },
      );
    }

    // Check backend error map first (for known business messages)
    if (backendMsg && BACKEND_ERROR_MAP[backendMsg]) {
      const mapped = BACKEND_ERROR_MAP[backendMsg];
      return buildAppError(mapped.category, mapped.title, mapped.message, error, {
        traceId,
        fieldErrors: details,
      });
    }

    // Status-based classification
    switch (status) {
      case 401:
        return buildAppError(
          'auth',
          'Session Expired',
          'Please sign in again to continue.',
          error,
          { traceId },
        );
      case 403:
        return buildAppError(
          'auth',
          'Access Denied',
          "You don't have permission to perform this action.",
          error,
          { traceId },
        );
      case 404:
        return buildAppError(
          'not_found',
          'Not Found',
          "The item you're looking for doesn't exist or has been removed.",
          error,
          { traceId },
        );
      case 409:
        return buildAppError(
          'business',
          backendMsg || 'Conflict',
          backendMsg || 'This action conflicts with the current state. Please try again.',
          error,
          { traceId },
        );
      case 422:
      case 400:
        return buildAppError(
          'validation',
          'Invalid Input',
          backendMsg || 'Please check your input and try again.',
          error,
          { traceId, fieldErrors: details },
        );
      case 429:
        return buildAppError(
          'rate_limit',
          'Too Many Requests',
          "You're doing that too fast. Please wait a moment.",
          error,
          { traceId },
        );
      default:
        if (status && status >= 500) {
          return buildAppError(
            'server',
            'Something Went Wrong',
            "We're having trouble on our end. Please try again in a moment.",
            error,
            { traceId },
          );
        }
    }
  }

  // 2. Custom timeout errors (from withTimeout wrappers in API services)
  if (error instanceof Error && /timed?\s*out/i.test(error.message)) {
    return buildAppError(
      'timeout',
      'Request Timed Out',
      'The server took too long to respond. Please try again.',
      error,
    );
  }

  // 3. Fallback
  return buildAppError(
    'unknown',
    'Something Went Wrong',
    'An unexpected error occurred. Please try again.',
    error,
  );
}
