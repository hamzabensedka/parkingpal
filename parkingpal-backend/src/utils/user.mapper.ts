import { User } from '@prisma/client';
import { UserDTO, UserType } from '@parkingpal/shared-types';

/**
 * User Mapper Utility
 * Single Responsibility: Transform database User entity to UserDTO
 *
 * This ensures sensitive data (password, tokens, etc.) is NEVER leaked to the frontend.
 * Only fields defined in UserDTO are included in the response.
 */
export const toUserDTO = (user: User): UserDTO => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    profilePhoto: user.profilePhoto,
    userType: user.userType.toLowerCase() as UserType,
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
