/**
 * Vehicle Repository Interface
 * Single Responsibility: Database access for Vehicle entity
 */
import { Vehicle, VehicleSize } from '@prisma/client';

export interface IVehicleRepository {
  findById(id: string): Promise<Vehicle | null>;
  findByUserId(userId: string): Promise<Vehicle[]>;
  create(data: CreateVehicleData): Promise<Vehicle>;
  update(id: string, userId: string, data: UpdateVehicleData): Promise<Vehicle>;
  delete(id: string, userId: string): Promise<void>;
  setDefault(id: string, userId: string): Promise<Vehicle>;
  clearDefaultForUser(userId: string): Promise<void>;
}

export interface CreateVehicleData {
  userId: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  type: VehicleSize;
  year?: number | null;
  isDefault?: boolean;
}

export interface UpdateVehicleData {
  make?: string;
  model?: string;
  licensePlate?: string;
  color?: string;
  type?: VehicleSize;
  year?: number | null;
  isDefault?: boolean;
}
