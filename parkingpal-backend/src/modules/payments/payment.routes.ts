import { Router } from 'express';
import { paymentController, authenticate } from '../../container';

const router = Router();

// ==========================================
// Stripe Connect Routes (for hosts)
// ==========================================

/**
 * POST /api/payments/connect/onboard
 * Start Stripe Connect onboarding
 */
router.post(
  '/connect/onboard',
  authenticate,
  paymentController.createConnectAccount.bind(paymentController)
);

/**
 * GET /api/payments/connect/status
 * Check Connect account status
 */
router.get(
  '/connect/status',
  authenticate,
  paymentController.checkConnectStatus.bind(paymentController)
);

// ==========================================
// Payment Routes (for renters)
// ==========================================

/**
 * POST /api/payments/bookings/:bookingId/intent
 * Create payment intent for booking
 */
router.post(
  '/bookings/:bookingId/intent',
  authenticate,
  paymentController.createPaymentIntent.bind(paymentController)
);

/**
 * POST /api/payments/bookings/:bookingId/confirm
 * Confirm payment was successful
 */
router.post(
  '/bookings/:bookingId/confirm',
  authenticate,
  paymentController.confirmPayment.bind(paymentController)
);

/**
 * POST /api/payments/bookings/:bookingId/payout
 * Release payout to host (manual trigger, typically done by cron)
 */
router.post(
  '/bookings/:bookingId/payout',
  authenticate,
  paymentController.releasePayout.bind(paymentController)
);

export default router;
