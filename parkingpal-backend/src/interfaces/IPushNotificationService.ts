/**
 * Push Notification Service Interface
 * Allows swapping between Expo, FCM, or other push providers
 */

export interface PushNotificationData {
  bookingId?: string;
  conversationId?: string;
  spotId?: string;
  reviewId?: string;
  [key: string]: unknown;
}

export interface SendPushParams {
  pushToken: string;
  title: string;
  body: string;
  data?: PushNotificationData;
  badge?: number;
  sound?: 'default' | null;
  channelId?: string;
}

export interface SendPushResult {
  success: boolean;
  ticketId?: string;
  error?: string;
}

export interface IPushNotificationService {
  /**
   * Check if a push token is valid
   */
  isValidPushToken(token: string): boolean;

  /**
   * Send a single push notification
   */
  sendPush(params: SendPushParams): Promise<SendPushResult>;

  /**
   * Send push notifications to multiple tokens
   */
  sendPushBatch(notifications: SendPushParams[]): Promise<SendPushResult[]>;
}
