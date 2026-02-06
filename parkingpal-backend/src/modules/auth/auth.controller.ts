import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../../interfaces/IAuthService';
import { SUCCESS_MESSAGES, HTTP_STATUS } from '../../config/constants';
import {
  RegisterSchemaType,
  LoginSchemaType,
  RefreshTokenSchemaType,
  ForgotPasswordSchemaType,
  ResetPasswordSchemaType,
  VerifyEmailSchemaType,
} from './auth.validation';

/**
 * Authentication Controller
 * Single Responsibility: Handle HTTP requests for authentication operations
 *
 * This controller is THIN -- it only:
 * 1. Receives the HTTP request
 * 2. Calls the appropriate service method
 * 3. Returns the HTTP response
 *
 * NO business logic lives here. All logic is in AuthService.
 *
 * Dependencies injected via constructor (DIP):
 * - IAuthService: Authentication business logic abstraction
 */
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  /**
   * POST /api/auth/register
   */
  async register(
    req: Request<{}, {}, RegisterSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.authService.register(req.body);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.REGISTERED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(
    req: Request<{}, {}, LoginSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.authService.login(req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGGED_IN,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await this.authService.logout(req.user.id);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.LOGGED_OUT,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refreshToken(
    req: Request<{}, {}, RefreshTokenSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokens = await this.authService.refreshToken(req.body.refreshToken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify-email
   */
  async verifyEmail(
    req: Request<{}, {}, VerifyEmailSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.authService.verifyEmail(req.body.token);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(
    req: Request<{}, {}, ForgotPasswordSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.authService.forgotPassword(req.body.email);

      // Always return success for security
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(
    req: Request<{}, {}, ResetPasswordSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.authService.resetPassword(req.body.token, req.body.newPassword);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser(req.user!.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}
