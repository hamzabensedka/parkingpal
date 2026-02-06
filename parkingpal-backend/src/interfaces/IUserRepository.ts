/**
 * User Repository Interface
 * Single Responsibility: Database access for User entity
 * Does NOT contain business logic
 */
import { User, UserType } from '@prisma/client';

export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by phone
   */
  findByPhone(phone: string): Promise<User | null>;

  /**
   * Find user by email verification token
   */
  findByEmailVerificationToken(token: string): Promise<User | null>;

  /**
   * Find user by password reset token
   */
  findByPasswordResetToken(token: string): Promise<User | null>;

  /**
   * Create a new user
   */
  create(data: CreateUserData): Promise<User>;

  /**
   * Update user by ID
   */
  update(id: string, data: UpdateUserData): Promise<User>;

  /**
   * Update user's refresh token
   */
  updateRefreshToken(id: string, refreshToken: string | null): Promise<void>;

  /**
   * Update user's last login timestamp
   */
  updateLastLogin(id: string): Promise<void>;

  /**
   * Mark email as verified
   */
  verifyEmail(id: string): Promise<void>;

  /**
   * Set password reset token
   */
  setPasswordResetToken(id: string, token: string, expires: Date): Promise<void>;

  /**
   * Update password and clear reset token
   */
  updatePassword(id: string, hashedPassword: string): Promise<void>;

  /**
   * Check if email exists (excluding a specific user ID)
   */
  emailExists(email: string, excludeUserId?: string): Promise<boolean>;

  /**
   * Check if phone exists (excluding a specific user ID)
   */
  phoneExists(phone: string, excludeUserId?: string): Promise<boolean>;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  userType: UserType;
  emailVerificationToken: string;
  emailVerificationExpires: Date;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  profilePhoto?: string | null;
  idDocument?: string;
}
