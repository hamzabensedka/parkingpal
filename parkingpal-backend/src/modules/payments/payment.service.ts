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

    // Create payment intent
    const result = await this.stripeService.createPaymentIntent(
      amountCents,
      customerId,
      host.stripeConnectAccountId,
      bookingId,
      `ParkingPal booking at ${booking.spot?.title || 'parking spot'}`
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

    // Verify payment status with Stripe
    const status = await this.stripeService.getPaymentIntentStatus(booking.stripePaymentIntentId);

    if (status === 'requires_capture') {
      // Capture the payment
      await this.stripeService.capturePayment(booking.stripePaymentIntentId);
      await this.bookingRepository.updatePayment(bookingId, {
        paymentStatus: PaymentStatus.CAPTURED,
      });
      // Also confirm the booking
      await this.bookingRepository.updateStatus(bookingId, BookingStatus.CONFIRMED);
    } else if (status === 'succeeded') {
      await this.bookingRepository.updatePayment(bookingId, {
        paymentStatus: PaymentStatus.CAPTURED,
      });
    } else {
      throw ApiError.badRequest(`Payment not successful. Status: ${status}`);
    }
  }

  /**
   * Release funds to host after dispute window (called by cron or manually)
   */
  async releasePayoutToHost(bookingId: string): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw ApiError.badRequest('Booking must be completed before payout');
    }

    if (booking.stripeTransferId) {
      throw ApiError.badRequest('Payout already processed');
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
    const result = await this.stripeService.transferToHost(
      hostPayoutCents,
      host.stripeConnectAccountId,
      bookingId
    );

    await this.bookingRepository.updatePayment(bookingId, {
      stripeTransferId: result.transferId,
      payoutAt: new Date(),
    });
  }

  /**
   * Refund a booking payment
   */
  async refundBooking(bookingId: string, amount?: number): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (!booking.stripePaymentIntentId) {
      throw ApiError.badRequest('No payment to refund');
    }

    if (booking.stripeTransferId) {
      throw ApiError.badRequest('Cannot refund after payout to host');
    }

    const refundAmount = amount ? Math.round(amount * 100) : undefined;
    await this.stripeService.refundPayment(booking.stripePaymentIntentId, refundAmount);

    await this.bookingRepository.updatePayment(bookingId, {
      paymentStatus: PaymentStatus.REFUNDED,
    });
  }
}
