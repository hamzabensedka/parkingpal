// Re-export all types
export * from '../modules/auth/auth.types';

// Common types used across the application

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: Record<string, string>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * User types
 */
export type UserType = 'renter' | 'host' | 'superhost';

/**
 * Verification status
 */
export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  id: boolean;
}

/**
 * JWT Token payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  userType: string;
  iat?: number;
  exp?: number;
}

/**
 * Environment type
 */
export type Environment = 'development' | 'production' | 'test';
