import { PrismaClient, UserReport } from '@prisma/client';
import {
  IUserReportRepository,
  CreateUserReportData,
  UpdateReportStatusData,
} from '../interfaces/IUserReportRepository';

export class PrismaUserReportRepository implements IUserReportRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateUserReportData): Promise<UserReport> {
    return this.prisma.userReport.create({
      data: {
        reporterId: data.reporterId,
        reportedId: data.reportedId,
        reason: data.reason,
        description: data.description,
        relatedId: data.relatedId,
        relatedType: data.relatedType,
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reported: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<UserReport | null> {
    return this.prisma.userReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reported: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findByReporterId(
    reporterId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ reports: UserReport[]; total: number }> {
    const where = { reporterId };

    const [reports, total] = await Promise.all([
      this.prisma.userReport.findMany({
        where,
        include: {
          reported: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.userReport.count({ where }),
    ]);

    return { reports, total };
  }

  async findByReportedId(
    reportedId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ reports: UserReport[]; total: number }> {
    const where = { reportedId };

    const [reports, total] = await Promise.all([
      this.prisma.userReport.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.userReport.count({ where }),
    ]);

    return { reports, total };
  }

  async findPending(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ reports: UserReport[]; total: number }> {
    const where = { status: 'PENDING' as const };

    const [reports, total] = await Promise.all([
      this.prisma.userReport.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          reported: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' }, // Oldest first
        take: limit,
        skip: offset,
      }),
      this.prisma.userReport.count({ where }),
    ]);

    return { reports, total };
  }

  async updateStatus(id: string, data: UpdateReportStatusData): Promise<UserReport> {
    return this.prisma.userReport.update({
      where: { id },
      data: {
        status: data.status,
        reviewedBy: data.reviewedBy,
        reviewedAt: new Date(),
        resolution: data.resolution,
        actionTaken: data.actionTaken,
      },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reported: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async hasDuplicateReport(
    reporterId: string,
    reportedId: string,
    relatedId?: string
  ): Promise<boolean> {
    const existing = await this.prisma.userReport.findFirst({
      where: {
        reporterId,
        reportedId,
        ...(relatedId && { relatedId }),
      },
    });

    return existing !== null;
  }

  async countReportsAgainstUser(userId: string): Promise<number> {
    return this.prisma.userReport.count({
      where: { reportedId: userId },
    });
  }
}
