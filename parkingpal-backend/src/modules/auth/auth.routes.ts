import { Router } from 'express';
import {
  authController,
  oauthController,
  userProfileController,
  authenticate,
  favoriteController,
} from '../../container';
import { validate } from '../../middleware/validate';
import {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  tokenRefreshLimiter,
  smsCodeLimiter,
  userApiLimiter,
} from '../../middleware/rateLimiter';
import { uploadIdDocument, handleMulterError } from '../../middleware/upload';
import vehicleRoutes from '../vehicles/vehicle.routes';
import paymentMethodRoutes from '../payment-methods/payment-method.routes';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  updateProfileSchema,
  sendPhoneCodeSchema,
  verifyPhoneSchema,
} from './auth.validation';

/**
 * Auth Routes
 * All dependencies (controllers, middleware) come from the DI container.
 * No direct instantiation happens here.
 */

const router = Router();

// ==========================================
// Public Authentication Routes
// ==========================================

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register.bind(authController)
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

/**
 * POST /api/auth/refresh
 */
router.post(
  '/refresh',
  tokenRefreshLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

/**
 * POST /api/auth/verify-email
 */
router.post(
  '/verify-email',
  emailVerificationLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail.bind(authController)
);

/**
 * POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

/**
 * POST /api/auth/reset-password
 */
router.post(
  '/reset-password',
  passwordResetLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

// ==========================================
// OAuth Routes
// ==========================================

/**
 * GET /api/auth/oauth/availability
 * Check which OAuth providers are configured and available
 */
router.get(
  '/oauth/availability',
  oauthController.availability.bind(oauthController)
);

/**
 * POST /api/auth/oauth/signin
 * Sign in or sign up with OAuth provider (Google or Apple)
 */
router.post(
  '/oauth/signin',
  authLimiter,
  oauthController.signIn.bind(oauthController)
);

// ==========================================
// Protected Authentication Routes
// ==========================================

/**
 * POST /api/auth/logout
 */
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

/**
 * GET /api/auth/me
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser.bind(authController)
);

/**
 * POST /api/auth/send-phone-code
 * Send SMS verification code to user's phone
 */
router.post(
  '/send-phone-code',
  authenticate,
  smsCodeLimiter, // Limit SMS code requests per user
  validate(sendPhoneCodeSchema),
  authController.sendPhoneCode.bind(authController)
);

/**
 * POST /api/auth/verify-phone
 * Verify phone with the code sent via SMS
 */
router.post(
  '/verify-phone',
  authenticate,
  validate(verifyPhoneSchema),
  authController.verifyPhone.bind(authController)
);

// ==========================================
// User Profile Routes (mounted at /api/users)
// ==========================================

export const userRouter = Router();

// Apply user-specific rate limiting to all user profile routes
userRouter.use(userApiLimiter);

/**
 * GET /api/users/profile
 */
userRouter.get(
  '/profile',
  authenticate,
  userProfileController.getProfile.bind(userProfileController)
);

/**
 * PUT /api/users/profile
 */
userRouter.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  userProfileController.updateProfile.bind(userProfileController)
);

/**
 * POST /api/users/verify-id
 */
userRouter.post(
  '/verify-id',
  authenticate,
  uploadIdDocument,
  handleMulterError,
  userProfileController.verifyId.bind(userProfileController)
);

/**
 * Vehicles: GET/POST /api/users/vehicles, PUT/DELETE /api/users/vehicles/:id, POST /api/users/vehicles/:id/default
 */
userRouter.use('/vehicles', vehicleRoutes);

/**
 * Payment methods: GET/POST /api/users/payment-methods, DELETE /api/users/payment-methods/:id, POST /api/users/payment-methods/:id/default
 */
userRouter.use('/payment-methods', paymentMethodRoutes);

/**
 * Favorites: GET /api/users/favorites, POST /api/users/favorites/:spotId, DELETE /api/users/favorites/:spotId
 */
userRouter.get('/favorites', authenticate, favoriteController.getFavorites.bind(favoriteController));
userRouter.post('/favorites/:spotId', authenticate, favoriteController.addFavorite.bind(favoriteController));
userRouter.delete('/favorites/:spotId', authenticate, favoriteController.removeFavorite.bind(favoriteController));
userRouter.get('/favorites/:spotId/check', authenticate, favoriteController.checkFavorite.bind(favoriteController));

export default router;
