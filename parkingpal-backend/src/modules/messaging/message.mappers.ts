import { User, Message, Booking } from '@prisma/client';
import {
  MessageUserDTO,
  ConversationBookingDTO,
  MessageDTO,
  MessageWithSenderDTO,
  ConversationSummaryDTO,
  ConversationDTO,
} from '@parkingpal/shared-types';
import { ConversationWithRelations, ConversationSummary } from '../../interfaces/IConversationRepository';
import { MessageWithSender } from '../../interfaces/IMessageRepository';

/**
 * Map User to MessageUserDTO
 */
export function toMessageUserDTO(user: User): MessageUserDTO {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePhoto: user.profilePhoto ?? undefined,
  };
}

/**
 * Map Booking to ConversationBookingDTO
 */
export function toConversationBookingDTO(
  booking: Booking & { spot: { title: string; address: string } | null }
): ConversationBookingDTO {
  return {
    id: booking.id,
    spotTitle: booking.spot?.title ?? 'Unknown Spot',
    spotAddress: booking.spot?.address ?? '',
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    status: booking.status.toLowerCase(),
  };
}

/**
 * Map Message to MessageDTO
 */
export function toMessageDTO(message: Message): MessageDTO {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    receiverId: message.receiverId,
    text: message.text,
    read: message.read,
    readAt: message.readAt?.toISOString(),
    createdAt: message.createdAt.toISOString(),
  };
}

/**
 * Map MessageWithSender to MessageWithSenderDTO
 */
export function toMessageWithSenderDTO(message: MessageWithSender): MessageWithSenderDTO {
  return {
    ...toMessageDTO(message),
    sender: toMessageUserDTO(message.sender),
  };
}

/**
 * Map ConversationSummary to ConversationSummaryDTO
 */
export function toConversationSummaryDTO(
  conversation: ConversationSummary,
  unreadCount: number
): ConversationSummaryDTO {
  const lastMessage = conversation.messages.length > 0 ? conversation.messages[0] : undefined;

  return {
    id: conversation.id,
    bookingId: conversation.bookingId,
    booking: toConversationBookingDTO(conversation.booking),
    participants: conversation.participants.map(toMessageUserDTO),
    lastMessage: lastMessage ? toMessageDTO(lastMessage) : undefined,
    unreadCount,
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

/**
 * Map ConversationWithRelations to ConversationDTO
 */
export function toConversationDTO(
  conversation: ConversationWithRelations,
  unreadCount: number
): ConversationDTO {
  return {
    id: conversation.id,
    bookingId: conversation.bookingId,
    booking: toConversationBookingDTO(conversation.booking),
    participants: conversation.participants.map(toMessageUserDTO),
    messages: conversation.messages.map(toMessageWithSenderDTO),
    unreadCount,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}
