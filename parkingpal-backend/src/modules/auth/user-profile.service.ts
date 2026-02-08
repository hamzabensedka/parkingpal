import { IUserProfileService } from '../../interfaces/IAuthService';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { IVehicleRepository } from '../../interfaces/IVehicleRepository';
import { IPaymentMethodRepository } from '../../interfaces/IPaymentMethodRepository';
import { UserDTO, UpdateProfileRequest, UserProfileDTO } from '@parkingpal/shared-types';
import { toUserDTO } from '../../utils/user.mapper';
import { toVehicleDTO } from '../vehicles/vehicle.mappers';
import { toPaymentMethodDTO } from '../payment-methods/payment-method.mappers';
import { ApiError } from '../../middleware/errorHandler';
import { ERROR_MESSAGES } from '../../config/constants';

/**
 * User Profile Service
 * Implements IUserProfileService
 *
 * Single Responsibility: Profile management (get, update, verify ID)
 * GET /api/users/profile returns full UserProfileDTO (user, stats, vehicles, payment methods)
 *
 * Dependencies injected via constructor (DIP):
 * - IUserRepository, IVehicleRepository, IPaymentMethodRepository
 */
export class UserProfileService implements IUserProfileService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly vehicleRepository: IVehicleRepository,
    private readonly paymentMethodRepository: IPaymentMethodRepository
  ) {}

  /**
   * Get full user profile (user, stats, vehicles, payment methods)
   */
  async getProfile(userId: string): Promise<UserProfileDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const [vehicles, paymentMethods] = await Promise.all([
      this.vehicleRepository.findByUserId(userId),
      this.paymentMethodRepository.findByUserId(userId),
    ]);

    return {
      user: toUserDTO(user),
      bio: user.bio ?? null,
      profilePhoto: user.profilePhoto ?? null,
      stats: { totalBookings: 0, totalSpent: 0 },
      vehicles: vehicles.map(toVehicleDTO),
      paymentMethods: paymentMethods.map(toPaymentMethodDTO),
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UpdateProfileRequest): Promise<UserDTO> {
    // Check if phone is being updated and already exists for another user
    if (input.phone) {
      const phoneExists = await this.userRepository.phoneExists(input.phone, userId);
      if (phoneExists) {
        throw ApiError.conflict(ERROR_MESSAGES.PHONE_EXISTS);
      }
    }

    const user = await this.userRepository.update(userId, {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
      ...(input.profilePhoto !== undefined && { profilePhoto: input.profilePhoto || null }),
      ...(input.bio !== undefined && { bio: input.bio ?? null }),
    });

    return toUserDTO(user);
  }

  /**
   * Upload ID document for verification
   * Note: idVerified will be set to true after manual admin review
   */
  async verifyId(userId: string, idDocumentPath: string): Promise<UserDTO> {
    const user = await this.userRepository.update(userId, {
      idDocument: idDocumentPath,
    });

    return toUserDTO(user);
  }
}
