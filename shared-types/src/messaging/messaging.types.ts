/**
 * Messaging Request/Response Types
 * Contract between frontend & backend for the messaging feature
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';

// ==========================================
// DTOs
// ==========================================

/**
 * User summary for messaging (minimal user data)
 */
export interface MessageUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
}

/**
 * Booking summary for conversation context
 */
export interface ConversationBookingDTO {
  id: string;
  spotTitle: string;
  spotAddress: string;
  startTime: string;
  endTime: string;
  status: string;
}

/**
 * Message DTO
 */
export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

/**
 * Message with sender info
 */
export interface MessageWithSenderDTO extends MessageDTO {
  sender: MessageUserDTO;
}

/**
 * Conversation summary for list view
 */
export interface ConversationSummaryDTO {
  id: string;
  bookingId: string;
  booking: ConversationBookingDTO;
  participants: MessageUserDTO[];
  lastMessage?: MessageDTO;
  unreadCount: number;
  updatedAt: string;
}

/**
 * Full conversation with messages
 */
export interface ConversationDTO {
  id: string;
  bookingId: string;
  booking: ConversationBookingDTO;
  participants: MessageUserDTO[];
  messages: MessageWithSenderDTO[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Request Types
// ==========================================

/**
 * Create a new conversation for a booking
 */
export interface CreateConversationRequest {
  bookingId: string;
}

/**
 * Send a message in a conversation
 */
export interface SendMessageRequest {
  conversationId: string;
  text: string;
}

/**
 * List conversations query params
 */
export interface ListConversationsQuery {
  limit?: number;
  offset?: number;
}

/**
 * Get conversation messages query params
 */
export interface GetConversationMessagesQuery {
  limit?: number;
  offset?: number;
}

// ==========================================
// Response Types
// ==========================================

export type ListConversationsResponse =
  | ApiSuccessResponse<{ conversations: ConversationSummaryDTO[]; total: number }>
  | ApiErrorResponse;

export type GetConversationResponse =
  | ApiSuccessResponse<{ conversation: ConversationDTO }>
  | ApiErrorResponse;

export type CreateConversationResponse =
  | ApiSuccessResponse<{ conversation: ConversationDTO }>
  | ApiErrorResponse;

export type SendMessageResponse =
  | ApiSuccessResponse<{ message: MessageDTO }>
  | ApiErrorResponse;

export type MarkMessageReadResponse = ApiSuccessResponse<null> | ApiErrorResponse;

export type MarkConversationReadResponse = ApiSuccessResponse<null> | ApiErrorResponse;
