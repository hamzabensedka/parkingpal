import { PrismaClient, Message } from '@prisma/client';
import {
  IMessageRepository,
  MessageWithSender,
  CreateMessageData,
} from '../interfaces/IMessageRepository';

export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<MessageWithSender | null> {
    return this.prisma.message.findUnique({
      where: { id },
      include: { sender: true },
    });
  }

  async findByConversationId(
    conversationId: string,
    limit: number,
    offset: number
  ): Promise<MessageWithSender[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async create(data: CreateMessageData): Promise<MessageWithSender> {
    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text,
      },
      include: { sender: true },
    });

    // Update conversation's updatedAt timestamp
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(messageId: string): Promise<Message> {
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsReadForUser(conversationId: string, receiverId: string): Promise<number> {
    const result = await this.prisma.message.updateMany({
      where: {
        conversationId,
        receiverId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  async countUnread(conversationId: string, receiverId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        conversationId,
        receiverId,
        read: false,
      },
    });
  }
}
