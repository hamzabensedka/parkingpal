import { PrismaClient, User } from '@prisma/client';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '../interfaces/IUserRepository';

/**
 * Prisma implementation of IUserRepository
 * Single Responsibility: Database access for User entity via Prisma ORM
 * Open/Closed: Can be swapped with MongoUserRepository, TypeORMUserRepository, etc.
 *
 * This layer contains NO business logic -- only CRUD operations.
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.profilePhoto !== undefined && { profilePhoto: data.profilePhoto }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.idDocument !== undefined && { idDocument: data.idDocument }),
        ...(data.userType !== undefined && { userType: data.userType }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.reviewCount !== undefined && { reviewCount: data.reviewCount }),
        ...(data.stripeCustomerId !== undefined && { stripeCustomerId: data.stripeCustomerId }),
        ...(data.stripeConnectAccountId !== undefined && { stripeConnectAccountId: data.stripeConnectAccountId }),
        ...(data.stripeConnectOnboarded !== undefined && { stripeConnectOnboarded: data.stripeConnectOnboarded }),
      },
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async verifyEmail(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });
  }

  async setPasswordResetToken(id: string, token: string, expires: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null, // Invalidate all sessions
      },
    });
  }

  async emailExists(email: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        ...(excludeUserId && { NOT: { id: excludeUserId } }),
      },
      select: { id: true },
    });
    return user !== null;
  }

  async phoneExists(phone: string, excludeUserId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        phone,
        ...(excludeUserId && { NOT: { id: excludeUserId } }),
      },
      select: { id: true },
    });
    return user !== null;
  }

  async setPhoneVerificationCode(id: string, code: string, expires: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        phoneVerificationCode: code,
        phoneVerificationExpires: expires,
      },
    });
  }

  async findByPhoneVerificationCode(userId: string, code: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        phoneVerificationCode: code,
      },
    });
  }

  async verifyPhone(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
      },
    });
  }

  async setStripeCustomerId(id: string, stripeCustomerId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { stripeCustomerId },
    });
  }

  async setStripeConnectAccount(id: string, accountId: string, onboarded: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        stripeConnectAccountId: accountId,
        stripeConnectOnboarded: onboarded,
      },
    });
  }
}
