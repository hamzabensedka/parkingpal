import { PrismaClient, SpotStatus } from '@prisma/client';
import {
  ISpotRepository,
  SpotWithRelations,
  CreateSpotData,
  UpdateSpotData,
  PhotoData,
  DocumentData,
  AvailabilityData,
  SearchParams,
} from '../interfaces/ISpotRepository';

const SPOT_INCLUDE = {
  photos: { orderBy: { sortOrder: 'asc' as const } },
  documents: { orderBy: { createdAt: 'desc' as const } },
  availability: { orderBy: { dayOfWeek: 'asc' as const } },
};

/**
 * Prisma implementation of ISpotRepository
 * Single Responsibility: Database access for Spot entity
 */
export class PrismaSpotRepository implements ISpotRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSpotData): Promise<SpotWithRelations> {
    return this.prisma.spot.create({
      data: {
        hostId: data.hostId,
        title: data.title,
        description: data.description,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country ?? 'France',
        latitude: data.latitude,
        longitude: data.longitude,
        spotType: data.spotType,
        locationType: data.locationType,
        capacity: data.capacity ?? 1,
        vehicleSizes: data.vehicleSizes,
        amenities: data.amenities,
        accessType: data.accessType,
        accessInstructions: data.accessInstructions,
        accessCode: data.accessCode,
        spotLocation: data.spotLocation,
        hourlyRate: data.hourlyRate,
        dailyRate: data.dailyRate,
        weeklyRate: data.weeklyRate,
        monthlyRate: data.monthlyRate,
        houseRules: data.houseRules,
        cancellationPolicy: data.cancellationPolicy,
        instantBook: data.instantBook ?? false,
        minBookingMinutes: data.minBookingMinutes ?? 60,
        maxBookingMinutes: data.maxBookingMinutes,
        advanceNoticeMinutes: data.advanceNoticeMinutes ?? 120,
        bookingWindowDays: data.bookingWindowDays ?? 30,
        status: data.status ?? SpotStatus.DRAFT,
      },
      include: SPOT_INCLUDE,
    });
  }

  async findById(id: string): Promise<SpotWithRelations | null> {
    return this.prisma.spot.findUnique({
      where: { id },
      include: SPOT_INCLUDE,
    });
  }

  async countByHostId(hostId: string): Promise<number> {
    return this.prisma.spot.count({
      where: {
        hostId,
        status: { not: SpotStatus.DELETED },
      },
    });
  }

  async findByHostId(hostId: string): Promise<SpotWithRelations[]> {
    return this.prisma.spot.findMany({
      where: {
        hostId,
        status: { not: SpotStatus.DELETED },
      },
      include: SPOT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, hostId: string, data: UpdateSpotData): Promise<SpotWithRelations> {
    const existing = await this.prisma.spot.findFirst({
      where: { id, hostId, status: { not: SpotStatus.DELETED } },
    });
    if (!existing) {
      throw new Error('SPOT_NOT_FOUND');
    }

    return this.prisma.spot.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.spotType !== undefined && { spotType: data.spotType }),
        ...(data.locationType !== undefined && { locationType: data.locationType }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.vehicleSizes !== undefined && { vehicleSizes: data.vehicleSizes }),
        ...(data.amenities !== undefined && { amenities: data.amenities }),
        ...(data.accessType !== undefined && { accessType: data.accessType }),
        ...(data.accessInstructions !== undefined && { accessInstructions: data.accessInstructions }),
        ...(data.accessCode !== undefined && { accessCode: data.accessCode }),
        ...(data.spotLocation !== undefined && { spotLocation: data.spotLocation }),
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
        ...(data.dailyRate !== undefined && { dailyRate: data.dailyRate }),
        ...(data.weeklyRate !== undefined && { weeklyRate: data.weeklyRate }),
        ...(data.monthlyRate !== undefined && { monthlyRate: data.monthlyRate }),
        ...(data.houseRules !== undefined && { houseRules: data.houseRules }),
        ...(data.cancellationPolicy !== undefined && { cancellationPolicy: data.cancellationPolicy }),
        ...(data.instantBook !== undefined && { instantBook: data.instantBook }),
        ...(data.minBookingMinutes !== undefined && { minBookingMinutes: data.minBookingMinutes }),
        ...(data.maxBookingMinutes !== undefined && { maxBookingMinutes: data.maxBookingMinutes }),
        ...(data.advanceNoticeMinutes !== undefined && { advanceNoticeMinutes: data.advanceNoticeMinutes }),
        ...(data.bookingWindowDays !== undefined && { bookingWindowDays: data.bookingWindowDays }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: SPOT_INCLUDE,
    });
  }

  async delete(id: string, hostId: string): Promise<void> {
    const existing = await this.prisma.spot.findFirst({
      where: { id, hostId, status: { not: SpotStatus.DELETED } },
    });
    if (!existing) {
      throw new Error('SPOT_NOT_FOUND');
    }
    // Soft delete
    await this.prisma.spot.update({
      where: { id },
      data: { status: SpotStatus.DELETED },
    });
  }

  async updateStatus(id: string, status: SpotStatus): Promise<SpotWithRelations> {
    return this.prisma.spot.update({
      where: { id },
      data: { status },
      include: SPOT_INCLUDE,
    });
  }

  // Photos
  async addPhotos(spotId: string, photos: PhotoData[]): Promise<void> {
    await this.prisma.spotPhoto.createMany({
      data: photos.map((p) => ({
        spotId,
        url: p.url,
        caption: p.caption,
        sortOrder: p.sortOrder,
        isPrimary: p.isPrimary,
      })),
    });
  }

  async removePhoto(spotId: string, photoId: string): Promise<void> {
    const existing = await this.prisma.spotPhoto.findFirst({
      where: { id: photoId, spotId },
    });
    if (!existing) {
      throw new Error('PHOTO_NOT_FOUND');
    }
    await this.prisma.spotPhoto.delete({ where: { id: photoId } });
  }

  async reorderPhotos(spotId: string, photoIds: string[]): Promise<void> {
    const updates = photoIds.map((id, index) =>
      this.prisma.spotPhoto.update({
        where: { id },
        data: { sortOrder: index, isPrimary: index === 0 },
      })
    );
    await this.prisma.$transaction(updates);
  }

  // Documents
  async addDocument(spotId: string, doc: DocumentData) {
    return this.prisma.spotDocument.create({
      data: {
        spotId,
        type: doc.type,
        url: doc.url,
      },
    });
  }

  // Availability
  async setAvailability(spotId: string, slots: AvailabilityData[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.spotAvailability.deleteMany({ where: { spotId } }),
      this.prisma.spotAvailability.createMany({
        data: slots.map((s) => ({
          spotId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isAllDay: s.isAllDay ?? false,
        })),
      }),
    ]);
  }

  // Search with geo-distance (bounding box + Haversine refinement)
  async search(params: SearchParams): Promise<{ spots: SpotWithRelations[]; total: number }> {
    const { latitude, longitude, radius } = params;

    // Approximate bounding box (1 degree ≈ 111km)
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((latitude * Math.PI) / 180));

    const where: any = {
      status: SpotStatus.ACTIVE,
      latitude: {
        gte: latitude - latDelta,
        lte: latitude + latDelta,
      },
      longitude: {
        gte: longitude - lngDelta,
        lte: longitude + lngDelta,
      },
    };

    if (params.spotType) {
      where.spotType = params.spotType;
    }

    if (params.vehicleSize) {
      where.vehicleSizes = { has: params.vehicleSize };
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.hourlyRate = {};
      if (params.minPrice !== undefined) where.hourlyRate.gte = params.minPrice;
      if (params.maxPrice !== undefined) where.hourlyRate.lte = params.maxPrice;
    }

    if (params.amenities && params.amenities.length > 0) {
      where.amenities = { hasEvery: params.amenities };
    }

    if (params.instantBook !== undefined) {
      where.instantBook = params.instantBook;
    }

    const [spots, total] = await Promise.all([
      this.prisma.spot.findMany({
        where,
        include: SPOT_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.spot.count({ where }),
    ]);

    // Haversine refinement: filter spots within exact radius
    const filtered = spots.filter((spot) => {
      const dist = this.haversineDistance(latitude, longitude, spot.latitude, spot.longitude);
      return dist <= radius;
    });

    return { spots: filtered, total: filtered.length };
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
