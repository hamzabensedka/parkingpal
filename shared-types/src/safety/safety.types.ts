/**
 * Safety Module Request/Response Types
 * Contract between frontend & backend for user reporting and blocking
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';

// ==========================================
// Enums
// ==========================================

/**
 * Reasons for reporting a user
 */
export type ReportReasonDTO =
  | 'harassment'
  | 'spam'
  | 'inappropriate_content'
  | 'fraudulent_listing'
  | 'no_show'
  | 'property_damage'
  | 'safety_concern'
  | 'payment_issue'
  | 'other';

/**
 * Status of a user report
 */
export type ReportStatusDTO =
  | 'pending'
  | 'under_review'
  | 'resolved'
  | 'dismissed';

/**
 * Type of entity related to a report
 */
export type ReportRelatedTypeDTO =
  | 'booking'
  | 'message'
  | 'spot'
  | 'review';

// ==========================================
// DTOs
// ==========================================

/**
 * User summary for safety features (minimal user data)
 */
export interface SafetyUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
}

/**
 * User report DTO
 */
export interface UserReportDTO {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: ReportReasonDTO;
  description?: string;
  relatedId?: string;
  relatedType?: ReportRelatedTypeDTO;
  status: ReportStatusDTO;
  createdAt: string;
  reporter?: SafetyUserDTO;
  reported?: SafetyUserDTO;
}

/**
 * User block DTO
 */
export interface UserBlockDTO {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
  blocked: SafetyUserDTO;
}

// ==========================================
// Request Types
// ==========================================

/**
 * Create a report against a user
 */
export interface CreateReportRequest {
  reportedId: string;
  reason: ReportReasonDTO;
  description?: string;
  relatedId?: string;
  relatedType?: ReportRelatedTypeDTO;
}

/**
 * Block a user
 */
export interface BlockUserRequest {
  blockedId: string;
}

/**
 * List query params for reports/blocks
 */
export interface SafetyListQuery {
  limit?: number;
  offset?: number;
}

// ==========================================
// Response Types
// ==========================================

/**
 * Pagination metadata
 */
export interface SafetyPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Create report response
 */
export type CreateReportResponse =
  | ApiSuccessResponse<{ report: UserReportDTO }>
  | ApiErrorResponse;

/**
 * List reports response
 */
export type ListReportsResponse =
  | ApiSuccessResponse<{ reports: UserReportDTO[]; pagination: SafetyPagination }>
  | ApiErrorResponse;

/**
 * Block user response
 */
export type BlockUserResponse =
  | ApiSuccessResponse<{ block: UserBlockDTO }>
  | ApiErrorResponse;

/**
 * Unblock user response
 */
export type UnblockUserResponse =
  | ApiSuccessResponse<null>
  | ApiErrorResponse;

/**
 * List blocked users response
 */
export type ListBlockedUsersResponse =
  | ApiSuccessResponse<{ blocks: UserBlockDTO[]; pagination: SafetyPagination }>
  | ApiErrorResponse;

/**
 * Check if user is blocked response
 */
export type CheckBlockStatusResponse =
  | ApiSuccessResponse<{ isBlocked: boolean }>
  | ApiErrorResponse;
