import { Notification } from '@prisma/client';
import { NotificationDTO, NotificationType } from '@parkingpal/shared-types';

/**
 * Map Prisma NotificationType to DTO type
 */
function mapNotificationType(type: string): NotificationType {
  const typeMap: Record<string, NotificationType> = {
    BOOKING: 'booking',
    MESSAGE: 'message',
    PAYMENT: 'payment',
    REVIEW: 'review',
    SYSTEM: 'system',
  };
  return typeMap[type] ?? 'system';
}

/**
 * Map Notification to NotificationDTO
 */
export function toNotificationDTO(notification: Notification): NotificationDTO {
  return {
    id: notification.id,
    userId: notification.userId,
    type: mapNotificationType(notification.type),
    title: notification.title,
    body: notification.body,
    data: notification.data as Record<string, unknown> | undefined,
    read: notification.read,
    readAt: notification.readAt?.toISOString(),
    createdAt: notification.createdAt.toISOString(),
  };
}
