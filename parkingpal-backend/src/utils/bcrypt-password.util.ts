import bcrypt from 'bcrypt';
import { IPasswordUtil, PasswordValidationResult } from '../interfaces/IPasswordUtil';
import { AUTH } from '../config/constants';

/**
 * Bcrypt implementation of IPasswordUtil
 * Single Responsibility: Hash and compare passwords using bcrypt
 * Open/Closed: Can be swapped with Argon2PasswordUtil, ScryptPasswordUtil, etc.
 */
export class BcryptPasswordUtil implements IPasswordUtil {
  private readonly saltRounds: number;

  constructor(saltRounds: number = AUTH.BCRYPT_SALT_ROUNDS) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hash a plain text password using bcrypt
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare a plain text password with a bcrypt hash
   */
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validate password strength against configured requirements
   */
  validateStrength(password: string): PasswordValidationResult {
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
  }
}
