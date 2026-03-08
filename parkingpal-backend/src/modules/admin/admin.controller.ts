import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import {
  adminLoginSchema,
  verifyDocumentSchema,
  verifyUserIdSchema,
  createAdminSchema,
  updateAdminRoleSchema,
  suspendUserSchema,
  resolveReportSchema,
  createUserSchema,
  updateUserSchema,
  updateSpotStatusSchema,
  paginationQuerySchema,
  entityListQuerySchema,
} from './admin.validation';
import { HTTP_STATUS } from '../../config/constants';
import { ADMIN_PERMISSIONS } from '../../middleware/requireAdmin';

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // Authentication
  // ==========================================

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = adminLoginSchema.parse(req.body);
      const result = await this.adminService.login(input.email, input.password);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            adminRole: result.user.adminRole,
          },
          tokens: result.tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.adminService.getAdminProfile(req.admin!.id);
      const permissions = ADMIN_PERMISSIONS[req.admin!.role];

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePhoto: user.profilePhoto,
            adminRole: user.adminRole,
          },
          permissions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Dashboard
  // ==========================================

  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.adminService.getDashboardStats();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Document Verification
  // ==========================================

  async verifyDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = verifyDocumentSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const document = await this.adminService.verifyDocument(
        req.admin!.id,
        id,
        input,
        metadata
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { document },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // User ID Verification
  // ==========================================

  async verifyUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = verifyUserIdSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const user = await this.adminService.verifyUserId(
        req.admin!.id,
        id,
        input,
        metadata
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // User Management
  // ==========================================

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createUserSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const user = await this.adminService.createUser(req.admin!.id, input, metadata);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = updateUserSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const user = await this.adminService.updateUser(req.admin!.id, id, input, metadata);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = suspendUserSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const user = await this.adminService.suspendUser(req.admin!.id, id, input, metadata);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async unsuspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const user = await this.adminService.unsuspendUser(req.admin!.id, id, metadata);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Report Moderation
  // ==========================================

  async resolveReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = resolveReportSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const report = await this.adminService.resolveReport(req.admin!.id, id, input, metadata);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  async dismissReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const report = await this.adminService.dismissReport(req.admin!.id, id, metadata);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Spot Management
  // ==========================================

  async updateSpotStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = updateSpotStatusSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const spot = await this.adminService.updateSpotStatus(req.admin!.id, id, input, metadata);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Admin Management
  // ==========================================

  async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createAdminSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const user = await this.adminService.createAdmin(req.admin!.id, input, metadata);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAdminRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const input = updateAdminRoleSchema.parse(req.body);
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const user = await this.adminService.updateAdminRole(req.admin!.id, id, input, metadata);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const metadata = { ip: req.ip, userAgent: req.headers['user-agent'] };

      const user = await this.adminService.removeAdmin(req.admin!.id, id, metadata);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Audit Logs
  // ==========================================

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const { adminId, action, entityType } = req.query;

      const result = await this.adminService.getAuditLogs(query, {
        adminId: adminId as string | undefined,
        action: action as string | undefined,
        entityType: entityType as string | undefined,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
