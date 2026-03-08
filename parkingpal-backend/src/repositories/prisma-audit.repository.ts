import { PrismaClient, AdminAuditLog, Prisma } from '@prisma/client';
import {
  IAdminAuditRepository,
  CreateAuditLogData,
  AuditLogFilters,
  PaginatedAuditLogs,
} from '../interfaces/IAdminAuditRepository';

/**
 * Prisma implementation of IAdminAuditRepository
 * Single Responsibility: Database access for AdminAuditLog entity
 */
export class PrismaAuditRepository implements IAdminAuditRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateAuditLogData): Promise<AdminAuditLog> {
    return this.prisma.adminAuditLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValue: data.oldValue as Prisma.JsonObject | undefined,
        newValue: data.newValue as Prisma.JsonObject | undefined,
        metadata: data.metadata as Prisma.JsonObject | undefined,
      },
    });
  }

  async findByAdmin(
    adminId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedAuditLogs> {
    const [logs, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.adminAuditLog.count({ where: { adminId } }),
    ]);

    return { logs, total };
  }

  async findByEntity(entityType: string, entityId: string): Promise<AdminAuditLog[]> {
    return this.prisma.adminAuditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(
    limit: number,
    offset: number,
    filters?: AuditLogFilters
  ): Promise<PaginatedAuditLogs> {
    const where: Prisma.AdminAuditLogWhereInput = {};

    if (filters?.adminId) {
      where.adminId = filters.adminId;
    }
    if (filters?.action) {
      where.action = filters.action;
    }
    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters?.entityId) {
      where.entityId = filters.entityId;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async findById(id: string): Promise<AdminAuditLog | null> {
    return this.prisma.adminAuditLog.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
