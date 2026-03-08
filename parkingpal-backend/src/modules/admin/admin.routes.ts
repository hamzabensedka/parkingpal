import { Router } from 'express';
import { AdminController } from './admin.controller';
import { EntityController } from './entity.controller';
import { AdminRole } from '@prisma/client';

/**
 * Admin Routes Factory
 *
 * Creates admin routes with injected dependencies.
 * Uses middleware for authentication and role-based access control.
 */
export const createAdminRoutes = (
  adminController: AdminController,
  entityController: EntityController,
  authenticate: any,
  requireAdmin: any,
  requireRole: (...roles: AdminRole[]) => any
): Router => {
  const router = Router();

  // ==========================================
  // Public Admin Auth Routes
  // ==========================================

  // Admin login (no auth required)
  router.post('/auth/login', adminController.login.bind(adminController));

  // ==========================================
  // Protected Routes - Require Admin Auth
  // ==========================================

  // All routes below require authentication AND admin status
  router.use(authenticate);
  router.use(requireAdmin);

  // Get current admin profile
  router.get('/auth/me', adminController.getProfile.bind(adminController));

  // ==========================================
  // Dashboard (All Admins)
  // ==========================================

  router.get('/dashboard/stats', entityController.getDashboardStats.bind(entityController));

  // ==========================================
  // Pending Lists (SUPER_ADMIN, MODERATOR)
  // ==========================================

  router.get(
    '/documents',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    entityController.listPendingDocuments.bind(entityController)
  );

  router.get(
    '/users/pending-id',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    entityController.listPendingIdVerifications.bind(entityController)
  );

  router.get(
    '/spots/pending',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    entityController.listPendingSpots.bind(entityController)
  );

  // ==========================================
  // Document Verification (SUPER_ADMIN, MODERATOR)
  // ==========================================

  router.post(
    '/documents/:id/verify',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    adminController.verifyDocument.bind(adminController)
  );

  // ==========================================
  // User ID Verification (SUPER_ADMIN, MODERATOR)
  // ==========================================

  router.post(
    '/users/:id/verify-id',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    adminController.verifyUserId.bind(adminController)
  );

  // ==========================================
  // User Management
  // ==========================================

  // Create user (SUPER_ADMIN only)
  router.post(
    '/users',
    requireRole(AdminRole.SUPER_ADMIN),
    adminController.createUser.bind(adminController)
  );

  // Update user (SUPER_ADMIN, MODERATOR)
  router.patch(
    '/users/:id',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    adminController.updateUser.bind(adminController)
  );

  // Suspend user (SUPER_ADMIN, MODERATOR)
  router.post(
    '/users/:id/suspend',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    adminController.suspendUser.bind(adminController)
  );

  // Unsuspend user (SUPER_ADMIN, MODERATOR)
  router.post(
    '/users/:id/unsuspend',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    adminController.unsuspendUser.bind(adminController)
  );

  // ==========================================
  // Report Moderation (SUPER_ADMIN, MODERATOR)
  // ==========================================

  router.post(
    '/reports/:id/resolve',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    adminController.resolveReport.bind(adminController)
  );

  router.post(
    '/reports/:id/dismiss',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    adminController.dismissReport.bind(adminController)
  );

  // ==========================================
  // Spot Management (SUPER_ADMIN, MODERATOR)
  // ==========================================

  router.patch(
    '/spots/:id/status',
    requireRole(AdminRole.SUPER_ADMIN, AdminRole.MODERATOR),
    adminController.updateSpotStatus.bind(adminController)
  );

  // ==========================================
  // Admin Management (SUPER_ADMIN only)
  // ==========================================

  router.get(
    '/admins',
    requireRole(AdminRole.SUPER_ADMIN),
    entityController.listAdmins.bind(entityController)
  );

  router.post(
    '/admins',
    requireRole(AdminRole.SUPER_ADMIN),
    adminController.createAdmin.bind(adminController)
  );

  router.patch(
    '/admins/:id/role',
    requireRole(AdminRole.SUPER_ADMIN),
    adminController.updateAdminRole.bind(adminController)
  );

  router.delete(
    '/admins/:id',
    requireRole(AdminRole.SUPER_ADMIN),
    adminController.removeAdmin.bind(adminController)
  );

  // ==========================================
  // Audit Logs (SUPER_ADMIN only)
  // ==========================================

  router.get(
    '/audit-logs',
    requireRole(AdminRole.SUPER_ADMIN),
    adminController.getAuditLogs.bind(adminController)
  );

  // ==========================================
  // Generic Entity CRUD (SUPER_ADMIN only)
  // ==========================================

  router.get(
    '/entities/:model',
    requireRole(AdminRole.SUPER_ADMIN),
    entityController.listEntities.bind(entityController)
  );

  router.get(
    '/entities/:model/:id',
    requireRole(AdminRole.SUPER_ADMIN),
    entityController.getEntity.bind(entityController)
  );

  router.patch(
    '/entities/:model/:id',
    requireRole(AdminRole.SUPER_ADMIN),
    entityController.updateEntity.bind(entityController)
  );

  return router;
};
