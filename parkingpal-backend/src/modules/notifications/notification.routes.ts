import { Router } from 'express';
import { notificationController, authenticate } from '../../container';
import { validate, validateQuery } from '../../middleware/validate';
import {
  registerPushTokenSchema,
  updatePushPreferencesSchema,
  listNotificationsQuerySchema,
} from './notification.validation';

const router = Router();

// GET /api/notifications - List notifications
router.get(
  '/',
  authenticate,
  validateQuery(listNotificationsQuerySchema),
  notificationController.listNotifications.bind(notificationController)
);

// GET /api/notifications/unread-count - Get unread count
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount.bind(notificationController)
);

// POST /api/notifications/read-all - Mark all as read
router.post(
  '/read-all',
  authenticate,
  notificationController.markAllAsRead.bind(notificationController)
);

// POST /api/notifications/register-token - Register push token
router.post(
  '/register-token',
  authenticate,
  validate(registerPushTokenSchema),
  notificationController.registerPushToken.bind(notificationController)
);

// PUT /api/notifications/preferences - Update preferences
router.put(
  '/preferences',
  authenticate,
  validate(updatePushPreferencesSchema),
  notificationController.updatePreferences.bind(notificationController)
);

// POST /api/notifications/:id/read - Mark single as read
router.post(
  '/:id/read',
  authenticate,
  notificationController.markAsRead.bind(notificationController)
);

// DELETE /api/notifications/:id - Delete notification
router.delete(
  '/:id',
  authenticate,
  notificationController.deleteNotification.bind(notificationController)
);

export default router;
