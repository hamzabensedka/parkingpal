import { Request, Response, NextFunction } from 'express';
import { FavoriteService } from './favorite.service';
import { HTTP_STATUS } from '../../config/constants';

/**
 * Favorite Controller
 * Single Responsibility: Handle HTTP requests for favorites
 */
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * GET /api/users/favorites
   * Get all favorite spots for the authenticated user
   */
  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const spots = await this.favoriteService.getFavorites(req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Favorites retrieved',
        data: { spots },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/favorites/:spotId
   * Add a spot to favorites
   */
  async addFavorite(req: Request<{ spotId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.favoriteService.addFavorite(req.user!.id, req.params.spotId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Spot added to favorites',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/favorites/:spotId
   * Remove a spot from favorites
   */
  async removeFavorite(req: Request<{ spotId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.favoriteService.removeFavorite(req.user!.id, req.params.spotId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Spot removed from favorites',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/favorites/:spotId/check
   * Check if a spot is favorited
   */
  async checkFavorite(req: Request<{ spotId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const isFavorite = await this.favoriteService.isFavorite(req.user!.id, req.params.spotId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Favorite status retrieved',
        data: { isFavorite },
      });
    } catch (error) {
      next(error);
    }
  }
}
