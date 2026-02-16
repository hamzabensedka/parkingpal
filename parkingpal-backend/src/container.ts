/**
 * Dependency Injection Container
 *
 * This is the SINGLE place where all dependencies are created and wired together.
 * Following the Dependency Inversion Principle:
 * - High-level modules (services) depend on abstractions (interfaces)
 * - Low-level modules (implementations) are created here and injected
 *
 * To swap an implementation:
 * 1. Create a new class implementing the same interface
 * 2. Change ONE line here
 * 3. Nothing else changes in the entire codebase
 *
 * Example: Switch email provider
 *   Before: const emailService = new NodemailerEmailService(...)
 *   After:  const emailService = new SendGridEmailService(...)
 *   Result: AuthService keeps working, no code changes needed
 */

import { prisma } from './config/database';
import { env } from './config/env';

// Interface implementations
import { BcryptPasswordUtil } from './utils/bcrypt-password.util';
import { JWTTokenUtil } from './utils/jwt-token.util';
import { NodemailerEmailService } from './services/nodemailer-email.service';
import { TwilioSMSService } from './services/twilio-sms.service';
import { StripePaymentService } from './services/stripe-payment.service';
import { OAuthService } from './services/oauth.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaVehicleRepository } from './repositories/prisma-vehicle.repository';
import { PrismaPaymentMethodRepository } from './repositories/prisma-payment-method.repository';
import { PrismaSpotRepository } from './repositories/prisma-spot.repository';
import { PrismaBookingRepository } from './repositories/prisma-booking.repository';
import { PrismaReviewRepository } from './repositories/prisma-review.repository';
import { PrismaConversationRepository } from './repositories/prisma-conversation.repository';
import { PrismaMessageRepository } from './repositories/prisma-message.repository';
import { PrismaNotificationRepository } from './repositories/prisma-notification.repository';
import { PrismaUserReportRepository } from './repositories/prisma-user-report.repository';
import { PrismaUserBlockRepository } from './repositories/prisma-user-block.repository';
import { ExpoPushService } from './services/expo-push.service';

// Services
import { AuthService } from './modules/auth/auth.service';
import { UserProfileService } from './modules/auth/user-profile.service';
import { VehicleService } from './modules/vehicles/vehicle.service';
import { PaymentMethodService } from './modules/payment-methods/payment-method.service';
import { SpotService } from './modules/spots/spot.service';
import { FavoriteService } from './modules/favorites/favorite.service';
import { BookingService } from './modules/bookings/booking.service';
import { ReviewService } from './modules/reviews/review.service';
import { PaymentService } from './modules/payments/payment.service';
import { MessageService } from './modules/messaging/message.service';
import { NotificationService } from './modules/notifications/notification.service';
import { EarningsService } from './modules/earnings/earnings.service';
import { WebhookService } from './modules/webhooks/webhook.service';
import { SafetyService } from './modules/safety/safety.service';

// Controllers
import { AuthController } from './modules/auth/auth.controller';
import { OAuthController } from './modules/auth/oauth.controller';
import { UserProfileController } from './modules/auth/user-profile.controller';
import { VehicleController } from './modules/vehicles/vehicle.controller';
import { PaymentMethodController } from './modules/payment-methods/payment-method.controller';
import { SpotController } from './modules/spots/spot.controller';
import { FavoriteController } from './modules/favorites/favorite.controller';
import { BookingController } from './modules/bookings/booking.controller';
import { ReviewController } from './modules/reviews/review.controller';
import { PaymentController } from './modules/payments/payment.controller';
import { MessageController } from './modules/messaging/message.controller';
import { NotificationController } from './modules/notifications/notification.controller';
import { EarningsController } from './modules/earnings/earnings.controller';
import { WebhookController } from './modules/webhooks/webhook.controller';
import { SafetyController } from './modules/safety/safety.controller';

// Middleware factory
import { createAuthMiddleware } from './middleware/authenticate';
import { createBlockEnforcementMiddlewareSet } from './middleware/blockEnforcement';

// ==========================================
// 1. CREATE UTILITIES (Single Responsibility each)
// ==========================================

/** Password hashing via bcrypt -- swap with Argon2PasswordUtil if needed */
const passwordUtil = new BcryptPasswordUtil();

/** JWT token generation/verification -- swap with PasetoTokenUtil if needed */
const tokenUtil = new JWTTokenUtil(
  env.jwt.secret,
  env.jwt.refreshSecret,
  env.jwt.expiresIn,
  env.jwt.refreshExpiresIn
);

/** Email sending via Nodemailer/SMTP -- swap with SendGridEmailService if needed */
const emailService = new NodemailerEmailService(
  env.email.host,
  env.email.port,
  env.email.user,
  env.email.password,
  env.email.from
);

/** SMS sending via Twilio -- swap with VonageSMSService if needed */
const smsService = new TwilioSMSService(
  env.twilio.accountSid,
  env.twilio.authToken,
  env.twilio.phoneNumber
);

/** Payment processing via Stripe -- swap with other provider if needed */
const paymentService = new StripePaymentService(env.stripe.secretKey, env.isProduction);

/** OAuth token verification (Google & Apple) */
const oauthService = new OAuthService();

// ==========================================
// 2. CREATE REPOSITORIES (Database access only)
// ==========================================

/** User database access via Prisma -- swap with MongoUserRepository if needed */
const userRepository = new PrismaUserRepository(prisma);

/** Vehicle database access via Prisma */
const vehicleRepository = new PrismaVehicleRepository(prisma);

/** Payment method database access via Prisma (metadata only) */
const paymentMethodRepository = new PrismaPaymentMethodRepository(prisma);

