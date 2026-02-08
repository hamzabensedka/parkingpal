/**
 * Token storage abstraction for API client
 * Implement with SecureStore for secure persistence
 */
export interface ITokenStorage {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  setTokens(accessToken: string, refreshToken: string): Promise<void>;
  clearTokens(): Promise<void>;
}
