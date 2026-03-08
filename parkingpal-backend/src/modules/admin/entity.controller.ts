import { Request, Response, NextFunction } from 'express';
import { EntityService } from './entity.service';
import { paginationQuerySchema, updateEntitySchema } from './admin.validation';
import { HTTP_STATUS } from '../../config/constants';

export class EntityController {
  constructor(private readonly entityService: EntityService) {}

  // ==========================================
  // Dashboard Stats
  // ==========================================

  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.entityService.getDashboardStats();
      res.status(HTTP_STATUS.OK).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // List Endpoints
  // ==========================================

  async listPendingDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const result = await this.entityService.listPendingDocuments(Number(limit), Number(offset));
      res.status(HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async listPendingIdVerifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const result = await this.entityService.listPendingIdVerifications(Number(limit), Number(offset));
      res.status(HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async listPendingSpots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const result = await this.entityService.listPendingSpots(Number(limit), Number(offset));
      res.status(HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async listAdmins(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await this.entityService.listAdmins();
      res.status(HTTP_STATUS.OK).json({ success: true, data: admins });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Generic Entity CRUD
  // ==========================================

  async listEntities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { model } = req.params;
      const query = paginationQuerySchema.parse(req.query);
      const { search, status, type } = req.query;

      const result = await this.entityService.list(model, {
        limit: query.limit,
        offset: query.offset,
        search: search as string | undefined,
        sort: query.sort,
        sortDir: query.sortDir,
        filters: {
          ...(status && { status: status as string }),
          ...(type && { type: type as string }),
        },
      });

      res.status(HTTP_STATUS.OK).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { model, id } = req.params;
      const record = await this.entityService.findById(model, id);
      res.status(HTTP_STATUS.OK).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  async updateEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { model, id } = req.params;
      const { updates } = updateEntitySchema.parse(req.body);
      const record = await this.entityService.update(model, id, updates);
      res.status(HTTP_STATUS.OK).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }
}
