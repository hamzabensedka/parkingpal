import type {
  VehicleDTO,
  CreateVehicleRequest,
  UpdateVehicleRequest,
} from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function createVehicleApi(client: AxiosInstance) {
  return {
    async list(): Promise<VehicleDTO[]> {
      const { data } = await client.get<ApiResponse<{ vehicles: VehicleDTO[] }>>(
        '/api/users/vehicles'
      );
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to list vehicles');
      }
      return data.data.vehicles;
    },

    async create(body: CreateVehicleRequest): Promise<VehicleDTO> {
      const { data } = await client.post<ApiResponse<{ vehicle: VehicleDTO }>>(
        '/api/users/vehicles',
        body
      );
      if (!data.success || !data.data?.vehicle) {
        throw new Error(data.error ?? 'Failed to add vehicle');
      }
      return data.data.vehicle;
    },

    async update(id: string, body: UpdateVehicleRequest): Promise<VehicleDTO> {
      const { data } = await client.put<ApiResponse<{ vehicle: VehicleDTO }>>(
        `/api/users/vehicles/${id}`,
        body
      );
      if (!data.success || !data.data?.vehicle) {
        throw new Error(data.error ?? 'Failed to update vehicle');
      }
      return data.data.vehicle;
    },

    async delete(id: string): Promise<void> {
      const { data } = await client.delete<ApiResponse<null>>(`/api/users/vehicles/${id}`);
      if (!data.success) {
        throw new Error(data.error ?? 'Failed to delete vehicle');
      }
    },

    async setDefault(id: string): Promise<VehicleDTO> {
      const { data } = await client.post<ApiResponse<{ vehicle: VehicleDTO }>>(
        `/api/users/vehicles/${id}/default`
      );
      if (!data.success || !data.data?.vehicle) {
        throw new Error(data.error ?? 'Failed to set default vehicle');
      }
      return data.data.vehicle;
    },
  };
}

export type VehicleApi = ReturnType<typeof createVehicleApi>;
