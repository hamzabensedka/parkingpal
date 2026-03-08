import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import type { ITokenStorage } from './tokenStorage';

export interface ApiClientConfig {
  baseURL: string;
  tokenStorage: ITokenStorage;
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => Promise<void>;
  onUnauthorized?: () => void;
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Create axios instance with:
 * - Authorization: Bearer <accessToken>
 * - Auto-refresh on 401 using refresh token
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const { baseURL, tokenStorage, onTokenRefreshed, onUnauthorized } = config;
  const client = axios.create({
    baseURL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use(
    async (req: InternalAxiosRequestConfig) => {
      try {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          req.headers.Authorization = `Bearer ${token}`;
        } else {
          // Log warning if no token available
          console.warn('[apiClient] No auth token for request:', req.method, req.url);
        }
      } catch (error) {
        console.error('[apiClient] Error getting auth token:', error);
      }
      return req;
    },
    (err) => Promise.reject(err)
  );

  client.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;

      if (err.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Wait for the ongoing refresh to complete
          return new Promise<undefined>((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(undefined);
            });
          }).then(() => client(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) {
          console.warn('[apiClient] No refresh token available, user needs to re-login');
          isRefreshing = false;
          refreshSubscribers = []; // Clear any waiting subscribers
          onUnauthorized?.();
          return Promise.reject(err);
        }

        try {
          const { data } = await axios.post<{ success: boolean; data: { accessToken: string; refreshToken: string; expiresIn: number } }>(
            `${baseURL}/api/auth/refresh`,
            { refreshToken }
          );
          if (!data?.success || !data.data) {
            throw new Error('Invalid refresh response');
          }
          const { accessToken, refreshToken: newRefreshToken } = data.data;
          await tokenStorage.setTokens(accessToken, newRefreshToken);
          await onTokenRefreshed?.(accessToken, newRefreshToken);
          onRefreshed(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshErr) {
          console.error('[apiClient] Token refresh failed:', refreshErr);
          await tokenStorage.clearTokens();
          onUnauthorized?.();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(err);
    }
  );

  return client;
}
