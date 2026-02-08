import { IVehicleRepository, CreateVehicleData, UpdateVehicleData } from '../../interfaces/IVehicleRepository';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '@parkingpal/shared-types';
import { ApiError } from '../../middleware/errorHandler';
import { toVehicleDTO, dtoSizeToPrisma } from './vehicle.mappers';

/**
 * Vehicle Service
 * Single Responsibility: Business logic for vehicle operations
 * Depends on IVehicleRepository (DIP)
 */
export class VehicleService {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async listByUserId(userId: string) {
    const vehicles = await this.vehicleRepository.findByUserId(userId);
    return vehicles.map(toVehicleDTO);
  }

  async create(userId: string, body: CreateVehicleRequest) {
    const data: CreateVehicleData = {
      userId,
      make: body.make,
      model: body.model,
      licensePlate: body.licensePlate,
      color: body.color,
      type: dtoSizeToPrisma(body.type),
      year: body.year ?? null,
      isDefault: body.isDefault,
    };
    const vehicle = await this.vehicleRepository.create(data);
    return toVehicleDTO(vehicle);
  }

  async update(userId: string, vehicleId: string, body: UpdateVehicleRequest) {
    try {
      const data: UpdateVehicleData = {
        ...(body.make !== undefined && { make: body.make }),
        ...(body.model !== undefined && { model: body.model }),
        ...(body.licensePlate !== undefined && { licensePlate: body.licensePlate }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.type !== undefined && { type: dtoSizeToPrisma(body.type) }),
        ...(body.year !== undefined && { year: body.year }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      };
      const vehicle = await this.vehicleRepository.update(vehicleId, userId, data);
      return toVehicleDTO(vehicle);
    } catch (e) {
      if (e instanceof Error && e.message === 'VEHICLE_NOT_FOUND') {
        throw ApiError.notFound('Vehicle not found');
      }
      throw e;
    }
  }

  async delete(userId: string, vehicleId: string) {
    try {
      await this.vehicleRepository.delete(vehicleId, userId);
    } catch (e) {
      if (e instanceof Error && e.message === 'VEHICLE_NOT_FOUND') {
        throw ApiError.notFound('Vehicle not found');
      }
      throw e;
    }
  }

  async setDefault(userId: string, vehicleId: string) {
    try {
      const vehicle = await this.vehicleRepository.setDefault(vehicleId, userId);
      return toVehicleDTO(vehicle);
    } catch (e) {
      if (e instanceof Error && e.message === 'VEHICLE_NOT_FOUND') {
        throw ApiError.notFound('Vehicle not found');
      }
      throw e;
    }
  }
}
