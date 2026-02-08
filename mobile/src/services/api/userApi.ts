import type {
  UserProfileDTO,
  UpdateProfileRequest,
  UserDTO,
} from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * User/Profile API - get profile (UserProfileDTO), update profile, verify ID
 * Typed with @parkingpal/shared-types
 */
export function createUserApi(client: AxiosInstance) {
  return {
    async getProfile(): Promise<UserProfileDTO> {
      const { data } = await client.get<ApiResponse<UserProfileDTO>>('/api/users/profile');
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to get profile');
      }
      return data.data;
    },

    async updateProfile(body: UpdateProfileRequest): Promise<UserDTO> {
      const { data } = await client.put<ApiResponse<{ user: UserDTO }>>('/api/users/profile', body);
      if (!data.success || !data.data?.user) {
        throw new Error(data.error ?? 'Failed to update profile');
      }
      return data.data.user;
    },

    async verifyId(formData: FormData): Promise<UserDTO> {
      const { data } = await client.post<ApiResponse<{ user: UserDTO }>>(
        '/api/users/verify-id',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      if (!data.success || !data.data?.user) {
        throw new Error(data.error ?? 'Failed to upload ID');
      }
      return data.data.user;
    },
  };
}

export type UserApi = ReturnType<typeof createUserApi>;
