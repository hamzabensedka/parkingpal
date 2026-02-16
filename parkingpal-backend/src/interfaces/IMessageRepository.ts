import { Message, User } from '@prisma/client';

export type MessageWithSender = Message & {
  sender: User;
};

export interface CreateMessageData {
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
}

export interface IMessageRepository {
  /**
   * Find a message by ID
   */
  findById(id: string): Promise<MessageWithSender | null>;

  /**
   * Get messages for a conversation with pagination
   */
  findByConversationId(
    conversationId: string,
    limit: number,
    offset: number
  ): Promise<{ messages: MessageWithSender[]; total: number }>;

  /**
   * Create a new message
   */
  create(data: CreateMessageData): Promise<MessageWithSender>;

  /**
   * Mark a message as read
   */
  markAsRead(messageId: string): Promise<Message>;

  /**
   * Mark all messages in a conversation as read for a specific receiver
   */
  markAllAsReadForUser(conversationId: string, receiverId: string): Promise<number>;

  /**
   * Count unread messages for a user in a conversation
   */
  countUnread(conversationId: string, receiverId: string): Promise<number>;

  /**
   * Count unread messages for multiple conversations in a single query
   * Returns a map of conversationId -> unread count
   */
  countUnreadForConversations(
    conversationIds: string[],
    receiverId: string
  ): Promise<Map<string, number>>;
}
