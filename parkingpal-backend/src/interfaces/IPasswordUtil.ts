/**
 * Password Utility Interface
 * Single Responsibility: Hash and compare passwords
 * Open/Closed: Can swap bcrypt for argon2, scrypt, etc.
 */
export interface IPasswordUtil {
  /**
   * Hash a plain text password
   * @param password - Plain text password
   * @returns Hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns True if passwords match
   */
  compare(password: string, hashedPassword: string): Promise<boolean>;

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Validation result with optional error message
   */
  validateStrength(password: string): PasswordValidationResult;
}

export interface PasswordValidationResult {
  isValid: boolean;
  message?: string;
}
