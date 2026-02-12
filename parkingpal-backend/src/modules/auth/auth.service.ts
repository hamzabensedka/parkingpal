import { UserType as PrismaUserType } from '@prisma/client';
import { IAuthService } from '../../interfaces/IAuthService';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { IPasswordUtil } from '../../interfaces/IPasswordUtil';
import { ITokenUtil } from '../../interfaces/ITokenUtil';
import { IEmailService } from '../../interfaces/IEmailService';
import { ISMSService } from '../../interfaces/ISMSService';
import {
  UserDTO,
  TokensDTO,
  AuthDataDTO,
  RegisterRequest,
  LoginRequest,
} from '@parkingpal/shared-types';
import { toUserDTO } from '../../utils/user.mapper';
import { ApiError } from '../../middleware/errorHandler';
import { ERROR_MESSAGES, PHONE_VERIFICATION } from '../../config/constants';

/**
 * Authentication Service
 * Implements IAuthService
 *
 * Single Responsibility: Authentication business logic ONLY
 * (register, login, logout, token refresh, email verification, password reset)
 *
 * Profile management is handled by UserProfileService (Interface Segregation)
 *
 * ALL dependencies are injected via constructor (Dependency Inversion):
 * - IUserRepository: Database access abstraction
 * - IPasswordUtil: Password hashing abstraction
 * - ITokenUtil: Token generation abstraction
 * - IEmailService: Email sending abstraction
 *
 * No "new" keyword here -- swap any implementation via the DI container.
 */
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordUtil: IPasswordUtil,
    private readonly tokenUtil: ITokenUtil,
    private readonly emailService: IEmailService,
    private readonly smsService: ISMSService,
    private readonly appUrl: string
  ) {}

  /**
   * Register a new user
   */
  async register(input: RegisterRequest): Promise<AuthDataDTO> {
    const { email, password, firstName, lastName, phone, userType } = input;

    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(email.toLowerCase());
    if (emailExists) {
      throw ApiError.conflict(ERROR_MESSAGES.EMAIL_EXISTS);
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const phoneExists = await this.userRepository.phoneExists(phone);
      if (phoneExists) {
        throw ApiError.conflict(ERROR_MESSAGES.PHONE_EXISTS);
      }
    }

    // Hash password (delegated to IPasswordUtil)
    const hashedPassword = await this.passwordUtil.hash(password);

    // Generate email verification token (delegated to ITokenUtil)
    const { token: verificationToken, expires: verificationExpires } =
      this.tokenUtil.generateEmailVerificationToken();

    // Map shared-types UserType (lowercase) to Prisma UserType (uppercase)
    const prismaUserType = (userType?.toUpperCase() as PrismaUserType) || PrismaUserType.RENTER;

    // Create user via repository (delegated to IUserRepository)
    const user = await this.userRepository.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      userType: prismaUserType,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    // Generate JWT tokens (delegated to ITokenUtil)
    const tokens = this.tokenUtil.generateTokens({
      id: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Store refresh token in database
    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    // Send verification email (fire and forget, delegated to IEmailService)
    const verificationLink = `${this.appUrl}/verify-email?token=${verificationToken}`;
    this.emailService
      .sendVerificationEmail(user.email, {
        firstName: user.firstName,
        verificationLink,
      })
      .catch((err) => console.error('Failed to send verification email:', err));

    return {
      user: toUserDTO(user),
      tokens,
    };
  }

  /**
   * Login with email and password
   */
  async login(input: LoginRequest): Promise<AuthDataDTO> {
    const { email, password } = input;

    // Find user by email
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    // Check if user exists (same error for security -- don't reveal if email exists)
    if (!user) {
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.forbidden(ERROR_MESSAGES.ACCOUNT_NOT_ACTIVE);
    }

    // Check if account is suspended
    if (user.isSuspended) {
      throw ApiError.forbidden(
        ERROR_MESSAGES.ACCOUNT_SUSPENDED,
        user.suspendedReason || undefined
      );
    }

    // Verify password (delegated to IPasswordUtil)
    const isPasswordValid = await this.passwordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate tokens (delegated to ITokenUtil)
    const tokens = this.tokenUtil.generateTokens({
      id: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Update refresh token and last login
    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);
    await this.userRepository.updateLastLogin(user.id);

    return {
      user: toUserDTO(user),
      tokens,
    };
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }

  /**
   * Refresh access token using a valid refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokensDTO> {
    // Verify refresh token (delegated to ITokenUtil)
    const decoded = this.tokenUtil.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    // Find user and check if refresh token matches
    const user = await this.userRepository.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    if (!user.isActive || user.isSuspended) {
      throw ApiError.forbidden(ERROR_MESSAGES.ACCOUNT_NOT_ACTIVE);
    }

    // Generate new tokens
    const tokens = this.tokenUtil.generateTokens({
      id: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Update refresh token in database
    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    // Find user by verification token
    const user = await this.userRepository.findByEmailVerificationToken(token);

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Check if token expired (delegated to ITokenUtil)
    if (this.tokenUtil.isTokenExpired(user.emailVerificationExpires)) {
      throw ApiError.badRequest(ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    // Mark email as verified
    await this.userRepository.verifyEmail(user.id);
  }

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<void> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return;
    }

    // Generate password reset token (delegated to ITokenUtil)
    const { token: resetToken, expires: resetExpires } =
      this.tokenUtil.generatePasswordResetToken();

    // Save token to database
    await this.userRepository.setPasswordResetToken(user.id, resetToken, resetExpires);

    // Send password reset email (fire and forget, delegated to IEmailService)
    const resetLink = `${this.appUrl}/reset-password?token=${resetToken}`;
    this.emailService
      .sendPasswordResetEmail(user.email, {
        firstName: user.firstName,
        resetLink,
      })
      .catch((err) => console.error('Failed to send password reset email:', err));
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find user by reset token
    const user = await this.userRepository.findByPasswordResetToken(token);

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Check if token expired
    if (this.tokenUtil.isTokenExpired(user.passwordResetExpires)) {
      throw ApiError.badRequest(ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    // Hash new password (delegated to IPasswordUtil)
    const hashedPassword = await this.passwordUtil.hash(newPassword);

    // Update password and clear tokens (also invalidates all sessions)
    await this.userRepository.updatePassword(user.id, hashedPassword);

    // Send password changed confirmation email (fire and forget)
    this.emailService
      .sendPasswordChangedEmail(user.email, {
        firstName: user.firstName,
      })
      .catch((err) => console.error('Failed to send password changed email:', err));
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(userId: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return toUserDTO(user);
  }

  /**
   * Send phone verification code via SMS
   */
  async sendPhoneVerificationCode(userId: string, phone: string): Promise<void> {
    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check if phone is already verified for this user
    if (user.phone === phone && user.phoneVerified) {
      throw ApiError.badRequest('Phone number is already verified');
    }

    // Check if phone belongs to another user
    const phoneExists = await this.userRepository.phoneExists(phone, userId);
    if (phoneExists) {
      throw ApiError.conflict(ERROR_MESSAGES.PHONE_EXISTS);
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + PHONE_VERIFICATION.CODE_EXPIRY_MS);

    // Update user's phone and save verification code
    await this.userRepository.update(userId, { phone });
    await this.userRepository.setPhoneVerificationCode(userId, code, expires);

    // Send SMS (fire and forget)
    this.smsService
      .sendVerificationCode(phone, code)
      .catch((err) => console.error('Failed to send SMS:', err));
  }

  /**
   * Verify phone with code
   */
  async verifyPhone(userId: string, code: string): Promise<void> {
    // Find user with matching code
    const user = await this.userRepository.findByPhoneVerificationCode(userId, code);

    if (!user) {
      throw ApiError.badRequest('Invalid verification code');
    }

    // Check if code expired
    if (this.tokenUtil.isTokenExpired(user.phoneVerificationExpires)) {
      throw ApiError.badRequest('Verification code has expired. Please request a new one.');
    }

    // Mark phone as verified
    await this.userRepository.verifyPhone(userId);
  }
}
