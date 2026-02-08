/**
 * Vehicle Request/Response Types
 * Contract for renter vehicles (metadata only, no sensitive data)
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';

/**
 * Vehicle size / type (matches mobile VehicleSize)
 */
export type VehicleSizeType = 'compact' | 'sedan' | 'suv' | 'van' | 'motorcycle';

/**
 * Vehicle DTO
 */
export interface VehicleDTO {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  type: VehicleSizeType;
  year?: number;
  isDefault: boolean;
}

/**
 * Create vehicle request (POST /api/users/vehicles)
 */
export interface CreateVehicleRequest {
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  type: VehicleSizeType;
  year?: number;
  isDefault?: boolean;
}

/**
 * Update vehicle request (PUT /api/users/vehicles/:id)
 */
export interface UpdateVehicleRequest {
  make?: string;
  model?: string;
  licensePlate?: string;
  color?: string;
  type?: VehicleSizeType;
  year?: number;
  isDefault?: boolean;
}

/**
 * Response for GET /api/users/vehicles
 */
export type ListVehiclesResponse = ApiSuccessResponse<{ vehicles: VehicleDTO[] }> | ApiErrorResponse;

/**
 * Response for POST /api/users/vehicles
 */
export type CreateVehicleResponse = ApiSuccessResponse<{ vehicle: VehicleDTO }> | ApiErrorResponse;

/**
 * Response for PUT /api/users/vehicles/:id
 */
export type UpdateVehicleResponse = ApiSuccessResponse<{ vehicle: VehicleDTO }> | ApiErrorResponse;

/**
 * Response for DELETE /api/users/vehicles/:id
 */
export type DeleteVehicleResponse = ApiSuccessResponse<null> | ApiErrorResponse;

/**
 * Response for POST /api/users/vehicles/:id/default
 */
export type SetDefaultVehicleResponse = ApiSuccessResponse<{ vehicle: VehicleDTO }> | ApiErrorResponse;
