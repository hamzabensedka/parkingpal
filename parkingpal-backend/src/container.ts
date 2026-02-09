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
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaVehicleRepository } from './repositories/prisma-vehicle.repository';
import { PrismaPaymentMethodRepository } from './repositories/prisma-payment-method.repository';
import { PrismaSpotRepository } from './repositories/prisma-spot.repository';

// Services
import { AuthService } from './modules/auth/auth.service';
import { UserProfileService } from './modules/auth/user-profile.service';
import { VehicleService } from './modules/vehicles/vehicle.service';
import { PaymentMethodService } from './modules/payment-methods/payment-method.service';
import { SpotService } from './modules/spots/spot.service';
import { FavoriteService } from './modules/favorites/favorite.service';

// Controllers
import { AuthController } from './modules/auth/auth.controller';
import { UserProfileController } from './modules/auth/user-profile.controller';
import { VehicleController } from './modules/vehicles/vehicle.controller';
import { PaymentMethodController } from './modules/payment-methods/payment-method.controller';
import { SpotController } from './modules/spots/spot.controller';
import { FavoriteController } from './modules/favorites/favorite.controller';

// Middleware factory
import { createAuthMiddleware } from './middleware/authenticate';

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

// ==========================================
// 4. CREATE CONTROLLERS (HTTP handling only)
//    Services injected via constructor
// ==========================================

/** Authentication HTTP handler */
const authController = new AuthController(authService);

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

// ==========================================
// 5. CREATE MIDDLEWARE (with injected dependencies)
// ==========================================

/** Authentication middleware using tokenUtil + userRepository */
const { authenticate, optionalAuthenticate } = createAuthMiddleware(
  tokenUtil,
  userRepository
);

// ==========================================
// EXPORTS
// ==========================================

export {
  // Utilities (exposed for testing or direct use)
  passwordUtil,
  tokenUtil,
  emailService,

  // Repository
  userRepository,

  // Services
  authService,
  userProfileService,

  // Controllers
  authController,
  userProfileController,
  vehicleController,
  paymentMethodController,
  spotController,
  favoriteController,

  // Middleware
  authenticate,
  optionalAuthenticate,
};
