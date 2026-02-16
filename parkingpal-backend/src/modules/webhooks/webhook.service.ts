import { PrismaClient, PaymentStatus, BookingStatus } from '@prisma/client';
import { IBookingRepository } from '../../interfaces/IBookingRepository';
import { ApiError } from '../../middleware/errorHandler';

/**
 * Webhook Service
 * Handles Stripe webhook events with idempotency
 */
export class WebhookService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly bookingRepository: IBookingRepository
  ) {}

  /**
   * Check if webhook event has already been processed (idempotency)
   */
  async isEventProcessed(stripeEventId: string): Promise<boolean> {
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { stripeEventId },
    });

    return existing?.processed === true;
  }

  /**
   * Record webhook event for idempotency tracking
   */
  async recordWebhookEvent(stripeEventId: string, eventType: string, rawData: any): Promise<void> {
    await this.prisma.webhookEvent.create({
      data: {
        stripeEventId,
        eventType,
        rawData,
        processed: false,
      },
    });
  }

  /**
   * Mark webhook event as processed
   */
  async markEventProcessed(stripeEventId: string): Promise<void> {
    await this.prisma.webhookEvent.update({
      where: { stripeEventId },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });
  }

  /**
   * Record processing error for webhook event
   */
  async recordEventError(stripeEventId: string, error: string): Promise<void> {
    await this.prisma.webhookEvent.update({
      where: { stripeEventId },
      data: {
        processingError: error,
        retryCount: { increment: 1 },
      },
    });
  }

  /**
   * Handle payment_intent.succeeded event
   * This is the SOURCE OF TRUTH for payment success
   */
  async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    const bookingId = paymentIntent.metadata?.bookingId;

    if (!bookingId) {
      throw new Error('Booking ID not found in payment intent metadata');
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound(`Booking ${bookingId} not found`);
    }

    // Update payment status to CAPTURED
    await this.bookingRepository.updatePayment(bookingId, {
      paymentStatus: PaymentStatus.CAPTURED,
    });

    // Auto-confirm the booking
    if (booking.status === BookingStatus.PENDING) {
      await this.bookingRepository.updateStatus(bookingId, BookingStatus.CONFIRMED);
    }

    console.log(`✅ Payment succeeded for booking ${bookingId}`);
  }

  /**
   * Handle payment_intent.payment_failed event
   * Captures failure reason including 3DS/authentication failures
   */
  async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
    const bookingId = paymentIntent.metadata?.bookingId;

    if (!bookingId) {
      return; // Nothing to do without booking ID
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      return; // Booking might have been deleted
    }

    // Extract failure details
    const failureCode = paymentIntent.last_payment_error?.code;
    const failureMessage = paymentIntent.last_payment_error?.message;
    const declineCode = paymentIntent.last_payment_error?.decline_code;

    // Log detailed failure information
    let failureReason = 'Unknown';
    if (failureCode === 'authentication_required') {
      failureReason = '3DS authentication failed or was canceled by user';
    } else if (failureCode === 'card_declined') {
      failureReason = `Card declined${declineCode ? ` (${declineCode})` : ''}`;
    } else if (failureCode) {
      failureReason = failureCode;
    }

    // Update payment status to FAILED
    await this.bookingRepository.updatePayment(bookingId, {
      paymentStatus: PaymentStatus.FAILED,
    });

    console.log(`❌ Payment failed for booking ${bookingId}: ${failureReason}`);
    if (failureMessage) {
      console.log(`   Details: ${failureMessage}`);
    }
  }

  /**
   * Handle charge.refunded event
   */
  async handleChargeRefunded(charge: any): Promise<void> {
    const paymentIntentId = charge.payment_intent;

    if (!paymentIntentId) {
      return;
    }

    // Find booking by payment intent ID
    const booking = await this.prisma.booking.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!booking) {
      return;
    }

    // Update payment status to REFUNDED
    await this.bookingRepository.updatePayment(booking.id, {
      paymentStatus: PaymentStatus.REFUNDED,
    });

    // Cancel the booking if not already cancelled
    if (booking.status !== BookingStatus.CANCELLED) {
      await this.bookingRepository.updateStatus(booking.id, BookingStatus.CANCELLED);
    }

    console.log(`💰 Refund processed for booking ${booking.id}`);
  }

  /**
   * Handle transfer.created event
   */
  async handleTransferCreated(transfer: any): Promise<void> {
    const bookingId = transfer.metadata?.bookingId;

    if (!bookingId) {
      return;
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      return;
    }

    // Update transfer tracking
    await this.bookingRepository.updatePayment(bookingId, {
      stripeTransferId: transfer.id,
      payoutAt: new Date(),
    });

    console.log(`💸 Transfer created for booking ${bookingId}: ${transfer.id}`);
  }

  /**
   * Handle account.updated event (for Connect accounts)
   */
  async handleAccountUpdated(account: any): Promise<void> {
    const userId = account.metadata?.userId;

    if (!userId) {
      return;
    }

    const isOnboarded = account.charges_enabled && account.payouts_enabled;

    // Update user's Connect status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        stripeConnectOnboarded: isOnboarded,
      },
    });

    console.log(`🔗 Connect account updated for user ${userId}: onboarded=${isOnboarded}`);
  }

  /**
   * Handle payment_intent.canceled event
   * Occurs when payment is canceled (e.g., 3DS timeout, user abandonment)
   */
  async handlePaymentIntentCanceled(paymentIntent: any): Promise<void> {
    const bookingId = paymentIntent.metadata?.bookingId;

    if (!bookingId) {
      return;
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      return;
    }

    // Only update if payment is still pending
    if (booking.paymentStatus === PaymentStatus.PENDING) {
      await this.bookingRepository.updatePayment(bookingId, {
        paymentStatus: PaymentStatus.FAILED,
      });

      console.log(`🚫 Payment canceled for booking ${bookingId} (possibly 3DS timeout or user abandonment)`);
    }
  }

  /**
   * Process any webhook event with idempotency
   */
  async processEvent(event: any): Promise<void> {
    const eventId = event.id;
    const eventType = event.type;

    // Check idempotency - if already processed, skip
    const alreadyProcessed = await this.isEventProcessed(eventId);
    if (alreadyProcessed) {
      console.log(`⏭️  Webhook event ${eventId} already processed, skipping`);
      return;
    }

    // Record the event
    await this.recordWebhookEvent(eventId, eventType, event);

    try {
      // Route to appropriate handler based on event type
      switch (eventType) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object);
          break;

        case 'transfer.created':
          await this.handleTransferCreated(event.data.object);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event.data.object);
          break;

        default:
          console.log(`ℹ️  Unhandled webhook event type: ${eventType}`);
      }

      // Mark as processed
      await this.markEventProcessed(eventId);
    } catch (error: any) {
      // Record error but don't throw - Stripe will retry
      await this.recordEventError(eventId, error.message);
      console.error(`❌ Error processing webhook ${eventId}:`, error);
      throw error; // Re-throw so Stripe knows to retry
    }
  }
}
