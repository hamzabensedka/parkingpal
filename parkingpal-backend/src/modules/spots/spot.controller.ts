import { Request, Response, NextFunction } from 'express';
import { SpotService } from './spot.service';
import { HTTP_STATUS } from '../../config/constants';
import type { CreateSpotSchemaType, UpdateSpotSchemaType, SearchSpotsSchemaType, UploadDocumentSchemaType } from './spot.validation';

export class SpotController {
  constructor(private readonly spotService: SpotService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Body comes as JSON string in multipart form
      const body: CreateSpotSchemaType = typeof req.body.data === 'string'
        ? JSON.parse(req.body.data)
        : req.body;

      // Extract client IP for agreement tracking
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.socket.remoteAddress
        || 'unknown';

      const photoFiles = req.files as Express.Multer.File[] | undefined;
      const spot = await this.spotService.create(req.user!.id, body, clientIp, photoFiles);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Spot created successfully',
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const spot = await this.spotService.getById(req.params.id, req.user?.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Spot retrieved',
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const spots = await this.spotService.getMyListings(req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Listings retrieved',
        data: { spots },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<{ id: string }, {}, UpdateSpotSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const spot = await this.spotService.update(req.user!.id, req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Spot updated successfully',
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.spotService.delete(req.user!.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Spot deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async pause(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const spot = await this.spotService.pause(req.user!.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Spot paused',
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  async activate(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const spot = await this.spotService.activate(req.user!.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Spot activated',
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  async addPhotos(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'No photos provided',
        });
        return;
      }

      const spot = await this.spotService.addPhotos(req.user!.id, req.params.id, files);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Photos added',
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  async removePhoto(
    req: Request<{ id: string; photoId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const spot = await this.spotService.removePhoto(req.user!.id, req.params.id, req.params.photoId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Photo removed',
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'No document provided',
        });
        return;
      }

      const type = req.body.type;
      if (!type) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Document type is required',
        });
        return;
      }

      const spot = await this.spotService.uploadDocument(req.user!.id, req.params.id, file, type);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Document uploaded',
        data: { spot },
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.spotService.search(req.query as any);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Search results',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