/** Spot database access via Prisma */
const spotRepository = new PrismaSpotRepository(prisma);

/** Booking database access via Prisma */
const bookingRepository = new PrismaBookingRepository(prisma);

/** Review database access via Prisma */
const reviewRepository = new PrismaReviewRepository(prisma);

/** Conversation database access via Prisma */
const conversationRepository = new PrismaConversationRepository(prisma);

/** Message database access via Prisma */
const messageRepository = new PrismaMessageRepository(prisma);

/** Notification database access via Prisma */
const notificationRepository = new PrismaNotificationRepository(prisma);

/** Push notification service via Expo */
const pushNotificationService = new ExpoPushService();

/** User report database access via Prisma */
const userReportRepository = new PrismaUserReportRepository(prisma);

/** User block database access via Prisma */
const userBlockRepository = new PrismaUserBlockRepository(prisma);

// ==========================================
// 3. CREATE SERVICES (Business logic)
//    Dependencies injected via constructor
// ==========================================

/** Authentication business logic */
const authService = new AuthService(
  userRepository,
  passwordUtil,
  tokenUtil,
  emailService,
  smsService,
  env.appUrl
);

/** User profile business logic (returns full UserProfileDTO with vehicles & payment methods) */
const userProfileService = new UserProfileService(
  userRepository,
  vehicleRepository,
  paymentMethodRepository
);

/** Vehicle business logic */
const vehicleService = new VehicleService(vehicleRepository);

/** Payment method business logic */
const paymentMethodService = new PaymentMethodService(paymentMethodRepository);

/** Spot business logic (also needs userRepository to upgrade renter → both) */
const spotService = new SpotService(spotRepository, userRepository);

/** Favorite business logic */
const favoriteService = new FavoriteService(prisma, spotRepository);

/** Stripe payment business logic */
const stripePaymentBusinessService = new PaymentService(
  paymentService,
  userRepository,
  bookingRepository,
  env.appUrl
);

/** Booking business logic */
const bookingService = new BookingService(
  bookingRepository,
  spotRepository,
  vehicleRepository,
  stripePaymentBusinessService
);

/** Review business logic */
const reviewService = new ReviewService(reviewRepository, userRepository, spotRepository, bookingRepository);

/** Messaging business logic */
const messageService = new MessageService(
  conversationRepository,
  messageRepository,
  bookingRepository
);

/** Notification business logic */
const notificationService = new NotificationService(
  notificationRepository,
  userRepository,
  pushNotificationService
);

/** Earnings business logic (uses Prisma directly for aggregation queries) */
const earningsService = new EarningsService(prisma);

/** Webhook business logic (Stripe event processing with idempotency) */
const webhookService = new WebhookService(prisma, bookingRepository);

/** Safety business logic (user reports and blocks) */
const safetyService = new SafetyService(
  userReportRepository,
  userBlockRepository,
  userRepository
);

// ==========================================
// 4. CREATE CONTROLLERS (HTTP handling only)
//    Services injected via constructor
// ==========================================

/** Authentication HTTP handler */
const authController = new AuthController(authService);

/** OAuth HTTP handler */
const oauthController = new OAuthController(authService, oauthService, userRepository, tokenUtil);

/** User profile HTTP handler */
const userProfileController = new UserProfileController(userProfileService);

/** Vehicle HTTP handler */
const vehicleController = new VehicleController(vehicleService);

/** Payment method HTTP handler */
const paymentMethodController = new PaymentMethodController(paymentMethodService);

/** Spot HTTP handler */
const spotController = new SpotController(spotService);

/** Favorite HTTP handler */
const favoriteController = new FavoriteController(favoriteService);

/** Booking HTTP handler */
const bookingController = new BookingController(bookingService);

/** Review HTTP handler */
const reviewController = new ReviewController(reviewService);

/** Payment HTTP handler */
const paymentController = new PaymentController(stripePaymentBusinessService);

/** Messaging HTTP handler */
const messageController = new MessageController(messageService);

/** Notification HTTP handler */
const notificationController = new NotificationController(notificationService);

/** Earnings HTTP handler */
const earningsController = new EarningsController(earningsService);

/** Webhook HTTP handler */
const webhookController = new WebhookController(
  webhookService,
  paymentService,
  env.stripe.webhookSecret || ''
);

/** Safety HTTP handler */
const safetyController = new SafetyController(safetyService);

// ==========================================
// 5. CREATE MIDDLEWARE (with injected dependencies)
// ==========================================

/** Authentication middleware using tokenUtil + userRepository */
const { authenticate, optionalAuthenticate } = createAuthMiddleware(
  tokenUtil,
  userRepository
);

/** Block enforcement middleware set */
const blockEnforcementMiddleware = createBlockEnforcementMiddlewareSet(userBlockRepository);

// ==========================================
// EXPORTS
// ==========================================

export {
  // Utilities (exposed for testing or direct use)
  passwordUtil,
  tokenUtil,
  emailService,
  smsService,
  paymentService,

  // Repository
  userRepository,

  // Services
  authService,
  userProfileService,

  // Controllers
  authController,
  oauthController,
  userProfileController,
  vehicleController,
  paymentMethodController,
  spotController,
  favoriteController,
  bookingController,
  reviewController,
  paymentController,
  messageController,
  notificationController,
  earningsController,
  webhookController,
  safetyController,

  // Services for use in other modules
  notificationService,
  safetyService,

  // Repositories for middleware use
  userBlockRepository,

  // Middleware
  authenticate,
  optionalAuthenticate,
  blockEnforcementMiddleware,
};
