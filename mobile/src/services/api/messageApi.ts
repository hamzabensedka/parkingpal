import type {
  ConversationSummaryDTO,
  ConversationDTO,
  MessageDTO,
  MessageWithSenderDTO,
  CreateConversationRequest,
  SendMessageRequest,
  ListConversationsQuery,
  GetConversationMessagesQuery,
} from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';
import type { Message, Conversation, User } from '../../types';

export interface MessageApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Map backend MessageDTO to frontend Message type
 */
function mapMessageDTO(dto: MessageDTO, bookingId: string): Message {
  return {
    id: dto.id,
    bookingId,
    senderId: dto.senderId,
    receiverId: dto.receiverId,
    text: dto.text,
    read: dto.read,
    createdAt: dto.createdAt,
  };
}

/**
 * Map backend MessageUserDTO to frontend User (partial)
 */
function mapMessageUser(user: { id: string; firstName: string; lastName: string; profilePhoto?: string }): User {
  return {
    id: user.id,
    email: '',
    firstName: user.firstName,
    lastName: user.lastName,
    phone: '',
    profilePhoto: user.profilePhoto,
    userType: 'renter',
    verified: { phone: false, id: false },
    rating: 0,
    reviewCount: 0,
    memberSince: '',
  };
}

/**
 * Map backend ConversationSummaryDTO to frontend Conversation type
 */
function mapConversationSummary(dto: ConversationSummaryDTO): Conversation {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    participants: dto.participants.map(mapMessageUser),
    lastMessage: dto.lastMessage ? mapMessageDTO(dto.lastMessage, dto.bookingId) : undefined,
    unreadCount: dto.unreadCount,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Map backend ConversationDTO to frontend Conversation type with messages
 */
function mapConversation(dto: ConversationDTO): Conversation & { messages: Message[] } {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    participants: dto.participants.map(mapMessageUser),
    lastMessage: dto.messages.length > 0
      ? mapMessageDTO(dto.messages[dto.messages.length - 1], dto.bookingId)
      : undefined,
    unreadCount: dto.unreadCount,
    updatedAt: dto.updatedAt,
    messages: dto.messages.map(m => mapMessageDTO(m, dto.bookingId)),
  };
}

/**
 * Messaging API - conversations and messages
 */
export function createMessageApi(client: AxiosInstance) {
  return {
    // ==========================================
    // Conversations
    // ==========================================

    /**
     * List all conversations for the current user
     */
    async listConversations(query?: ListConversationsQuery): Promise<{ conversations: Conversation[]; total: number }> {
      const params = new URLSearchParams();
      if (query?.limit) params.append('limit', String(query.limit));
      if (query?.offset) params.append('offset', String(query.offset));

      const url = params.toString() ? `/api/conversations?${params}` : '/api/conversations';

      const { data } = await client.get<MessageApiResponse<{ conversations: ConversationSummaryDTO[]; total: number }>>(
        url,
        { timeout: 10000 }
      );

      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to list conversations');
      }

      return {
        conversations: data.data.conversations.map(mapConversationSummary),
        total: data.data.total,
      };
    },

    /**
     * Get a conversation by ID with messages
     */
    async getConversation(conversationId: string): Promise<Conversation & { messages: Message[] }> {
      const { data } = await client.get<MessageApiResponse<{ conversation: ConversationDTO }>>(
        `/api/conversations/${conversationId}`,
        { timeout: 10000 }
      );

      if (!data.success || !data.data?.conversation) {
        throw new Error(data.error ?? 'Failed to get conversation');
      }

      return mapConversation(data.data.conversation);
    },

    /**
     * Get or create a conversation for a booking
     */
    async getOrCreateConversation(bookingId: string): Promise<Conversation & { messages: Message[] }> {
      const body: CreateConversationRequest = { bookingId };

      const { data } = await client.post<MessageApiResponse<{ conversation: ConversationDTO }>>(
        '/api/conversations',
        body,
        { timeout: 10000 }
      );

      if (!data.success || !data.data?.conversation) {
        throw new Error(data.error ?? 'Failed to get or create conversation');
      }

      return mapConversation(data.data.conversation);
    },

    /**
     * Get messages for a conversation with pagination
     */
    async getMessages(
      conversationId: string,
      bookingId: string,
      query?: GetConversationMessagesQuery
    ): Promise<Message[]> {
      const params = new URLSearchParams();
      if (query?.limit) params.append('limit', String(query.limit));
      if (query?.offset) params.append('offset', String(query.offset));

      const url = params.toString()
        ? `/api/conversations/${conversationId}/messages?${params}`
        : `/api/conversations/${conversationId}/messages`;

      const { data } = await client.get<MessageApiResponse<{ messages: MessageDTO[] }>>(
        url,
        { timeout: 10000 }
      );

      if (!data.success || !data.data?.messages) {
        throw new Error(data.error ?? 'Failed to get messages');
      }

      return data.data.messages.map(m => mapMessageDTO(m, bookingId));
    },

    /**
     * Mark all messages in a conversation as read
     */
    async markConversationRead(conversationId: string): Promise<void> {
      const { data } = await client.post<MessageApiResponse<null>>(
        `/api/conversations/${conversationId}/read`,
        {},
        { timeout: 10000 }
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to mark conversation as read');
      }
    },

    // ==========================================
    // Messages
    // ==========================================

    /**
     * Send a message in a conversation
     */
    async sendMessage(conversationId: string, text: string, bookingId: string): Promise<Message> {
      const body: SendMessageRequest = { conversationId, text };

      const { data } = await client.post<MessageApiResponse<{ message: MessageDTO }>>(
        '/api/messages',
        body,
        { timeout: 10000 }
      );

      if (!data.success || !data.data?.message) {
        throw new Error(data.error ?? 'Failed to send message');
      }

      return mapMessageDTO(data.data.message, bookingId);
    },

    /**
     * Mark a single message as read
     */
    async markMessageRead(messageId: string): Promise<void> {
      const { data } = await client.post<MessageApiResponse<null>>(
        `/api/messages/${messageId}/read`,
        {},
        { timeout: 10000 }
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to mark message as read');
      }
    },
  };
}

export type MessageApi = ReturnType<typeof createMessageApi>;
