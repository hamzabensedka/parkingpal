/**
 * Notification Request/Response Types
 * Contract between frontend & backend for push notifications
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';

// ==========================================
// Enums & Constants
// ==========================================

export type NotificationType = 'booking' | 'message' | 'payment' | 'review' | 'system';

// ==========================================
// DTOs
// ==========================================

/**
 * Notification DTO
 */
export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

/**
 * Push token registration request
 */
export interface RegisterPushTokenRequest {
  token: string;
  enabled?: boolean;
}

/**
 * Update push notification preferences
 */
export interface UpdatePushPreferencesRequest {
  enabled: boolean;
}

// ==========================================
// Query Types
// ==========================================

/**
 * List notifications query params
 */
export interface ListNotificationsQuery {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

// ==========================================
// Response Types
// ==========================================

export type ListNotificationsResponse =
  | ApiSuccessResponse<{ notifications: NotificationDTO[]; total: number; unreadCount: number }>
  | ApiErrorResponse;

export type GetNotificationResponse =
  | ApiSuccessResponse<{ notification: NotificationDTO }>
  | ApiErrorResponse;

export type MarkNotificationReadResponse = ApiSuccessResponse<null> | ApiErrorResponse;

export type MarkAllNotificationsReadResponse =
  | ApiSuccessResponse<{ count: number }>
  | ApiErrorResponse;

export type DeleteNotificationResponse = ApiSuccessResponse<null> | ApiErrorResponse;

export type RegisterPushTokenResponse = ApiSuccessResponse<null> | ApiErrorResponse;

export type UpdatePushPreferencesResponse = ApiSuccessResponse<null> | ApiErrorResponse;

export type GetUnreadCountResponse =
  | ApiSuccessResponse<{ unreadCount: number }>
  | ApiErrorResponse;
