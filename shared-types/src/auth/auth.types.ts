/**
 * Authentication Request/Response Types
 * Defines the contract between frontend and backend for all auth endpoints
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';
import { UserDTO, TokensDTO, AuthDataDTO, UserType } from './user.types';

// ==========================================
// REQUEST TYPES
// ==========================================

/**
 * POST /api/auth/register
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType?: UserType;
}

/**
 * POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/auth/refresh
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * POST /api/auth/logout
 */
export interface LogoutRequest {
  refreshToken?: string;
}

/**
 * POST /api/auth/forgot-password
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * POST /api/auth/reset-password
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * POST /api/auth/verify-email
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * PUT /api/users/profile
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePhoto?: string;
}

// ==========================================
// RESPONSE TYPES
// ==========================================

/**
 * Response for POST /api/auth/register
 */
export type RegisterResponse = ApiSuccessResponse<AuthDataDTO> | ApiErrorResponse;

/**
 * Response for POST /api/auth/login
 */
export type LoginResponse = ApiSuccessResponse<AuthDataDTO> | ApiErrorResponse;

/**
 * Response for POST /api/auth/refresh
 */
export type RefreshTokenResponse = ApiSuccessResponse<TokensDTO> | ApiErrorResponse;

/**
 * Response for POST /api/auth/logout
 */
export type LogoutResponse = ApiSuccessResponse<null> | ApiErrorResponse;

/**
 * Response for POST /api/auth/forgot-password
 */
export type ForgotPasswordResponse = ApiSuccessResponse<null> | ApiErrorResponse;

/**
 * Response for POST /api/auth/reset-password
 */
export type ResetPasswordResponse = ApiSuccessResponse<null> | ApiErrorResponse;

/**
 * Response for POST /api/auth/verify-email
 */
export type VerifyEmailResponse = ApiSuccessResponse<null> | ApiErrorResponse;

/**
 * Response for GET /api/auth/me
 */
export type GetCurrentUserResponse = ApiSuccessResponse<{ user: UserDTO }> | ApiErrorResponse;

/**
 * Response for GET /api/users/profile
 */
export type GetProfileResponse = ApiSuccessResponse<{ user: UserDTO }> | ApiErrorResponse;

/**
 * Response for PUT /api/users/profile
 */
export type UpdateProfileResponse = ApiSuccessResponse<{ user: UserDTO }> | ApiErrorResponse;

/**
 * Response for POST /api/users/verify-id
 */
export type VerifyIdResponse = ApiSuccessResponse<{ user: UserDTO }> | ApiErrorResponse;
