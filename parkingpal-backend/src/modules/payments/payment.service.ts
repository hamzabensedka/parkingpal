import { IPaymentService, PLATFORM_COMMISSION_RATE } from '../../interfaces/IPaymentService';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { IBookingRepository } from '../../interfaces/IBookingRepository';
import { ApiError } from '../../middleware/errorHandler';
import { BookingStatus, PaymentStatus } from '@prisma/client';

/**
 * Payment Service
 * Handles Stripe Connect onboarding and payment operations
 */
export class PaymentService {
  constructor(
    private readonly stripeService: IPaymentService,
    private readonly userRepository: IUserRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly appUrl: string
  ) {}

  /**
   * Create Stripe Connect account for host and return onboarding URL
   */
  async createConnectAccount(userId: string): Promise<{ onboardingUrl: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Check if already has a Connect account
    if (user.stripeConnectAccountId) {
      // Check if already onboarded
      if (user.stripeConnectOnboarded) {
        throw ApiError.badRequest('Stripe account already set up');
      }

      // Generate new onboarding link for existing account
      const result = await this.stripeService.createConnectAccount(
        userId,
        user.email,
        `${this.appUrl}/stripe/connect/return`,
        `${this.appUrl}/stripe/connect/refresh`
      );

      return { onboardingUrl: result.onboardingUrl };
    }

    // Create new Connect account
    const result = await this.stripeService.createConnectAccount(
      userId,
      user.email,
      `${this.appUrl}/stripe/connect/return`,
      `${this.appUrl}/stripe/connect/refresh`
    );

    // Save account ID
    await this.userRepository.setStripeConnectAccount(userId, result.accountId, false);

    return { onboardingUrl: result.onboardingUrl };
  }

