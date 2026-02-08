import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../../utils/constants';
import type { ITokenStorage } from './tokenStorage';

/**
 * Secure token storage using Expo SecureStore
 */
export const secureTokenStorage: ITokenStorage = {
  async getAccessToken() {
    return SecureStore.getItemAsync(STORAGE_KEYS.authToken);
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
  },
  async setTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.authToken, accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refreshToken),
    ]);
  },
  async clearTokens() {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.authToken),
      SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken),
    ]);
  },
};
