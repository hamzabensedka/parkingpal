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
  private readonly isProduction: boolean;

  constructor(secretKey: string | undefined, isProduction = false) {
    this.isProduction = isProduction;

    if (!secretKey) {
      if (isProduction) {
        throw new Error(
          'CRITICAL: Stripe is not configured in production. ' +
          'Set STRIPE_SECRET_KEY environment variable. ' +
          'Payment operations cannot proceed without Stripe configuration.'
        );
      }
      console.warn('⚠️  Stripe not configured. Payments will be mocked (development only).');
      this.stripe = null;
    } else {
      this.stripe = new Stripe(secretKey);
    }
  }

  /**
   * Throws an error if Stripe is not configured in production
   */
  private ensureConfigured(operation: string): void {
    if (!this.stripe) {
      throw new Error(
        `Payment service unavailable: ${operation} requires Stripe configuration. ` +
        'Please contact support or configure payment processing.'
      );
    }
  }

  /**
   * Create or get Stripe customer for a renter
   */
  async createOrGetCustomer(userId: string, email: string, name: string): Promise<string> {
    this.ensureConfigured('Create customer');

    // Check if customer already exists by metadata
    const existingCustomers = await this.stripe!.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await this.stripe!.customers.create({
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
    this.ensureConfigured('Create Connect account');

    // Create Connect Express account
    const account = await this.stripe!.accounts.create({
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
    const accountLink = await this.stripe!.accountLinks.create({
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
    this.ensureConfigured('Check account status');

    const account = await this.stripe!.accounts.retrieve(accountId);
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
    description: string,
    idempotencyKey?: string
  ): Promise<CreatePaymentIntentResult> {
    this.ensureConfigured('Create payment intent');

    // Calculate platform fee (20%)
    const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);

    // Create payment intent with automatic capture disabled (manual capture for escrow)
    const paymentIntent = await this.stripe!.paymentIntents.create(
      {
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
      },
      {
        // Idempotency key ensures safe retries
        ...(idempotencyKey && { idempotencyKey }),
      }
    );

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  /**
   * Capture a payment intent (finalize the charge)
   */
  async capturePayment(paymentIntentId: string, idempotencyKey?: string): Promise<void> {
    this.ensureConfigured('Capture payment');

    await this.stripe!.paymentIntents.capture(
      paymentIntentId,
      undefined,
      {
        // Idempotency key ensures safe retries
        ...(idempotencyKey && { idempotencyKey }),
      }
    );
  }

  /**
   * Transfer funds to host's Connect account
   */
  async transferToHost(
    amount: number,
    hostConnectAccountId: string,
    bookingId: string,
    idempotencyKey?: string
  ): Promise<TransferResult> {
    this.ensureConfigured('Transfer to host');

    const transfer = await this.stripe!.transfers.create(
      {
        amount,
        currency: 'eur',
        destination: hostConnectAccountId,
        metadata: {
          bookingId,
        },
      },
      {
        // Idempotency key ensures safe retries
        ...(idempotencyKey && { idempotencyKey }),
      }
    );

    return {
      transferId: transfer.id,
      amount: transfer.amount,
    };
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number, idempotencyKey?: string): Promise<void> {
    this.ensureConfigured('Refund payment');

    await this.stripe!.refunds.create(
      {
        payment_intent: paymentIntentId,
        ...(amount && { amount }),
      },
      {
        // Idempotency key ensures safe retries
        ...(idempotencyKey && { idempotencyKey }),
      }
    );
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<string> {
    this.ensureConfigured('Get payment status');

    const paymentIntent = await this.stripe!.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status;
  }

  /**
   * Verify and construct webhook event from raw request
   * CRITICAL: This must be called with the raw body (NOT JSON-parsed)
   */
  constructWebhookEvent(rawBody: string | Buffer, signature: string, webhookSecret: string): Stripe.Event {
    this.ensureConfigured('Verify webhook');

    try {
      // Stripe's constructEvent validates the signature and returns the event
      const event = this.stripe!.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );

      return event;
    } catch (err: any) {
      // Signature verification failed
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }
}
