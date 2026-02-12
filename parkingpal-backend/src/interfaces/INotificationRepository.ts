import { Notification, NotificationType } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface INotificationRepository {
  /**
   * Find notification by ID
   */
  findById(id: string): Promise<Notification | null>;

  /**
   * Get notifications for a user with pagination
   */
  findByUserId(
    userId: string,
    limit: number,
    offset: number,
    unreadOnly?: boolean
  ): Promise<{ notifications: Notification[]; total: number }>;

  /**
   * Create a new notification
   */
  create(data: CreateNotificationData): Promise<Notification>;

  /**
   * Create multiple notifications at once
   */
  createMany(data: CreateNotificationData[]): Promise<number>;

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): Promise<Notification>;

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): Promise<number>;

  /**
   * Delete a notification
   */
  delete(id: string): Promise<void>;

  /**
   * Count unread notifications for a user
   */
  countUnread(userId: string): Promise<number>;

  /**
   * Update push sent status
   */
  updatePushStatus(
    id: string,
    sent: boolean,
    error?: string
  ): Promise<Notification>;
}
