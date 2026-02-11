import { Request, Response, NextFunction } from 'express';
import { ITokenUtil } from '../interfaces/ITokenUtil';
import { IUserRepository } from '../interfaces/IUserRepository';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        userType: string;
      };
    }
  }
}

/**
 * Auth Middleware Factory
 *
 * Dependency Inversion Principle: Middleware depends on abstractions
 * (ITokenUtil, IUserRepository), not concrete implementations.
 *
 * This factory creates middleware functions with injected dependencies.
 */
export const createAuthMiddleware = (
  tokenUtil: ITokenUtil,
  userRepository: IUserRepository
) => {
  /**
   * Authentication middleware
   * Verifies JWT token and attaches user to request
   */
  const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // 1. Extract token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERROR_MESSAGES.NO_TOKEN,
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer '

      // 2. Verify token using injected ITokenUtil
      const decoded = tokenUtil.verifyAccessToken(token);

      if (!decoded) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERROR_MESSAGES.INVALID_TOKEN,
        });
        return;
      }

      // 3. Check if user exists and is active using injected IUserRepository
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: ERROR_MESSAGES.INVALID_TOKEN,
        });
        return;
      }

      if (!user.isActive) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_NOT_ACTIVE,
        });
        return;
      }

      if (user.isSuspended) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_SUSPENDED,
          reason: user.suspendedReason || undefined,
        });
        return;
      }

      // 4. Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        userType: user.userType.toLowerCase(),
      };

      next();
    } catch (error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }
  };

  /**
   * Optional authentication middleware
   * Does not fail if no token is provided, but attaches user if token is valid
   */
  const optionalAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7);
      const decoded = tokenUtil.verifyAccessToken(token);

      if (decoded) {
        const user = await userRepository.findById(decoded.userId);

        if (user && user.isActive && !user.isSuspended) {
          req.user = {
            id: user.id,
            email: user.email,
            userType: user.userType.toLowerCase(),
          };
        }
      }

      next();
    } catch {
      // Ignore errors and continue without user
      next();
    }
  };

  return { authenticate, optionalAuthenticate };
};

/**
 * Require specific user type
 * Must be used after authenticate middleware
 *
 * This is a standalone function (no injected dependencies needed)
 */
export const requireUserType = (...allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: ERROR_MESSAGES.NO_TOKEN,
      });
      return;
    }

    const userType = req.user.userType.toLowerCase();

    // Hosts and superhosts have access to host routes
    // Renters only have access to renter routes
    const hasAccess = allowedTypes.includes(userType);

    if (!hasAccess) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};
