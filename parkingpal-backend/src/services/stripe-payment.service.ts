import Stripe from 'stripe';
import {
  IPaymentService,
  CreatePaymentIntentResult,
  CreateConnectAccountResult,
  TransferResult,
  PLATFORM_COMMISSION_RATE,
} from '../interfaces/IPaymentService';

/**
 * Stripe implementation of IPaymentService
 * Handles Stripe Connect marketplace payments with escrow
 */
export class StripePaymentService implements IPaymentService {
  private readonly stripe: Stripe | null;

  constructor(secretKey: string | undefined) {
    if (!secretKey) {
      console.warn('Stripe not configured. Payments will be mocked.');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(secretKey);
    }
  }

  /**
   * Create or get Stripe customer for a renter
   */
  async createOrGetCustomer(userId: string, email: string, name: string): Promise<string> {
    if (!this.stripe) {
      console.log(`[MOCK] Creating Stripe customer for ${email}`);
      return `cus_mock_${userId.substring(0, 8)}`;
    }

    // Check if customer already exists by metadata
    const existingCustomers = await this.stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    return customer.id;
  }

  /**
   * Create a Stripe Connect account for a host
   */
  async createConnectAccount(
    userId: string,
    email: string,
    returnUrl: string,
    refreshUrl: string
  ): Promise<CreateConnectAccountResult> {
    if (!this.stripe) {
      console.log(`[MOCK] Creating Connect account for ${email}`);
      return {
        accountId: `acct_mock_${userId.substring(0, 8)}`,
        onboardingUrl: `${returnUrl}?mock=true`,
      };
    }

    // Create Connect Express account
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        userId,
      },
    });

    // Create account link for onboarding
    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return {
      accountId: account.id,
      onboardingUrl: accountLink.url,
    };
  }

  /**
   * Check if a Connect account is fully onboarded
   */
  async isAccountOnboarded(accountId: string): Promise<boolean> {
    if (!this.stripe) {
      return accountId.startsWith('acct_mock_');
    }

    const account = await this.stripe.accounts.retrieve(accountId);
    return account.charges_enabled && account.payouts_enabled;
  }

  /**
   * Create a payment intent with destination charge (escrow)
   * Funds are held on platform until transferred
   */
  async createPaymentIntent(
    amount: number,
    customerId: string,
    hostConnectAccountId: string,
    bookingId: string,
    description: string
  ): Promise<CreatePaymentIntentResult> {
    if (!this.stripe) {
      console.log(`[MOCK] Creating payment intent: ${amount} cents for booking ${bookingId}`);
      return {
        paymentIntentId: `pi_mock_${bookingId.substring(0, 8)}`,
        clientSecret: `pi_mock_${bookingId.substring(0, 8)}_secret_mock`,
      };
    }

    // Calculate platform fee (20%)
    const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);

    // Create payment intent with automatic capture disabled (manual capture for escrow)
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      customer: customerId,
      description,
      capture_method: 'manual', // Hold funds, don't capture immediately
      metadata: {
        bookingId,
        hostConnectAccountId,
        platformFee: platformFee.toString(),
      },
      // We'll transfer to host separately after 48h dispute window
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  /**
   * Capture a payment intent (finalize the charge)
   */
  async capturePayment(paymentIntentId: string): Promise<void> {
    if (!this.stripe) {
      console.log(`[MOCK] Capturing payment: ${paymentIntentId}`);
      return;
    }

    await this.stripe.paymentIntents.capture(paymentIntentId);
  }

  /**
   * Transfer funds to host's Connect account
   */
  async transferToHost(
    amount: number,
    hostConnectAccountId: string,
    bookingId: string
  ): Promise<TransferResult> {
    if (!this.stripe) {
      console.log(`[MOCK] Transferring ${amount} cents to ${hostConnectAccountId}`);
      return {
        transferId: `tr_mock_${bookingId.substring(0, 8)}`,
        amount,
      };
    }

    const transfer = await this.stripe.transfers.create({
      amount,
      currency: 'eur',
      destination: hostConnectAccountId,
      metadata: {
        bookingId,
      },
    });

    return {
      transferId: transfer.id,
      amount: transfer.amount,
    };
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<void> {
    if (!this.stripe) {
      console.log(`[MOCK] Refunding payment: ${paymentIntentId}, amount: ${amount || 'full'}`);
      return;
    }

    await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount }),
    });
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<string> {
    if (!this.stripe) {
      return 'succeeded';
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status;
  }
}
