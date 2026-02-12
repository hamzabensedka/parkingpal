import { z } from 'zod';

/**
 * Validation schema for creating a conversation
 */
export const createConversationSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
});

/**
 * Validation schema for sending a message
 */
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  text: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
});

/**
 * Validation schema for listing conversations
 */
export const listConversationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * Validation schema for getting conversation messages
 */
export const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListConversationsQueryInput = z.infer<typeof listConversationsQuerySchema>;
export type GetMessagesQueryInput = z.infer<typeof getMessagesQuerySchema>;
