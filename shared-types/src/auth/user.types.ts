/**
 * User Types and DTOs
 * These types define the data structure for users across frontend and backend
 */

/**
 * User types in the system
 */
export type UserType = 'renter' | 'host' | 'both';

/**
 * Verification status object
 * This structure is expected by the mobile app
 */
export interface VerificationStatus {
  email: boolean;
  phone: boolean;
  id: boolean;
}

/**
 * User DTO (Data Transfer Object)
 * This is what gets sent to the frontend - NEVER includes sensitive data
 */
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePhoto: string | null;
  userType: UserType;
  verified: VerificationStatus;
  rating: number;
  reviewCount: number;
  isSuperhost: boolean;
  memberSince: string;  // ISO date string
}

/**
 * Tokens DTO
 * JWT tokens returned after authentication
 */
export interface TokensDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;  // seconds until access token expires
}

/**
 * Auth data returned after login/register
 */
export interface AuthDataDTO {
  user: UserDTO;
  tokens: TokensDTO;
}
