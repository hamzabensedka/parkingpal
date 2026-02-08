import { Vehicle } from '@prisma/client';
import type { VehicleDTO, VehicleSizeType } from '@parkingpal/shared-types';

const PRISMA_TO_DTO_SIZE: Record<string, VehicleSizeType> = {
  COMPACT: 'compact',
  SEDAN: 'sedan',
  SUV: 'suv',
  VAN: 'van',
  MOTORCYCLE: 'motorcycle',
};

export function toVehicleDTO(v: Vehicle): VehicleDTO {
  return {
    id: v.id,
    make: v.make,
    model: v.model,
    licensePlate: v.licensePlate,
    color: v.color,
    type: PRISMA_TO_DTO_SIZE[v.type] ?? 'sedan',
    year: v.year ?? undefined,
    isDefault: v.isDefault,
  };
}

export function dtoSizeToPrisma(type: VehicleSizeType): 'COMPACT' | 'SEDAN' | 'SUV' | 'VAN' | 'MOTORCYCLE' {
  const map: Record<VehicleSizeType, 'COMPACT' | 'SEDAN' | 'SUV' | 'VAN' | 'MOTORCYCLE'> = {
    compact: 'COMPACT',
    sedan: 'SEDAN',
    suv: 'SUV',
    van: 'VAN',
    motorcycle: 'MOTORCYCLE',
  };
  return map[type] ?? 'SEDAN';
}
