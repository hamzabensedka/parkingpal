import type {
  NotificationDTO,
  RegisterPushTokenRequest,
  UpdatePushPreferencesRequest,
  ListNotificationsQuery,
} from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';
import type { Notification } from '../../types';

export interface NotificationApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Map backend NotificationDTO to frontend Notification type
 */
function mapNotificationDTO(dto: NotificationDTO): Notification {
  return {
    id: dto.id,
    userId: dto.userId,
    type: dto.type,
    title: dto.title,
    body: dto.body,
    data: dto.data,
    read: dto.read,
    createdAt: dto.createdAt,
  };
}

/**
 * Notification API - list, read, delete notifications and register push tokens
 */
export function createNotificationApi(client: AxiosInstance) {
  return {
    /**
     * List notifications for the current user
     */
    async list(query?: ListNotificationsQuery): Promise<{
      notifications: Notification[];
      total: number;
      unreadCount: number;
    }> {
      const params = new URLSearchParams();
      if (query?.limit) params.append('limit', String(query.limit));
      if (query?.offset) params.append('offset', String(query.offset));
      if (query?.unreadOnly) params.append('unreadOnly', 'true');

      const url = params.toString() ? `/api/notifications?${params}` : '/api/notifications';

      const { data } = await client.get<
        NotificationApiResponse<{
          notifications: NotificationDTO[];
          total: number;
          unreadCount: number;
        }>
      >(url, { timeout: 10000 });

      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to list notifications');
      }

      return {
        notifications: data.data.notifications.map(mapNotificationDTO),
        total: data.data.total,
        unreadCount: data.data.unreadCount,
      };
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
      const { data } = await client.get<NotificationApiResponse<{ unreadCount: number }>>(
        '/api/notifications/unread-count',
        { timeout: 10000 }
      );

      if (!data.success || data.data === undefined) {
        throw new Error(data.error ?? 'Failed to get unread count');
      }

      return data.data.unreadCount;
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
      const { data } = await client.post<NotificationApiResponse<null>>(
        `/api/notifications/${notificationId}/read`,
        {},
        { timeout: 10000 }
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to mark notification as read');
      }
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<number> {
      const { data } = await client.post<NotificationApiResponse<{ count: number }>>(
        '/api/notifications/read-all',
        {},
        { timeout: 10000 }
      );

      if (!data.success || data.data === undefined) {
        throw new Error(data.error ?? 'Failed to mark all as read');
      }

      return data.data.count;
    },

    /**
     * Delete a notification
     */
    async delete(notificationId: string): Promise<void> {
      const { data } = await client.delete<NotificationApiResponse<null>>(
        `/api/notifications/${notificationId}`,
        { timeout: 10000 }
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to delete notification');
      }
    },

    /**
     * Register push token
     */
    async registerPushToken(token: string, enabled = true): Promise<void> {
      const body: RegisterPushTokenRequest = { token, enabled };

      const { data } = await client.post<NotificationApiResponse<null>>(
        '/api/notifications/register-token',
        body,
        { timeout: 10000 }
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to register push token');
      }
    },

    /**
     * Update push notification preferences
     */
    async updatePreferences(enabled: boolean): Promise<void> {
      const body: UpdatePushPreferencesRequest = { enabled };

      const { data } = await client.put<NotificationApiResponse<null>>(
        '/api/notifications/preferences',
        body,
        { timeout: 10000 }
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to update preferences');
      }
    },
  };
}

export type NotificationApi = ReturnType<typeof createNotificationApi>;
