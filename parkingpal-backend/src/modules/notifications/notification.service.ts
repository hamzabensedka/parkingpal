import { Notification, NotificationType } from '@prisma/client';
import { INotificationRepository, CreateNotificationData } from '../../interfaces/INotificationRepository';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { IPushNotificationService, PushNotificationData } from '../../interfaces/IPushNotificationService';
import { ApiError } from '../../middleware/errorHandler';

export interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: PushNotificationData;
  sendPush?: boolean;
}

export class NotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly pushService: IPushNotificationService
  ) {}

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    limit: number,
    offset: number,
    unreadOnly = false
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const [result, unreadCount] = await Promise.all([
      this.notificationRepository.findByUserId(userId, limit, offset, unreadOnly),
      this.notificationRepository.countUnread(userId),
    ]);

    return {
      notifications: result.notifications,
      total: result.total,
      unreadCount,
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    if (notification.userId !== userId) {
      throw ApiError.forbidden('Not authorized');
    }

    if (notification.read) {
      return notification;
    }

    return this.notificationRepository.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllAsRead(userId);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    if (notification.userId !== userId) {
      throw ApiError.forbidden('Not authorized');
    }

    await this.notificationRepository.delete(notificationId);
  }

  /**
   * Register a push token for a user
   */
  async registerPushToken(userId: string, token: string, enabled = true): Promise<void> {
    if (!this.pushService.isValidPushToken(token)) {
      throw ApiError.badRequest('Invalid push token');
    }

    await this.userRepository.updatePushToken(userId, token, enabled);
  }

  /**
   * Update push notification preferences
   */
  async updatePushPreferences(userId: string, enabled: boolean): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await this.userRepository.updatePushToken(userId, user.expoPushToken ?? null, enabled);
  }

  /**
   * Send a notification to a user (creates DB record + sends push)
   */
  async sendNotification(params: SendNotificationParams): Promise<Notification> {
    const { userId, type, title, body, data, sendPush = true } = params;

    // Create notification in DB
    const notification = await this.notificationRepository.create({
      userId,
      type,
      title,
      body,
      data,
    });

    // Send push notification if enabled
    if (sendPush) {
      await this.sendPushForNotification(notification);
    }

    return notification;
  }

  /**
   * Send push notification for an existing notification record
   */
  private async sendPushForNotification(notification: Notification): Promise<void> {
    const user = await this.userRepository.findById(notification.userId);
    if (!user || !user.expoPushToken || !user.pushNotificationsEnabled) {
      return;
    }

    try {
      const result = await this.pushService.sendPush({
        pushToken: user.expoPushToken,
        title: notification.title,
        body: notification.body,
        data: notification.data as PushNotificationData | undefined,
      });

      await this.notificationRepository.updatePushStatus(
        notification.id,
        result.success,
        result.error
      );
    } catch (error) {
      console.error('Push notification error:', error);
      await this.notificationRepository.updatePushStatus(
        notification.id,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // ==========================================
  // Helper methods for common notification types
  // ==========================================

  /**
   * Send booking-related notification
   */
  async sendBookingNotification(
    userId: string,
    title: string,
    body: string,
    bookingId: string
  ): Promise<Notification> {
    return this.sendNotification({
      userId,
      type: 'BOOKING',
      title,
      body,
      data: { bookingId },
    });
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(
    userId: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
  ): Promise<Notification> {
    return this.sendNotification({
      userId,
      type: 'MESSAGE',
      title: `New message from ${senderName}`,
      body: messagePreview.substring(0, 100),
      data: { conversationId },
    });
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(
    userId: string,
    title: string,
    body: string,
    bookingId?: string
  ): Promise<Notification> {
    return this.sendNotification({
      userId,
      type: 'PAYMENT',
      title,
      body,
      data: bookingId ? { bookingId } : undefined,
    });
  }

  /**
   * Send review notification
   */
  async sendReviewNotification(
    userId: string,
    reviewerName: string,
    rating: number,
    spotId?: string
  ): Promise<Notification> {
    return this.sendNotification({
      userId,
      type: 'REVIEW',
      title: 'New review received',
      body: `${reviewerName} left you a ${rating}-star review`,
      data: spotId ? { spotId } : undefined,
    });
  }
}
