import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../../middleware/errorHandler';

// Valid model names mapping to Prisma delegates
const MODEL_MAP: Record<string, string> = {
  User: 'user',
  Vehicle: 'vehicle',
  PaymentMethod: 'paymentMethod',
  Spot: 'spot',
  SpotPhoto: 'spotPhoto',
  SpotDocument: 'spotDocument',
  SpotAvailability: 'spotAvailability',
  FavoriteSpot: 'favoriteSpot',
  Booking: 'booking',
  Review: 'review',
  Conversation: 'conversation',
  Message: 'message',
  Notification: 'notification',
  WebhookEvent: 'webhookEvent',
  UserReport: 'userReport',
  UserBlock: 'userBlock',
  AdminAuditLog: 'adminAuditLog',
};

// Fields that cannot be updated through the generic endpoint
const GLOBAL_READ_ONLY_FIELDS = new Set([
  'id', 'createdAt', 'updatedAt',
]);

// Sensitive fields that should never be exposed or modified
const HIDDEN_FIELDS = new Set([
  'password', 'refreshToken', 'emailVerificationToken', 'emailVerificationExpires',
  'phoneVerificationCode', 'phoneVerificationExpires', 'passwordResetToken',
  'passwordResetExpires',
]);

// Foreign key fields that cannot be modified
const FOREIGN_KEY_FIELDS = new Set([
  'userId', 'spotId', 'hostId', 'renterId', 'bookingId', 'vehicleId',
  'reporterId', 'reportedId', 'blockerId', 'blockedId', 'conversationId',
  'senderId', 'receiverId', 'reviewerId', 'revieweeId', 'adminId',
]);

/**
 * Generic Entity Service
 * Uses Prisma directly for dynamic model access
 */
export class EntityService {
  constructor(private readonly prisma: PrismaClient) {}

  private getDelegate(modelName: string): any {
    const prismaKey = MODEL_MAP[modelName];
    if (!prismaKey) {
      throw ApiError.badRequest(`Unknown model: ${modelName}`);
    }
    return (this.prisma as any)[prismaKey];
  }

  async list(
    modelName: string,
    options: {
      limit: number;
      offset: number;
      search?: string;
      sort?: string;
      sortDir?: 'asc' | 'desc';
      filters?: Record<string, string>;
    }
  ) {
    const delegate = this.getDelegate(modelName);
    const where: any = {};

    // Apply text search on common fields
    if (options.search) {
      const searchConditions: any[] = [];
      // Search by email if User model
      if (modelName === 'User') {
        searchConditions.push(
          { email: { contains: options.search, mode: 'insensitive' } },
          { firstName: { contains: options.search, mode: 'insensitive' } },
          { lastName: { contains: options.search, mode: 'insensitive' } }
        );
      }
      // Search by title if Spot model
      if (modelName === 'Spot') {
        searchConditions.push(
          { title: { contains: options.search, mode: 'insensitive' } },
          { address: { contains: options.search, mode: 'insensitive' } }
        );
      }
      if (searchConditions.length > 0) {
        where.OR = searchConditions;
      }
    }

    // Apply status filter
    if (options.filters?.status) {
      where.status = options.filters.status;
    }

    const orderBy: any = {};
    if (options.sort) {
      orderBy[options.sort] = options.sortDir || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      delegate.findMany({
        where,
        orderBy,
        take: options.limit,
        skip: options.offset,
      }),
      delegate.count({ where }),
    ]);

    // Strip hidden fields
    const sanitized = data.map((record: any) => this.stripHiddenFields(record));

    return {
      data: sanitized,
      pagination: {
        total,
        limit: options.limit,
        offset: options.offset,
        hasMore: options.offset + data.length < total,
      },
    };
  }

  async findById(modelName: string, id: string) {
    const delegate = this.getDelegate(modelName);

    const record = await delegate.findUnique({ where: { id } });
    if (!record) {
      throw ApiError.notFound(`${modelName} not found`);
    }

    return this.stripHiddenFields(record);
  }

  async update(modelName: string, id: string, updates: Record<string, unknown>) {
    const delegate = this.getDelegate(modelName);

    // Check record exists
    const existing = await delegate.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound(`${modelName} not found`);
    }

    // Filter out read-only and foreign key fields
    const sanitizedUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (GLOBAL_READ_ONLY_FIELDS.has(key)) continue;
      if (HIDDEN_FIELDS.has(key)) continue;
      if (FOREIGN_KEY_FIELDS.has(key)) continue;
      sanitizedUpdates[key] = value;
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      throw ApiError.badRequest('No valid fields to update');
    }

    const updated = await delegate.update({
      where: { id },
      data: sanitizedUpdates,
    });

    return this.stripHiddenFields(updated);
  }

  // List admin users
  async listAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { isAdmin: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        isAdmin: true,
        adminRole: true,
        isActive: true,
        createdAt: true,
      },
    });
    return admins;
  }

  // List pending documents with spot/host info
  async listPendingDocuments(limit: number, offset: number) {
    const where = { status: 'PENDING' as const };

    const [documents, total] = await Promise.all([
      this.prisma.spotDocument.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
        include: {
          spot: {
            select: {
              id: true,
              title: true,
              address: true,
              hostId: true,
              host: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.spotDocument.count({ where }),
    ]);

    return { data: { documents }, pagination: { total, limit, offset, hasMore: offset + documents.length < total } };
  }

  // List users with pending ID verification
  async listPendingIdVerifications(limit: number, offset: number) {
    const where = {
      idVerified: false,
      idDocument: { not: null },
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          userType: true,
          idDocument: true,
          idVerified: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: { users }, pagination: { total, limit, offset, hasMore: offset + users.length < total } };
  }

  // List spots pending approval
  async listPendingSpots(limit: number, offset: number) {
    const where = {
      status: { in: ['PENDING_VERIFICATION' as const, 'UNDER_REVIEW' as const] },
    };

    const [spots, total] = await Promise.all([
      this.prisma.spot.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: limit,
        skip: offset,
        include: {
          host: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.spot.count({ where }),
    ]);

    return { data: { spots }, pagination: { total, limit, offset, hasMore: offset + spots.length < total } };
  }

  // Dashboard stats
  async getDashboardStats() {
    const [
      totalUsers,
      totalSpots,
      totalBookings,
      pendingDocuments,
      pendingReports,
      pendingIdVerifications,
      recentSignups,
      activeBookings,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.spot.count({ where: { status: { not: 'DELETED' } } }),
      this.prisma.booking.count(),
      this.prisma.spotDocument.count({ where: { status: 'PENDING' } }),
      this.prisma.userReport.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count({ where: { idVerified: false, idDocument: { not: null } } }),
      this.prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'ACTIVE'] } } }),
    ]);

    return {
      totalUsers,
      totalSpots,
      totalBookings,
      pendingDocuments,
      pendingReports,
      pendingIdVerifications,
      recentSignups,
      activeBookings,
    };
  }

  private stripHiddenFields(record: any): any {
    const result = { ...record };
    for (const field of HIDDEN_FIELDS) {
      delete result[field];
    }
    return result;
  }
}
