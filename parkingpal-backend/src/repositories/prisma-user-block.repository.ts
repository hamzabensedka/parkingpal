import { PrismaClient, UserBlock } from '@prisma/client';
import { IUserBlockRepository } from '../interfaces/IUserBlockRepository';

export class PrismaUserBlockRepository implements IUserBlockRepository {
  constructor(private prisma: PrismaClient) {}

  async create(blockerId: string, blockedId: string): Promise<UserBlock> {
    return this.prisma.userBlock.create({
      data: {
        blockerId,
        blockedId,
      },
      include: {
        blocked: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
      },
    });
  }

  async delete(blockerId: string, blockedId: string): Promise<void> {
    await this.prisma.userBlock.deleteMany({
      where: {
        blockerId,
        blockedId,
      },
    });
  }

  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.prisma.userBlock.findFirst({
      where: {
        blockerId,
        blockedId,
      },
    });

    return block !== null;
  }

  async hasBlockRelationship(userId1: string, userId2: string): Promise<boolean> {
    const block = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: userId1, blockedId: userId2 },
          { blockerId: userId2, blockedId: userId1 },
        ],
      },
    });

    return block !== null;
  }

  async findBlockedByUser(
    blockerId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ blocks: UserBlock[]; total: number }> {
    const where = { blockerId };

    const [blocks, total] = await Promise.all([
      this.prisma.userBlock.findMany({
        where,
        include: {
          blocked: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.userBlock.count({ where }),
    ]);

    return { blocks, total };
  }

  async findBlockersOfUser(blockedId: string): Promise<UserBlock[]> {
    return this.prisma.userBlock.findMany({
      where: { blockedId },
      include: {
        blocker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
