import { z } from 'zod';

/**
 * Detect spam patterns in message text
 */
function detectSpamPatterns(text: string): { isSpam: boolean; reason?: string } {
  const trimmed = text.trim();

  // Check for excessive repeated characters (e.g., "aaaaaaa")
  const repeatedCharsRegex = /(.)\1{9,}/; // Same character repeated 10+ times
  if (repeatedCharsRegex.test(text)) {
    return { isSpam: true, reason: 'Message contains excessive repeated characters' };
  }

  // Check for excessive repeated words (e.g., "hello hello hello hello")
  const words = trimmed.split(/\s+/);
  if (words.length >= 5) {
    const wordCounts = words.reduce((acc, word) => {
      const normalized = word.toLowerCase();
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxRepeats = Math.max(...Object.values(wordCounts));
    if (maxRepeats >= 5 && words.length < 20) {
      return { isSpam: true, reason: 'Message contains excessive word repetition' };
    }
  }

  // Check for excessive uppercase (more than 70% uppercase letters)
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 20) {
    const uppercaseCount = text.replace(/[^A-Z]/g, '').length;
    const uppercaseRatio = uppercaseCount / letters.length;
    if (uppercaseRatio > 0.7) {
      return { isSpam: true, reason: 'Message contains excessive uppercase letters' };
    }
  }

  // Check for excessive special characters/emojis (more than 50% of message)
  const alphanumeric = text.replace(/[^a-zA-Z0-9\s]/g, '');
  const alphanumericRatio = alphanumeric.length / text.length;
  if (text.length >= 20 && alphanumericRatio < 0.3) {
    return { isSpam: true, reason: 'Message contains excessive special characters' };
  }

  return { isSpam: false };
}

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
  text: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (maximum 2000 characters)')
    .refine((text) => text.trim().length >= 1, {
      message: 'Message must contain at least 1 non-whitespace character',
    })
    .refine((text) => {
      const { isSpam, reason } = detectSpamPatterns(text);
      if (isSpam) {
        throw new Error(reason || 'Message appears to be spam');
      }
      return true;
    }, {
      message: 'Message validation failed',
    }),
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
