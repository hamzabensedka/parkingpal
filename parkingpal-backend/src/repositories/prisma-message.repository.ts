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
  ): Promise<{ messages: MessageWithSender[]; total: number }> {
    const where = { conversationId };

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: { sender: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.message.count({ where }),
    ]);

    return { messages, total };
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

  async countUnreadForConversations(
    conversationIds: string[],
    receiverId: string
  ): Promise<Map<string, number>> {
    // Use groupBy to count unread messages for all conversations in one query
    const results = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: conversationIds },
        receiverId,
        read: false,
      },
      _count: {
        id: true,
      },
    });

    // Convert to Map for easy lookup
    const countMap = new Map<string, number>();

    // Initialize all conversation IDs with 0
    conversationIds.forEach(id => countMap.set(id, 0));

    // Update with actual counts
    results.forEach(result => {
      countMap.set(result.conversationId, result._count.id);
    });

    return countMap;
  }
}
