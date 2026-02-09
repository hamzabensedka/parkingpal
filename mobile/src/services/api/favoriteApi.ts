import type { SpotSummaryDTO } from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';

export interface FavoriteApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Favorite API – manage user's saved/favorited spots
 */
export function createFavoriteApi(client: AxiosInstance) {
  return {
    /**
     * Get all favorite spots for the authenticated user
     */
    async getFavorites(): Promise<SpotSummaryDTO[]> {
      const { data } = await client.get<FavoriteApiResponse<{ spots: SpotSummaryDTO[] }>>(
        '/api/users/favorites',
      );

      if (!data.success || !data.data?.spots) {
        throw new Error(data.error ?? 'Failed to fetch favorites');
      }
      return data.data.spots;
    },

    /**
     * Add a spot to favorites
     * @param spotId Spot ID to add
     */
    async addFavorite(spotId: string): Promise<void> {
      const { data } = await client.post<FavoriteApiResponse<null>>(
        `/api/users/favorites/${spotId}`,
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to add favorite');
      }
    },

    /**
     * Remove a spot from favorites
     * @param spotId Spot ID to remove
     */
    async removeFavorite(spotId: string): Promise<void> {
      const { data } = await client.delete<FavoriteApiResponse<null>>(
        `/api/users/favorites/${spotId}`,
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to remove favorite');
      }
    },

    /**
     * Check if a spot is favorited
     * @param spotId Spot ID to check
     */
    async isFavorite(spotId: string): Promise<boolean> {
      const { data } = await client.get<FavoriteApiResponse<{ isFavorite: boolean }>>(
        `/api/users/favorites/${spotId}/check`,
      );

      if (!data.success || data.data?.isFavorite === undefined) {
        throw new Error(data.error ?? 'Failed to check favorite status');
      }
      return data.data.isFavorite;
    },
  };
}

export type FavoriteApi = ReturnType<typeof createFavoriteApi>;
