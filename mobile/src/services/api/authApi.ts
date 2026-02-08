import type {
  LoginRequest,
  RegisterRequest,
  AuthDataDTO,
  TokensDTO,
  UserDTO,
} from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';

export interface AuthApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Auth API - login, register, refresh, logout, me
 * Typed with @parkingpal/shared-types
 */
export function createAuthApi(client: AxiosInstance) {
  return {
    async login(body: LoginRequest): Promise<AuthDataDTO> {
      const { data } = await client.post<AuthApiResponse<AuthDataDTO>>('/api/auth/login', body);
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Login failed');
      }
      return data.data;
    },

    async register(body: RegisterRequest): Promise<AuthDataDTO> {
      const { data } = await client.post<AuthApiResponse<AuthDataDTO>>('/api/auth/register', body);
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Registration failed');
      }
      return data.data;
    },

    async refresh(refreshToken: string): Promise<TokensDTO> {
      const { data } = await client.post<AuthApiResponse<TokensDTO>>('/api/auth/refresh', {
        refreshToken,
      });
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Token refresh failed');
      }
      return data.data;
    },

    async logout(): Promise<void> {
      await client.post('/api/auth/logout');
    },

    async getCurrentUser(): Promise<UserDTO> {
      const { data } = await client.get<AuthApiResponse<{ user: UserDTO }>>('/api/auth/me');
      if (!data.success || !data.data?.user) {
        throw new Error(data.error ?? 'Failed to get user');
      }
      return data.data.user;
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
