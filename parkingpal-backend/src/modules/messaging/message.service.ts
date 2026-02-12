import { IConversationRepository, ConversationWithRelations, ConversationSummary } from '../../interfaces/IConversationRepository';
import { IMessageRepository, MessageWithSender } from '../../interfaces/IMessageRepository';
import { IBookingRepository } from '../../interfaces/IBookingRepository';
import { ApiError } from '../../middleware/errorHandler';

export class MessageService {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly bookingRepository: IBookingRepository
  ) {}

  /**
   * Get all conversations for a user
   */
  async getConversations(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ conversations: ConversationSummary[]; total: number; unreadCounts: Map<string, number> }> {
    const result = await this.conversationRepository.findByUserId(userId, limit, offset);

    // Get unread counts for each conversation
    const unreadCounts = new Map<string, number>();
    for (const conversation of result.conversations) {
      const count = await this.messageRepository.countUnread(conversation.id, userId);
      unreadCounts.set(conversation.id, count);
    }

    return {
      conversations: result.conversations,
      total: result.total,
      unreadCounts,
    };
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(
    conversationId: string,
    userId: string
  ): Promise<{ conversation: ConversationWithRelations; unreadCount: number }> {
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    // Check if user is a participant
    const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    const unreadCount = await this.messageRepository.countUnread(conversationId, userId);

    return { conversation, unreadCount };
  }

  /**
   * Get or create a conversation for a booking
   */
  async getOrCreateConversation(
    bookingId: string,
    userId: string
  ): Promise<{ conversation: ConversationWithRelations; unreadCount: number; created: boolean }> {
    // Check if booking exists
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Verify user is either the renter or host
    if (booking.renterId !== userId && booking.hostId !== userId) {
      throw ApiError.forbidden('You are not authorized to access this booking');
    }

    // Check for existing conversation
    let conversation = await this.conversationRepository.findByBookingId(bookingId);
    let created = false;

    if (!conversation) {
      // Create new conversation with both participants
      conversation = await this.conversationRepository.create(bookingId, [
        booking.renterId,
        booking.hostId,
      ]);
      created = true;
    }

    const unreadCount = await this.messageRepository.countUnread(conversation.id, userId);

    return { conversation, unreadCount, created };
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    userId: string,
    limit: number,
    offset: number
  ): Promise<MessageWithSender[]> {
    // Verify user is a participant
    const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    return this.messageRepository.findByConversationId(conversationId, limit, offset);
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string
  ): Promise<MessageWithSender> {
    // Get conversation to find the receiver
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw ApiError.notFound('Conversation not found');
    }

    // Verify sender is a participant
    const isParticipant = conversation.participants.some(p => p.id === senderId);
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    // Find the receiver (the other participant)
    const receiver = conversation.participants.find(p => p.id !== senderId);
    if (!receiver) {
      throw ApiError.badRequest('No receiver found in conversation');
    }

    return this.messageRepository.create({
      conversationId,
      senderId,
      receiverId: receiver.id,
      text,
    });
  }

  /**
   * Mark all messages in a conversation as read for a user
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<number> {
    // Verify user is a participant
    const isParticipant = await this.conversationRepository.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    return this.messageRepository.markAllAsReadForUser(conversationId, userId);
  }

  /**
   * Mark a single message as read
   */
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    // Only the receiver can mark a message as read
    if (message.receiverId !== userId) {
      throw ApiError.forbidden('You can only mark messages sent to you as read');
    }

    if (!message.read) {
      await this.messageRepository.markAsRead(messageId);
    }
  }
}
