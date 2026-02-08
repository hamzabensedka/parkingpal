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
      const token = await tokenStorage.getAccessToken();
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
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
          isRefreshing = false;
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
          isRefreshing = false;
          await tokenStorage.clearTokens();
          onUnauthorized?.();
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(err);
    }
  );

  return client;
}
