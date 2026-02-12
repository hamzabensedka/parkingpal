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
  ): Promise<MessageWithSender[]>;

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
}
