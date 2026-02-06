/**
 * Standard API Response Types
 * All API responses MUST follow this structure
 */

/**
 * Base success response structure
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

/**
 * Base error response structure
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: Record<string, string>;  // Validation errors
  code?: ErrorCode;                   // Error code for client handling
  reason?: string;                    // Additional context (e.g., suspension reason)
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Error codes for client-side handling
 */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_EXISTS'
  | 'PHONE_EXISTS'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_NOT_ACTIVE'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'NO_TOKEN'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
