import { Request, Response, NextFunction } from 'express';
import { OAuthSignInRequest, OAuthAvailabilityResponse } from '@parkingpal/shared-types';
import { AuthService } from './auth.service';
import { OAuthService } from '../../services/oauth.service';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { ITokenUtil } from '../../interfaces/ITokenUtil';
import { ApiError } from '../../middleware/errorHandler';

export class OAuthController {
  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
    private userRepository: IUserRepository,
    private tokenUtil: ITokenUtil
  ) {}

  availability = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: OAuthAvailabilityResponse = {
        google: {
          provider: 'google',
          enabled: this.oauthService.isGoogleEnabled(),
          clientId: this.oauthService.isGoogleEnabled() ? process.env.GOOGLE_CLIENT_ID : undefined,
        },
        apple: {
          provider: 'apple',
          enabled: this.oauthService.isAppleEnabled(),
          clientId: this.oauthService.isAppleEnabled() ? process.env.APPLE_CLIENT_ID : undefined,
        },
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider, idToken, userInfo } = req.body as OAuthSignInRequest;

      const oauthUser = await this.oauthService.verifyOAuthToken(provider, idToken, userInfo);

      if (!oauthUser.email) {
        throw ApiError.badRequest('Email is required from OAuth provider');
      }

      let user = await this.userRepository.findByEmail(oauthUser.email);
      let isNewUser = false;

      if (!user) {
        isNewUser = true;

        user = await this.userRepository.create({
          email: oauthUser.email,
          password: '',
          firstName: oauthUser.firstName || '',
          lastName: oauthUser.lastName || '',
          userType: 'RENTER',
          emailVerificationToken: '',
          emailVerificationExpires: new Date(),
        });

        if (oauthUser.profilePhoto) {
          user = await this.userRepository.update(user.id, { profilePhoto: oauthUser.profilePhoto });
        }

        if (oauthUser.emailVerified) {
          await this.userRepository.verifyEmail(user.id);
        }
      } else {
        const updates: any = {};
        if (!user.profilePhoto && oauthUser.profilePhoto) updates.profilePhoto = oauthUser.profilePhoto;
        if (!user.emailVerified && oauthUser.emailVerified) {
          await this.userRepository.verifyEmail(user.id);
        }
        if (Object.keys(updates).length > 0) {
          user = await this.userRepository.update(user.id, updates);
        }
      }

      const tokens = this.tokenUtil.generateTokens({
        id: user.id,
        email: user.email,
        userType: user.userType,
      });

      await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePhoto: user.profilePhoto,
            userType: user.userType,
            verified: {
              email: user.emailVerified,
              phone: user.phoneVerified,
              id: user.idVerified,
            },
          },
          isNewUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
