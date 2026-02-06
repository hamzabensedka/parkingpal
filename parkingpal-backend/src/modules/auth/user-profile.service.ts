import { IUserProfileService } from '../../interfaces/IAuthService';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { UserDTO, UpdateProfileRequest } from '@parkingpal/shared-types';
import { toUserDTO } from '../../utils/user.mapper';
import { ApiError } from '../../middleware/errorHandler';
import { ERROR_MESSAGES } from '../../config/constants';

/**
 * User Profile Service
 * Implements IUserProfileService
 *
 * Single Responsibility: Profile management (get, update, verify ID)
 * Separated from AuthService per Interface Segregation Principle
 *
 * Dependencies injected via constructor (Dependency Inversion Principle):
 * - IUserRepository: Database access abstraction
 */
export class UserProfileService implements IUserProfileService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return toUserDTO(user);
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
