import { PrismaClient, Notification, Prisma } from '@prisma/client';
import {
  INotificationRepository,
  CreateNotificationData,
} from '../interfaces/INotificationRepository';

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async findByUserId(
    userId: string,
    limit: number,
    offset: number,
    unreadOnly = false
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where = unreadOnly
      ? { userId, read: false }
      : { userId };

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async createMany(data: CreateNotificationData[]): Promise<number> {
    const result = await this.prisma.notification.createMany({
      data: data.map((d) => ({
        userId: d.userId,
        type: d.type,
        title: d.title,
        body: d.body,
        data: d.data as Prisma.InputJsonValue | undefined,
      })),
    });
    return result.count;
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.notification.delete({
      where: { id },
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async updatePushStatus(
    id: string,
    sent: boolean,
    error?: string
  ): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        pushSent: sent,
        pushSentAt: sent ? new Date() : undefined,
        pushError: error ?? null,
      },
    });
  }
}
