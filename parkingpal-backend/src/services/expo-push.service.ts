import Expo, { ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import {
  IPushNotificationService,
  SendPushParams,
  SendPushResult,
} from '../interfaces/IPushNotificationService';

/**
 * Expo Push Notification Service
 * Sends push notifications to Expo/React Native apps
 */
export class ExpoPushService implements IPushNotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Check if a push token is a valid Expo push token
   */
  isValidPushToken(token: string): boolean {
    return Expo.isExpoPushToken(token);
  }

  /**
   * Send a single push notification
   */
  async sendPush(params: SendPushParams): Promise<SendPushResult> {
    const results = await this.sendPushBatch([params]);
    return results[0];
  }

  /**
   * Send push notifications in batch
   * Handles chunking automatically for large batches
   */
  async sendPushBatch(notifications: SendPushParams[]): Promise<SendPushResult[]> {
    // Filter out invalid tokens
    const validNotifications = notifications.filter((n) =>
      this.isValidPushToken(n.pushToken)
    );

    if (validNotifications.length === 0) {
      return notifications.map(() => ({
        success: false,
        error: 'Invalid push token',
      }));
    }

    // Build messages
    const messages: ExpoPushMessage[] = validNotifications.map((n) => ({
      to: n.pushToken,
      title: n.title,
      body: n.body,
      data: n.data,
      sound: n.sound ?? 'default',
      badge: n.badge,
      channelId: n.channelId ?? 'default',
    }));

    // Chunk messages (Expo limits to ~100 per request)
    const chunks = this.expo.chunkPushNotifications(messages);
    const results: SendPushResult[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);

        for (const ticket of ticketChunk) {
          if (ticket.status === 'ok') {
            results.push({
              success: true,
              ticketId: ticket.id,
            });
          } else {
            // Error sending
            const errorTicket = ticket as ExpoPushTicket & { message?: string; details?: { error?: string } };
            results.push({
              success: false,
              error: errorTicket.message || errorTicket.details?.error || 'Push notification failed',
            });
          }
        }
      } catch (error) {
        // Network or server error - mark all in chunk as failed
        console.error('Expo push error:', error);
        for (let i = 0; i < chunk.length; i++) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Map back to original order (including invalid tokens)
    const finalResults: SendPushResult[] = [];
    let validIndex = 0;

    for (const notification of notifications) {
      if (this.isValidPushToken(notification.pushToken)) {
        finalResults.push(results[validIndex++]);
      } else {
        finalResults.push({
          success: false,
          error: 'Invalid push token',
        });
      }
    }

    return finalResults;
  }
}
