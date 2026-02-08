import { PrismaClient } from '@prisma/client';
import {
  IVehicleRepository,
  CreateVehicleData,
  UpdateVehicleData,
} from '../interfaces/IVehicleRepository';

/**
 * Prisma implementation of IVehicleRepository
 * Single Responsibility: Database access for Vehicle entity
 */
export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.vehicle.findUnique({ where: { id } });
  }

  async findByUserId(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(data: CreateVehicleData) {
    if (data.isDefault) {
      await this.prisma.vehicle.updateMany({
        where: { userId: data.userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.vehicle.create({
      data: {
        userId: data.userId,
        make: data.make,
        model: data.model,
        licensePlate: data.licensePlate,
        color: data.color,
        type: data.type,
        year: data.year ?? undefined,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async update(id: string, userId: string, data: UpdateVehicleData) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new Error('VEHICLE_NOT_FOUND');
    }
    if (data.isDefault) {
      await this.prisma.vehicle.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(data.make !== undefined && { make: data.make }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.licensePlate !== undefined && { licensePlate: data.licensePlate }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    });
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new Error('VEHICLE_NOT_FOUND');
    }
    await this.prisma.vehicle.delete({ where: { id } });
  }

  async setDefault(id: string, userId: string) {
    const existing = await this.prisma.vehicle.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new Error('VEHICLE_NOT_FOUND');
    }
    await this.prisma.vehicle.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.vehicle.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async clearDefaultForUser(userId: string) {
    await this.prisma.vehicle.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
}
