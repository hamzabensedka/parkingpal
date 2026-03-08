import { Request, Response, NextFunction } from 'express';
import { IUserRepository } from '../interfaces/IUserRepository';
import { HTTP_STATUS } from '../config/constants';
import { AdminRole } from '@prisma/client';

// Extend Express Request type to include admin info
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: AdminRole;
      };
    }
  }
}

/**
 * Admin Middleware Factory
 *
 * Creates middleware functions for admin access control.
 * Follows the same Dependency Inversion pattern as auth middleware.
 */
export const createAdminMiddleware = (userRepository: IUserRepository) => {
  /**
   * Require admin access
   * Must be used AFTER authenticate middleware
   * Verifies user has isAdmin: true and attaches admin info to request
   */
  const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Fetch full user to check admin status
      const user = await userRepository.findById(req.user.id);

      if (!user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      if (!user.isAdmin || !user.adminRole) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Admin access required',
        });
        return;
      }

      // Attach admin info to request
      req.admin = {
        id: user.id,
        email: user.email,
        role: user.adminRole,
      };

      next();
    } catch (error) {
      console.error('[requireAdmin] Error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  /**
   * Require specific admin role(s)
   * Must be used AFTER requireAdmin middleware
   *
   * @param allowedRoles - Array of AdminRole values that are allowed access
   */
  const requireRole = (...allowedRoles: AdminRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.admin) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Admin access required',
        });
        return;
      }

      if (!allowedRoles.includes(req.admin.role)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`,
        });
        return;
      }

      next();
    };
  };

  return { requireAdmin, requireRole };
};

/**
 * Permission definitions by role
 * Used for frontend to know what features to show
 */
export const ADMIN_PERMISSIONS = {
  SUPER_ADMIN: {
    canCreateAdmins: true,
    canManageAdmins: true,
    canVerifyDocuments: true,
    canModerateReports: true,
    canManageUsers: true,
    canCreateUsers: true,
    canSuspendUsers: true,
    canViewAuditLogs: true,
    canEditAllEntities: true,
    canViewDashboard: true,
  },
  MODERATOR: {
    canCreateAdmins: false,
    canManageAdmins: false,
    canVerifyDocuments: true,
    canModerateReports: true,
    canManageUsers: true,
    canCreateUsers: false,
    canSuspendUsers: true,
    canViewAuditLogs: false,
    canEditAllEntities: false,
    canViewDashboard: true,
  },
  SUPPORT: {
    canCreateAdmins: false,
    canManageAdmins: false,
    canVerifyDocuments: false,
    canModerateReports: false,
    canManageUsers: false,
    canCreateUsers: false,
    canSuspendUsers: false,
    canViewAuditLogs: false,
    canEditAllEntities: false,
    canViewDashboard: true, // View-only
  },
} as const;

export type AdminPermissions = typeof ADMIN_PERMISSIONS[AdminRole];
