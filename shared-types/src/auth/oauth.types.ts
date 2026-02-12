/**
 * OAuth authentication types
 * Support for Google and Apple Sign-In
 */

export type OAuthProvider = 'google' | 'apple';

/**
 * Request to authenticate with OAuth provider
 */
export interface OAuthSignInRequest {
  /** OAuth provider (google or apple) */
  provider: OAuthProvider;

  /** ID token from OAuth provider */
  idToken: string;

  /** Optional: access token from OAuth provider */
  accessToken?: string;

  /** Optional: user info from OAuth provider (for verification) */
  userInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
  };
}

/**
 * Response from OAuth sign-in
 */
export interface OAuthSignInResponse {
  /** JWT access token */
  accessToken: string;

  /** JWT refresh token */
  refreshToken: string;

  /** User information */
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    userType: string;
    verified: {
      email: boolean;
      phone: boolean;
      id: boolean;
    };
  };

  /** Whether this is a new user (first time OAuth sign-in) */
  isNewUser: boolean;
}

/**
 * OAuth provider configuration status
 */
export interface OAuthProviderStatus {
  /** Provider name */
  provider: OAuthProvider;

  /** Whether the provider is configured and available */
  enabled: boolean;

  /** Client ID for frontend (if applicable) */
  clientId?: string;
}

/**
 * OAuth availability response
 */
export interface OAuthAvailabilityResponse {
  google: OAuthProviderStatus;
  apple: OAuthProviderStatus;
}
