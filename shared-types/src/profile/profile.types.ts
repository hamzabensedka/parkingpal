/**
 * Profile Request/Response Types
 * Contract for renter profile screen (user + stats + vehicles + payment methods)
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';
import { UserDTO } from '../auth/user.types';
import { VehicleDTO } from '../vehicle/vehicle.types';
import { PaymentMethodDTO } from '../payment/payment.types';

/**
 * Profile stats (placeholder until bookings module exists)
 */
export interface ProfileStatsDTO {
  totalBookings: number;
  totalSpent: number;
}

/**
 * Full profile DTO returned by GET /api/users/profile
 * Includes user, stats, vehicles, payment methods for one-shot profile load
 */
export interface UserProfileDTO {
  user: UserDTO;
  bio?: string | null;
  profilePhoto?: string | null;
  stats: ProfileStatsDTO;
  vehicles: VehicleDTO[];
  paymentMethods: PaymentMethodDTO[];
}

/**
 * Response for GET /api/users/profile (full profile with user, stats, vehicles, payment methods)
 */
export type GetUserProfileResponse = ApiSuccessResponse<UserProfileDTO> | ApiErrorResponse;
