import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { toNotificationDTO } from './notification.mappers';
import {
  RegisterPushTokenInput,
  UpdatePushPreferencesInput,
  ListNotificationsQueryInput,
} from './notification.validation';
import { NotificationDTO } from '@parkingpal/shared-types';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * GET /api/notifications
   * List notifications for the authenticated user
   */
  async listNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as ListNotificationsQueryInput;

      const limit = query.limit ?? 20;
      const offset = query.offset ?? 0;

      const result = await this.notificationService.getNotifications(
        userId,
        limit,
        offset,
        query.unreadOnly ?? false
      );

      const notificationDTOs: NotificationDTO[] = result.notifications.map(toNotificationDTO);

      res.json({
        success: true,
        data: {
          notifications: notificationDTOs,
          unreadCount: result.unreadCount,
          pagination: {
            total: result.total,
            limit,
            offset,
            hasMore: offset + notificationDTOs.length < result.total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const unreadCount = await this.notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await this.notificationService.markAsRead(id, userId);

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/read-all
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const count = await this.notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await this.notificationService.deleteNotification(id, userId);

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/register-token
   * Register a push token for the user
   */
  async registerPushToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { token, enabled } = req.body as RegisterPushTokenInput;

      await this.notificationService.registerPushToken(userId, token, enabled ?? true);

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/notifications/preferences
   * Update push notification preferences
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { enabled } = req.body as UpdatePushPreferencesInput;

      await this.notificationService.updatePushPreferences(userId, enabled);

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
