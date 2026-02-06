import { randomBytes } from 'crypto';
import { AUTH } from '../config/constants';

/**
 * Generate a random token for email verification or password reset
 * @param length - Length of the token (default: 32)
 * @returns Random hex string
 */
export const generateRandomToken = (length: number = AUTH.TOKEN_LENGTH): string => {
  return randomBytes(length).toString('hex');
};

/**
 * Generate email verification token and expiry
 * @returns Object with token and expires date
 */
export const generateEmailVerificationToken = (): {
  token: string;
  expires: Date;
} => {
  const token = generateRandomToken();
  const expires = new Date(Date.now() + AUTH.EMAIL_VERIFICATION_EXPIRES_MS);

  return { token, expires };
};

/**
 * Generate password reset token and expiry
 * @returns Object with token and expires date
 */
export const generatePasswordResetToken = (): {
  token: string;
  expires: Date;
} => {
  const token = generateRandomToken();
  const expires = new Date(Date.now() + AUTH.PASSWORD_RESET_EXPIRES_MS);

  return { token, expires };
};

/**
 * Check if a token has expired
 * @param expiresAt - Token expiry date
 * @returns True if token has expired
 */
export const isTokenExpired = (expiresAt: Date | null): boolean => {
  if (!expiresAt) return true;
  return new Date() > expiresAt;
};
