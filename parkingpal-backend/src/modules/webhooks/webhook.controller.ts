import { Request, Response, NextFunction } from 'express';
import { IPaymentService } from '../../interfaces/IPaymentService';
import { WebhookService } from './webhook.service';
import { HTTP_STATUS } from '../../config/constants';

/**
 * Webhook Controller
 * Handles Stripe webhook events with signature verification
 */
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly paymentService: IPaymentService,
    private readonly webhookSecret: string
  ) {}

  /**
   * POST /api/webhooks/stripe
   * Handle Stripe webhook events
   *
   * CRITICAL NOTES:
   * 1. This endpoint MUST receive raw body (NOT JSON-parsed)
   * 2. Signature verification requires the exact raw bytes
   * 3. Express must be configured with express.raw() for this route
   */
  async handleStripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get the signature from headers
      const signature = req.headers['stripe-signature'];

      if (!signature || typeof signature !== 'string') {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Missing stripe-signature header',
        });
        return;
      }

      // Get raw body (must be Buffer or string, NOT parsed JSON)
      const rawBody = req.body;

      if (!rawBody) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Missing request body',
        });
        return;
      }

      // Verify webhook signature and construct event
      let event;
      try {
        event = this.paymentService.constructWebhookEvent(
          rawBody,
          signature,
          this.webhookSecret
        );
      } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message);
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Webhook signature verification failed',
        });
        return;
      }

      console.log(`📥 Received webhook event: ${event.type} (${event.id})`);

      // Process the event with idempotency
      await this.webhookService.processEvent(event);

      // Return 200 immediately to acknowledge receipt
      res.status(HTTP_STATUS.OK).json({
        success: true,
        received: true,
      });
    } catch (error) {
      // Log error but still return 200 if it's a processing error
      // (Stripe will retry failed webhooks automatically)
      console.error('❌ Webhook processing error:', error);

      // Return 500 so Stripe retries
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Webhook processing failed',
      });
    }
  }
}
