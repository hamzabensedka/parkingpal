import { Request, Response, NextFunction } from 'express';
import type { UpdateVehicleRequest } from '@parkingpal/shared-types';
import { VehicleService } from './vehicle.service';
import { HTTP_STATUS } from '../../config/constants';
import { CreateVehicleSchemaType, UpdateVehicleSchemaType } from './vehicle.validation';

export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vehicles = await this.vehicleService.listByUserId(req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { vehicles },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request<{}, {}, CreateVehicleSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const vehicle = await this.vehicleService.create(req.user!.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Vehicle added',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<{ id: string }, {}, UpdateVehicleSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body: UpdateVehicleRequest = { ...req.body, year: req.body.year ?? undefined };
      const vehicle = await this.vehicleService.update(req.user!.id, req.params.id, body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Vehicle updated',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await this.vehicleService.delete(req.user!.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Vehicle removed',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  async setDefault(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const vehicle = await this.vehicleService.setDefault(req.user!.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Default vehicle updated',
        data: { vehicle },
      });
    } catch (error) {
      next(error);
    }
  }
}
