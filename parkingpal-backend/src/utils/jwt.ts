import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';

// Token payload types
export interface AccessTokenPayload {
  userId: string;
  email: string;
  userType: string;
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

// Decoded token type
export interface DecodedToken extends JwtPayload {
  userId: string;
  email?: string;
  userType?: string;
  type?: string;
}

/**
 * Generate an access token
 * @param payload - Token payload
 * @returns JWT access token
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as any,
  };

  return jwt.sign(payload, env.jwt.secret, options);
};

/**
 * Generate a refresh token
 * @param userId - User ID
 * @returns JWT refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const payload: RefreshTokenPayload = {
    userId,
    type: 'refresh',
  };

  const options: SignOptions = {
    expiresIn: env.jwt.refreshExpiresIn as any,
  };

  return jwt.sign(payload, env.jwt.refreshSecret, options);
};

/**
 * Generate both access and refresh tokens
 * @param user - User data for token payload
 * @returns Object with accessToken and refreshToken
 */
export const generateTokens = (user: {
  id: string;
  email: string;
  userType: string;
}): {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} => {
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    userType: user.userType.toLowerCase(),
  });

  const refreshToken = generateRefreshToken(user.id);

  // Parse expiresIn to seconds
  const expiresIn = parseExpiresIn(env.jwt.expiresIn);

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
};

/**
 * Verify an access token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, env.jwt.secret) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
};

/**
 * Verify a refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwt.verify(token, env.jwt.refreshSecret) as DecodedToken;

    // Ensure it's a refresh token
    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};

/**
 * Parse expiresIn string to seconds
 * @param expiresIn - Time string (e.g., '15m', '7d', '1h')
 * @returns Number of seconds
 */
const parseExpiresIn = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // Default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return 900;
  }
};
