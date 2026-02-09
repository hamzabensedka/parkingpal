import { PrismaClient, Booking, BookingStatus } from '@prisma/client';
import {
  IBookingRepository,
  BookingWithRelations,
  CreateBookingData,
} from '../interfaces/IBookingRepository';

const BOOKING_INCLUDE = {
  spot: {
    include: {
      photos: { orderBy: { sortOrder: 'asc' as const }, take: 1, where: { isPrimary: true } },
    },
  },
  renter: true,
  host: true,
  vehicle: true,
} as const;

/**
 * Prisma implementation of IBookingRepository
 * Single Responsibility: Database access for Booking entity
 */
export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateBookingData): Promise<BookingWithRelations> {
    return this.prisma.booking.create({
      data: {
        renterId: data.renterId,
        hostId: data.hostId,
        spotId: data.spotId,
        vehicleId: data.vehicleId,
        startTime: data.startTime,
        endTime: data.endTime,
        totalPrice: data.totalPrice,
        hourlyRate: data.hourlyRate,
        duration: data.duration,
        cancellationPolicy: data.cancellationPolicy,
        status: data.status,
        renterNotes: data.renterNotes,
      },
      include: BOOKING_INCLUDE,
    }) as Promise<BookingWithRelations>;
  }

  async findById(id: string): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    }) as Promise<BookingWithRelations | null>;
  }

  async findByRenterId(renterId: string, status?: BookingStatus): Promise<BookingWithRelations[]> {
    const where: any = { renterId };
    if (status) where.status = status;

    return this.prisma.booking.findMany({
      where,
      include: BOOKING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    }) as Promise<BookingWithRelations[]>;
  }

  async findByHostId(hostId: string, status?: BookingStatus): Promise<BookingWithRelations[]> {
    const where: any = { hostId };
    if (status) where.status = status;

    return this.prisma.booking.findMany({
      where,
      include: BOOKING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    }) as Promise<BookingWithRelations[]>;
  }

  async findBySpotId(spotId: string): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      where: { spotId },
      include: BOOKING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    }) as Promise<BookingWithRelations[]>;
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    data?: Partial<Pick<Booking, 'cancelledAt' | 'cancelledBy' | 'cancellationReason' | 'hostNotes'>>
  ): Promise<BookingWithRelations> {
    return this.prisma.booking.update({
      where: { id },
      data: {
        status,
        ...data,
      },
      include: BOOKING_INCLUDE,
    }) as Promise<BookingWithRelations>;
  }

  async hasOverlap(spotId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<boolean> {
    const where: any = {
      spotId,
      status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.booking.count({ where });
    return count > 0;
  }
}
