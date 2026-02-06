import jwt, { SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import {
  ITokenUtil,
  TokenUser,
  TokenPair,
  DecodedToken,
  TokenWithExpiry,
} from '../interfaces/ITokenUtil';
import { AUTH } from '../config/constants';

/**
 * JWT implementation of ITokenUtil
 * Single Responsibility: Generate and verify JWT tokens
 * Open/Closed: Can be swapped with PasetoTokenUtil, etc.
 */
export class JWTTokenUtil implements ITokenUtil {
  constructor(
    private readonly secret: string,
    private readonly refreshSecret: string,
    private readonly expiresIn: string,
    private readonly refreshExpiresIn: string
  ) {}

  /**
   * Generate access and refresh token pair for a user
   */
  generateTokens(user: TokenUser): TokenPair {
    const accessPayload = {
      userId: user.id,
      email: user.email,
      userType: user.userType.toLowerCase(),
    };

    const accessToken = jwt.sign(accessPayload, this.secret, {
      expiresIn: this.expiresIn,
    } as SignOptions);

    const refreshPayload = {
      userId: user.id,
      type: 'refresh',
    };

    const refreshToken = jwt.sign(refreshPayload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    } as SignOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiresIn(this.expiresIn),
    };
  }

  /**
   * Verify an access token and return decoded payload
   */
  verifyAccessToken(token: string): DecodedToken | null {
    try {
      return jwt.verify(token, this.secret) as DecodedToken;
    } catch {
      return null;
    }
  }

  /**
   * Verify a refresh token and return decoded payload
   */
  verifyRefreshToken(token: string): DecodedToken | null {
    try {
      const decoded = jwt.verify(token, this.refreshSecret) as DecodedToken;
      if (decoded.type !== 'refresh') {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Generate a cryptographically secure random hex token
   */
  generateRandomToken(length: number = AUTH.TOKEN_LENGTH): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate an email verification token with expiry
   */
  generateEmailVerificationToken(): TokenWithExpiry {
    return {
      token: this.generateRandomToken(),
      expires: new Date(Date.now() + AUTH.EMAIL_VERIFICATION_EXPIRES_MS),
    };
  }

  /**
   * Generate a password reset token with expiry
   */
  generatePasswordResetToken(): TokenWithExpiry {
    return {
      token: this.generateRandomToken(),
      expires: new Date(Date.now() + AUTH.PASSWORD_RESET_EXPIRES_MS),
    };
  }

  /**
   * Check if a token has expired
   */
  isTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return true;
    return new Date() > expiresAt;
  }

  /**
   * Parse a time string (e.g., '15m', '7d') to seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default: 15 minutes

    const value = parseInt(match[1], 10);
    switch (match[2]) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900;
    }
  }
}
