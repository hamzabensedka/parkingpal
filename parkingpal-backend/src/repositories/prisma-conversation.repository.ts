import { PrismaClient } from '@prisma/client';
import {
  IConversationRepository,
  ConversationWithRelations,
  ConversationSummary,
} from '../interfaces/IConversationRepository';

export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<ConversationWithRelations | null> {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: true,
        booking: {
          include: {
            spot: {
              select: { title: true, address: true },
            },
          },
        },
        messages: {
          include: { sender: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByBookingId(bookingId: string): Promise<ConversationWithRelations | null> {
    return this.prisma.conversation.findUnique({
      where: { bookingId },
      include: {
        participants: true,
        booking: {
          include: {
            spot: {
              select: { title: true, address: true },
            },
          },
        },
        messages: {
          include: { sender: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findByUserId(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ conversations: ConversationSummary[]; total: number }> {
    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          participants: {
            some: { id: userId },
          },
        },
        include: {
          participants: true,
          booking: {
            include: {
              spot: {
                select: { title: true, address: true },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.conversation.count({
        where: {
          participants: {
            some: { id: userId },
          },
        },
      }),
    ]);

    return { conversations, total };
  }

  async create(bookingId: string, participantIds: string[]): Promise<ConversationWithRelations> {
    return this.prisma.conversation.create({
      data: {
        bookingId,
        participants: {
          connect: participantIds.map((id) => ({ id })),
        },
      },
      include: {
        participants: true,
        booking: {
          include: {
            spot: {
              select: { title: true, address: true },
            },
          },
        },
        messages: {
          include: { sender: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        conversationId,
        receiverId: userId,
        read: false,
      },
    });
  }

  async markAllAsRead(conversationId: string, userId: string): Promise<void> {
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const count = await this.prisma.conversation.count({
      where: {
        id: conversationId,
        participants: {
          some: { id: userId },
        },
      },
    });
    return count > 0;
  }
}
