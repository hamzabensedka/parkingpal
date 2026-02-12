import { z } from 'zod';

/**
 * Validation schema for registering a push token
 */
export const registerPushTokenSchema = z.object({
  token: z.string().min(1, 'Push token is required'),
  enabled: z.boolean().optional(),
});

/**
 * Validation schema for updating push preferences
 */
export const updatePushPreferencesSchema = z.object({
  enabled: z.boolean(),
});

/**
 * Validation schema for listing notifications
 */
export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  unreadOnly: z.coerce.boolean().optional(),
});

export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;
export type UpdatePushPreferencesInput = z.infer<typeof updatePushPreferencesSchema>;
export type ListNotificationsQueryInput = z.infer<typeof listNotificationsQuerySchema>;
