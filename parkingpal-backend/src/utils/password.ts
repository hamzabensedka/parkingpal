import bcrypt from 'bcrypt';
import { AUTH } from '../config/constants';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);
};

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with isValid and message
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  message?: string;
} => {
  if (password.length < AUTH.PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      message: `Password must be at least ${AUTH.PASSWORD_MIN_LENGTH} characters`,
    };
  }

  if (password.length > AUTH.PASSWORD_MAX_LENGTH) {
    return {
      isValid: false,
      message: `Password must be less than ${AUTH.PASSWORD_MAX_LENGTH} characters`,
    };
  }

  if (!AUTH.PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      message: AUTH.PASSWORD_REQUIREMENTS,
    };
  }

  return { isValid: true };
};
