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

// Services
import { AuthService } from './modules/auth/auth.service';
import { UserProfileService } from './modules/auth/user-profile.service';

// Controllers
import { AuthController } from './modules/auth/auth.controller';
import { UserProfileController } from './modules/auth/user-profile.controller';

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

/** User profile business logic */
const userProfileService = new UserProfileService(userRepository);

// ==========================================
// 4. CREATE CONTROLLERS (HTTP handling only)
//    Services injected via constructor
// ==========================================

/** Authentication HTTP handler */
const authController = new AuthController(authService);

/** User profile HTTP handler */
const userProfileController = new UserProfileController(userProfileService);

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

  // Middleware
  authenticate,
  optionalAuthenticate,
};
