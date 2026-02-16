import { Router } from 'express';
import express from 'express';
import { webhookController } from '../../container';

const router = Router();

/**
 * CRITICAL: Stripe webhooks require RAW body for signature verification
 * This route uses express.raw() middleware instead of express.json()
 */

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * This endpoint:
 * - Receives raw body (Buffer)
 * - Verifies Stripe signature
 * - Processes payment events
 * - Is idempotent (duplicate events are ignored)
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }), // CRITICAL: Use raw body, not JSON
  webhookController.handleStripeWebhook.bind(webhookController)
);

export default router;
