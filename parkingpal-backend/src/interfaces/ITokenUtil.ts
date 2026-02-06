/**
 * Token Utility Interface
 * Single Responsibility: Generate and verify JWT tokens
 * Open/Closed: Can swap JWT for PASETO, etc.
 */
export interface ITokenUtil {
  /**
   * Generate access and refresh tokens for a user
   * @param user - User data for token payload
   * @returns Object with accessToken, refreshToken, and expiresIn
   */
  generateTokens(user: TokenUser): TokenPair;

  /**
   * Verify an access token
   * @param token - JWT access token
   * @returns Decoded payload or null if invalid
   */
  verifyAccessToken(token: string): DecodedToken | null;

  /**
   * Verify a refresh token
   * @param token - JWT refresh token
   * @returns Decoded payload or null if invalid
   */
  verifyRefreshToken(token: string): DecodedToken | null;

  /**
   * Generate a random token (for email verification, password reset)
   * @param length - Length of the token
   * @returns Random hex string
   */
  generateRandomToken(length?: number): string;

  /**
   * Generate email verification token with expiry
   * @returns Token and expiry date
   */
  generateEmailVerificationToken(): TokenWithExpiry;

  /**
   * Generate password reset token with expiry
   * @returns Token and expiry date
   */
  generatePasswordResetToken(): TokenWithExpiry;

  /**
   * Check if a token has expired
   * @param expiresAt - Token expiry date
   * @returns True if token has expired
   */
  isTokenExpired(expiresAt: Date | null): boolean;
}

export interface TokenUser {
  id: string;
  email: string;
  userType: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken {
  userId: string;
  email?: string;
  userType?: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export interface TokenWithExpiry {
  token: string;
  expires: Date;
}
