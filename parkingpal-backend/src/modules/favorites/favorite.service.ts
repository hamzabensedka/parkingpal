import { PrismaClient } from '@prisma/client';
import { ISpotRepository } from '../../interfaces/ISpotRepository';
import { ApiError } from '../../middleware/errorHandler';
import { toSpotSummaryDTO } from '../spots/spot.mappers';
import type { SpotSummaryDTO } from '@parkingpal/shared-types';

/**
 * Favorite Service
 * Single Responsibility: Business logic for user favorites
 */
export class FavoriteService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly spotRepository: ISpotRepository,
  ) {}

  /**
   * Get all favorite spots for a user
   */
  async getFavorites(userId: string): Promise<SpotSummaryDTO[]> {
    const favorites = await this.prisma.favoriteSpot.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const spotIds = favorites.map(f => f.spotId);
    
    // Fetch full spot details for each favorite
    const spots = await Promise.all(
      spotIds.map(id => this.spotRepository.findById(id))
    );

    // Filter out null spots (deleted) and map to DTOs
    return spots
      .filter(spot => spot !== null)
      .map(spot => toSpotSummaryDTO(spot!));
  }

  /**
   * Add a spot to user's favorites
   */
  async addFavorite(userId: string, spotId: string): Promise<void> {
    // Check if spot exists and is active
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || spot.status === 'DELETED') {
      throw ApiError.notFound('Spot not found');
    }

    // Check if already favorited
    const existing = await this.prisma.favoriteSpot.findUnique({
      where: {
        userId_spotId: { userId, spotId },
      },
    });

    if (existing) {
      // Already favorited - idempotent, just return success
      return;
    }

    // Create favorite
    await this.prisma.favoriteSpot.create({
      data: { userId, spotId },
    });
  }

  /**
   * Remove a spot from user's favorites
   */
  async removeFavorite(userId: string, spotId: string): Promise<void> {
    const favorite = await this.prisma.favoriteSpot.findUnique({
      where: {
        userId_spotId: { userId, spotId },
      },
    });

    if (!favorite) {
      // Not favorited - idempotent, just return success
      return;
    }

    await this.prisma.favoriteSpot.delete({
      where: {
        userId_spotId: { userId, spotId },
      },
    });
  }

  /**
   * Check if a spot is favorited by a user
   */
  async isFavorite(userId: string, spotId: string): Promise<boolean> {
    const favorite = await this.prisma.favoriteSpot.findUnique({
      where: {
        userId_spotId: { userId, spotId },
      },
    });

    return favorite !== null;
  }
}
