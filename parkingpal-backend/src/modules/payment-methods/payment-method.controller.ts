import { Request, Response, NextFunction } from 'express';
import { PaymentMethodService } from './payment-method.service';
import { HTTP_STATUS } from '../../config/constants';
import { CreatePaymentMethodSchemaType } from './payment-method.validation';

export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const paymentMethods = await this.paymentMethodService.listByUserId(req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { paymentMethods },
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request<{}, {}, CreatePaymentMethodSchemaType>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const paymentMethod = await this.paymentMethodService.create(req.user!.id, req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Payment method added',
        data: { paymentMethod },
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
      await this.paymentMethodService.delete(req.user!.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Payment method removed',
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
      const paymentMethod = await this.paymentMethodService.setDefault(req.user!.id, req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Default payment method updated',
        data: { paymentMethod },
      });
    } catch (error) {
      next(error);
    }
  }
}