  /**
   * Check and update Connect account onboarding status
   */
  async checkConnectStatus(userId: string): Promise<{ onboarded: boolean }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.stripeConnectAccountId) {
      return { onboarded: false };
    }

    const isOnboarded = await this.stripeService.isAccountOnboarded(user.stripeConnectAccountId);

    // Update status if changed
    if (isOnboarded !== user.stripeConnectOnboarded) {
      await this.userRepository.setStripeConnectAccount(
        userId,
        user.stripeConnectAccountId,
        isOnboarded
      );
    }

    return { onboarded: isOnboarded };
  }

  /**
   * Create payment intent for a booking
   * IDEMPOTENT: Returns existing payment intent if already created
   */
  async createPaymentIntent(
    renterId: string,
    bookingId: string
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const renter = await this.userRepository.findById(renterId);
    if (!renter) {
      throw ApiError.notFound('User not found');
    }

    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.renterId !== renterId) {
      throw ApiError.forbidden('You can only pay for your own bookings');
    }

    // IDEMPOTENCY: If payment intent already exists, retrieve and return it
    if (booking.stripePaymentIntentId) {
      // Verify the payment intent still exists in Stripe
      const status = await this.stripeService.getPaymentIntentStatus(booking.stripePaymentIntentId);

      // If canceled or succeeded with different amount, allow creating a new one
      if (status === 'canceled') {
        // Can create new payment intent
      } else {
        // Return existing payment intent (idempotent response)
        // Note: client_secret is not returned by getPaymentIntentStatus, so we can't return it
        // Client should store the secret from initial creation
        throw ApiError.badRequest(
          `Payment intent already exists for this booking with status: ${status}. ` +
          'Use the existing client secret or cancel the existing intent first.'
        );
      }
    }

    if (booking.paymentStatus !== PaymentStatus.PENDING) {
      throw ApiError.badRequest('Payment already processed');
    }

    // Get host
    const host = await this.userRepository.findById(booking.hostId);
    if (!host || !host.stripeConnectAccountId || !host.stripeConnectOnboarded) {
      throw ApiError.badRequest('Host payment account not set up');
    }

    // Create or get Stripe customer for renter
    let customerId = renter.stripeCustomerId;
    if (!customerId) {
      customerId = await this.stripeService.createOrGetCustomer(
        renterId,
        renter.email,
        `${renter.firstName} ${renter.lastName}`
      );
      await this.userRepository.setStripeCustomerId(renterId, customerId);
    }

    // Amount in cents
    const amountCents = Math.round(booking.totalPrice * 100);

    // Generate idempotency key for Stripe API (ensures safe retries)
    // Format: payment-intent-{bookingId}-{amountCents}
    const idempotencyKey = `payment-intent-${bookingId}-${amountCents}`;

    // Create payment intent with idempotency
    const result = await this.stripeService.createPaymentIntent(
      amountCents,
      customerId,
      host.stripeConnectAccountId,
      bookingId,
      `ParkingPal booking at ${booking.spot?.title || 'parking spot'}`,
      idempotencyKey
    );

    // Update booking with payment intent ID
    await this.bookingRepository.updatePayment(bookingId, {
      stripePaymentIntentId: result.paymentIntentId,
      platformFee: booking.totalPrice * PLATFORM_COMMISSION_RATE,
      hostPayout: booking.totalPrice * (1 - PLATFORM_COMMISSION_RATE),
    });

    return {
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    };
  }

  /**
   * Confirm payment was successful (called after client-side confirmation)
   * IDEMPOTENT: Safe to call multiple times
   * HANDLES 3DS/SCA: Returns clear messages for authentication requirements
   */
  async confirmPayment(renterId: string, bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.renterId !== renterId) {
      throw ApiError.forbidden('Not authorized');
    }

    if (!booking.stripePaymentIntentId) {
      throw ApiError.badRequest('No payment intent found');
    }

    // IDEMPOTENCY: If already captured, return success (no-op)
    if (booking.paymentStatus === PaymentStatus.CAPTURED) {
      return; // Already captured, idempotent response
    }

    // Verify payment status with Stripe
    const status = await this.stripeService.getPaymentIntentStatus(booking.stripePaymentIntentId);

    // Handle different payment intent statuses
    switch (status) {
      case 'requires_capture':
        // Generate idempotency key for capture
        const idempotencyKey = `capture-${booking.stripePaymentIntentId}`;

        // Capture the payment
        await this.stripeService.capturePayment(booking.stripePaymentIntentId, idempotencyKey);
        await this.bookingRepository.updatePayment(bookingId, {
          paymentStatus: PaymentStatus.CAPTURED,
        });
        // Also confirm the booking
        await this.bookingRepository.updateStatus(bookingId, BookingStatus.CONFIRMED);
        break;

      case 'succeeded':
        // Payment already succeeded (auto-capture or immediate capture)
        await this.bookingRepository.updatePayment(bookingId, {
          paymentStatus: PaymentStatus.CAPTURED,
        });
        break;

      case 'requires_action':
      case 'requires_source_action':
        // 3DS authentication required - client needs to complete authentication
        throw ApiError.badRequest(
          'Payment requires additional authentication (3D Secure). ' +
          'Please complete the authentication in your payment app and try again.'
        );

      case 'requires_payment_method':
        // Payment method failed, needs a new one
        throw ApiError.badRequest(
          'Payment method failed. Please try a different card or payment method.'
        );

      case 'requires_confirmation':
        // Payment intent needs to be confirmed on client side
        throw ApiError.badRequest(
          'Payment needs to be confirmed. Please complete the payment in your app.'
        );

      case 'processing':
        // Payment is being processed (common for bank transfers, some cards)
        throw ApiError.badRequest(
          'Payment is still processing. Please wait a moment and try again, ' +
          'or check your booking status later.'
        );

      case 'canceled':
        // Payment was canceled
        throw ApiError.badRequest(
          'This payment was canceled. Please create a new payment to complete your booking.'
        );

      default:
        // Any other status (failed, etc.)
        throw ApiError.badRequest(
          `Payment not successful. Status: ${status}. ` +
          'Please try again or contact support if the issue persists.'
        );
    }
  }

  /**
   * Release funds to host after dispute window (called by cron or manually)
   * IDEMPOTENT: Safe to call multiple times
   */
  async releasePayoutToHost(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw ApiError.badRequest('Booking must be completed before payout');
    }

    // IDEMPOTENCY: If payout already processed, return success (no-op)
    if (booking.stripeTransferId) {
      return; // Already processed, idempotent response
    }

    // Check dispute window
    if (booking.disputeWindowEnds && new Date() < booking.disputeWindowEnds) {
      throw ApiError.badRequest('Dispute window has not ended yet');
    }

    const host = await this.userRepository.findById(booking.hostId);
    if (!host || !host.stripeConnectAccountId) {
      throw ApiError.badRequest('Host payment account not found');
    }

    // Transfer 80% to host
    const hostPayoutCents = Math.round((booking.hostPayout || 0) * 100);

    // Generate idempotency key for transfer
    const idempotencyKey = `transfer-${bookingId}-${hostPayoutCents}`;

    const result = await this.stripeService.transferToHost(
      hostPayoutCents,
      host.stripeConnectAccountId,
      bookingId,
      idempotencyKey
    );

    await this.bookingRepository.updatePayment(bookingId, {
      stripeTransferId: result.transferId,
      payoutAt: new Date(),
    });
  }

  /**
   * Refund a booking payment
   * IDEMPOTENT: Safe to call multiple times
   */
  async refundBooking(bookingId: string, amount?: number): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (!booking.stripePaymentIntentId) {
      throw ApiError.badRequest('No payment to refund');
    }

    // IDEMPOTENCY: If already refunded, return success (no-op)
    if (booking.paymentStatus === PaymentStatus.REFUNDED) {
      return; // Already refunded, idempotent response
    }

    if (booking.stripeTransferId) {
      throw ApiError.badRequest('Cannot refund after payout to host');
    }

    const refundAmount = amount ? Math.round(amount * 100) : undefined;

    // Generate idempotency key for refund
    const idempotencyKey = `refund-${booking.stripePaymentIntentId}${refundAmount ? `-${refundAmount}` : ''}`;

    await this.stripeService.refundPayment(booking.stripePaymentIntentId, refundAmount, idempotencyKey);

    await this.bookingRepository.updatePayment(bookingId, {
      paymentStatus: PaymentStatus.REFUNDED,
    });
  }
}
