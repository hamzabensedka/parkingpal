import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payment.service';
import { HTTP_STATUS } from '../../config/constants';

/**
 * Payment Controller
 * Handles HTTP requests for payment operations
 */
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * POST /api/payments/connect/onboard
   * Start Stripe Connect onboarding for hosts
   */
  async createConnectAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.paymentService.createConnectAccount(req.user!.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/connect/status
   * Check Stripe Connect onboarding status
   */
  async checkConnectStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.paymentService.checkConnectStatus(req.user!.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/bookings/:bookingId/intent
   * Create payment intent for a booking
   */
  async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const result = await this.paymentService.createPaymentIntent(req.user!.id, bookingId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/bookings/:bookingId/confirm
   * Confirm payment was successful
   */
  async confirmPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      await this.paymentService.confirmPayment(req.user!.id, bookingId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Payment confirmed',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/bookings/:bookingId/payout (admin/host)
   * Release payout to host (after dispute window)
   */
  async releasePayout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      await this.paymentService.releasePayoutToHost(bookingId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Payout released to host',
      });
    } catch (error) {
      next(error);
    }
  }
}
