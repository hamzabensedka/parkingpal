import { OAuthProvider } from '@parkingpal/shared-types';

/**
 * Verified OAuth user information
 */
export interface OAuthUserInfo {
  /** OAuth provider */
  provider: OAuthProvider;

  /** User's email from OAuth provider */
  email: string;

  /** Whether email is verified by the provider */
  emailVerified: boolean;

  /** User's first name */
  firstName?: string;

  /** User's last name */
  lastName?: string;

  /** Profile photo URL */
  profilePhoto?: string;

  /** Unique OAuth provider user ID */
  providerId: string;
}

/**
 * OAuth Service
 * Handles verification of OAuth tokens from Google and Apple
 */
export class OAuthService {
  private googleClientId?: string;
  private appleClientId?: string;

  // Lazy-loaded OAuth libraries (only import if credentials are provided)
  private OAuth2Client: any;
  private appleSignin: any;

  constructor() {
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.appleClientId = process.env.APPLE_CLIENT_ID;
  }

  /**
   * Check if Google OAuth is enabled
   */
  isGoogleEnabled(): boolean {
    return !!this.googleClientId;
  }

  /**
   * Check if Apple OAuth is enabled
   */
  isAppleEnabled(): boolean {
    return !!this.appleClientId;
  }

  /**
   * Verify Google ID token and extract user info
   */
  async verifyGoogleToken(idToken: string): Promise<OAuthUserInfo> {
    if (!this.isGoogleEnabled()) {
      throw new Error('Google OAuth is not configured');
    }

    try {
      // Lazy load google-auth-library only if needed
      if (!this.OAuth2Client) {
        const { OAuth2Client } = await import('google-auth-library');
        this.OAuth2Client = OAuth2Client;
      }

      const client = new this.OAuth2Client(this.googleClientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }

      return {
        provider: 'google',
        email: payload.email!,
        emailVerified: payload.email_verified || false,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profilePhoto: payload.picture,
        providerId: payload.sub,
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  /**
   * Verify Apple ID token and extract user info
   */
  async verifyAppleToken(idToken: string, userInfo?: { email?: string; firstName?: string; lastName?: string }): Promise<OAuthUserInfo> {
    if (!this.isAppleEnabled()) {
      throw new Error('Apple OAuth is not configured');
    }

    try {
      // Lazy load apple-signin-auth only if needed
      if (!this.appleSignin) {
        this.appleSignin = await import('apple-signin-auth');
      }

      const appleIdTokenType = await this.appleSignin.verifyIdToken(idToken, {
        audience: this.appleClientId!,
        nonce: undefined, // Could be used for additional security
      });

      // Apple only provides email on first sign-in, so we use userInfo if available
      return {
        provider: 'apple',
        email: appleIdTokenType.email || userInfo?.email || '',
        emailVerified: appleIdTokenType.email_verified === 'true',
        firstName: userInfo?.firstName,
        lastName: userInfo?.lastName,
        profilePhoto: undefined, // Apple doesn't provide profile photos
        providerId: appleIdTokenType.sub,
      };
    } catch (error) {
      console.error('Apple token verification failed:', error);
      throw new Error('Invalid Apple token');
    }
  }

  /**
   * Verify OAuth token based on provider
   */
  async verifyOAuthToken(
    provider: OAuthProvider,
    idToken: string,
    userInfo?: { email?: string; firstName?: string; lastName?: string }
  ): Promise<OAuthUserInfo> {
    switch (provider) {
      case 'google':
        return this.verifyGoogleToken(idToken);
      case 'apple':
        return this.verifyAppleToken(idToken, userInfo);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }
}
