/**
 * Payment Service Interface
 * Single Responsibility: Handle payment processing
 * Open/Closed: Can swap Stripe for another payment provider
 */

export interface CreatePaymentIntentResult {
  paymentIntentId: string;
  clientSecret: string;
}

export interface CreateConnectAccountResult {
  accountId: string;
  onboardingUrl: string;
}

export interface TransferResult {
  transferId: string;
  amount: number;
}

export interface IPaymentService {
  /**
   * Create or get Stripe customer for a renter
   */
  createOrGetCustomer(userId: string, email: string, name: string): Promise<string>;

  /**
   * Create a Stripe Connect account for a host
   */
  createConnectAccount(
    userId: string,
    email: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<CreateConnectAccountResult>;

  /**
   * Check if a Connect account is fully onboarded
   */
  isAccountOnboarded(accountId: string): Promise<boolean>;

  /**
   * Create a payment intent (holds funds in escrow)
   * @param amount Amount in cents
   * @param customerId Stripe customer ID
   * @param hostConnectAccountId Host's Stripe Connect account ID
   * @param bookingId For metadata
   */
  createPaymentIntent(
    amount: number,
    customerId: string,
    hostConnectAccountId: string,
    bookingId: string,
    description: string
  ): Promise<CreatePaymentIntentResult>;

  /**
   * Capture a payment intent (confirm the charge)
   */
  capturePayment(paymentIntentId: string): Promise<void>;

  /**
   * Transfer funds to host's Connect account (release from escrow)
   * @param amount Amount in cents to transfer to host (80% after commission)
   * @param hostConnectAccountId Host's Stripe Connect account ID
   * @param bookingId For metadata
   */
  transferToHost(
    amount: number,
    hostConnectAccountId: string,
    bookingId: string
  ): Promise<TransferResult>;

  /**
   * Refund a payment (full or partial)
   */
  refundPayment(paymentIntentId: string, amount?: number): Promise<void>;

  /**
   * Get payment intent status
   */
  getPaymentIntentStatus(paymentIntentId: string): Promise<string>;
}

// Commission rate (20%)
export const PLATFORM_COMMISSION_RATE = 0.20;
