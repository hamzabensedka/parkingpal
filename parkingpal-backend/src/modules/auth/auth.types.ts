import { UserType } from '@prisma/client';

// Input types for authentication operations
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface LogoutInput {
  refreshToken?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePhoto?: string;
}

// Response types
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePhoto: string | null;
  userType: string;
  verified: {
    email: boolean;
    phone: boolean;
    id: boolean;
  };
  rating: number;
  reviewCount: number;
  isSuperhost: boolean;
  memberSince: string;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: TokensResponse;
}

// Prisma user type with selected fields
export interface UserWithAuth {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePhoto: string | null;
  userType: UserType;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  suspendedReason: string | null;
  rating: number;
  reviewCount: number;
  isSuperhost: boolean;
  createdAt: Date;
  refreshToken: string | null;
}

// Helper function to transform database user to API response
export const transformUserResponse = (user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePhoto: string | null;
  userType: UserType;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  rating: number;
  reviewCount: number;
  isSuperhost: boolean;
  createdAt: Date;
}): UserResponse => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    profilePhoto: user.profilePhoto,
    userType: user.userType.toLowerCase(),
    verified: {
      email: user.emailVerified,
      phone: user.phoneVerified,
      id: user.idVerified,
    },
    rating: user.rating,
    reviewCount: user.reviewCount,
    isSuperhost: user.isSuperhost,
    memberSince: user.createdAt.toISOString(),
  };
};
