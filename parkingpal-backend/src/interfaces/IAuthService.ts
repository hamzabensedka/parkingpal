/**
 * Auth Service Interface
 * Single Responsibility: Authentication business logic
 * Interface Segregation: Only auth-related methods
 */
import {
  UserDTO,
  TokensDTO,
  AuthDataDTO,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  UserProfileDTO,
} from '@parkingpal/shared-types';

export interface IAuthService {
  /**
   * Register a new user
   */
  register(input: RegisterRequest): Promise<AuthDataDTO>;

  /**
   * Login with email and password
   */
  login(input: LoginRequest): Promise<AuthDataDTO>;

  /**
   * Logout user (invalidate refresh token)
   */
  logout(userId: string): Promise<void>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string): Promise<TokensDTO>;

  /**
   * Verify email with token
   */
  verifyEmail(token: string): Promise<void>;

  /**
   * Request password reset email
   */
  forgotPassword(email: string): Promise<void>;

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Promise<void>;

  /**
   * Get current user by ID
   */
  getCurrentUser(userId: string): Promise<UserDTO>;
}

/**
 * User Profile Service Interface
 * Interface Segregation: Separate from auth concerns
 */
export interface IUserProfileService {
  /**
   * Get full user profile (user, stats, vehicles, payment methods)
   */
  getProfile(userId: string): Promise<UserProfileDTO>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, input: UpdateProfileRequest): Promise<UserDTO>;

  /**
   * Upload ID document for verification
   */
  verifyId(userId: string, idDocumentPath: string): Promise<UserDTO>;
}
