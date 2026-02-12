import { Conversation, Message, User, Booking } from '@prisma/client';

export type ConversationWithRelations = Conversation & {
  participants: User[];
  booking: Booking & {
    spot: { title: string; address: string } | null;
  };
  messages: (Message & { sender: User })[];
  _count?: { messages: number };
};

export type ConversationSummary = Conversation & {
  participants: User[];
  booking: Booking & {
    spot: { title: string; address: string } | null;
  };
  messages: Message[];
  _count?: { messages: number };
};

export interface IConversationRepository {
  /**
   * Find a conversation by ID with all relations
   */
  findById(id: string): Promise<ConversationWithRelations | null>;

  /**
   * Find a conversation by booking ID
   */
  findByBookingId(bookingId: string): Promise<ConversationWithRelations | null>;

  /**
   * Get all conversations for a user (as participant)
   */
  findByUserId(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ conversations: ConversationSummary[]; total: number }>;

  /**
   * Create a new conversation for a booking
   */
  create(bookingId: string, participantIds: string[]): Promise<ConversationWithRelations>;

  /**
   * Get unread message count for a user in a conversation
   */
  getUnreadCount(conversationId: string, userId: string): Promise<number>;

  /**
   * Mark all messages in a conversation as read for a user
   */
  markAllAsRead(conversationId: string, userId: string): Promise<void>;

  /**
   * Check if user is a participant in conversation
   */
  isParticipant(conversationId: string, userId: string): Promise<boolean>;
}
