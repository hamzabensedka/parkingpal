import { Request, Response, NextFunction } from 'express';
import { IUserProfileService } from '../../interfaces/IAuthService';
import { SUCCESS_MESSAGES, HTTP_STATUS } from '../../config/constants';
import { UpdateProfileSchemaType } from './auth.validation';
import { getFileUrl } from '../../middleware/upload';

/**
 * User Profile Controller
 * Single Responsibility: Handle HTTP requests for user profile operations
 *
 * This controller is THIN -- it only:
 * 1. Receives the HTTP request
 * 2. Calls the appropriate service method
 * 3. Returns the HTTP response
 *
 * NO business logic lives here.
 *
 * Dependencies injected via constructor (DIP):
 * - IUserProfileService: Profile business logic abstraction
 */
export class UserProfileController {
  constructor(private readonly userProfileService: IUserProfileService) {}

  /**
   * GET /api/users/profile
   * Get full user profile (UserProfileDTO: user, stats, vehicles, payment methods)
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await this.userProfileService.getProfile(req.user!.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/profile
   * Update user profile
   */
  async updateProfile(
    req: Request<{}, {}, UpdateProfileSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await this.userProfileService.updateProfile(req.user!.id, req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users/verify-id
   * Upload ID document for verification
   */
  async verifyId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'No file uploaded',
        });
        return;
      }

      const fileUrl = getFileUrl(req.file.filename);
      const user = await this.userProfileService.verifyId(req.user!.id, fileUrl);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'ID document uploaded successfully. Verification pending.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}
