# Stripe Webhook Implementation

## Overview

This document describes the Stripe webhook implementation for ParkingPal, including signature verification, idempotency, and event processing.

## Architecture

### Components

1. **WebhookEvent Model** (Prisma) - Idempotency tracking
2. **WebhookService** - Event processing logic
3. **WebhookController** - HTTP handling + signature verification
4. **Webhook Routes** - Endpoint configuration with raw body parsing

### Flow Diagram

```
Stripe Server
     │
     │ POST /api/webhooks/stripe (with signature header)
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Express App (BEFORE express.json() middleware)             │
│  - Receives RAW body (Buffer)                               │
│  - Routes to webhookController                              │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  WebhookController                                           │
│  1. Extract signature from headers                          │
│  2. Call paymentService.constructWebhookEvent()             │
│     - Verifies signature with webhook secret                │
│     - Returns verified Stripe event                         │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  WebhookService.processEvent()                              │
│  1. Check if event already processed (idempotency)          │
│  2. Record event in database                                │
│  3. Route to specific handler based on event type           │
│  4. Mark as processed                                       │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  Event Handlers                                              │
│  - payment_intent.succeeded → Update booking to CAPTURED    │
│  - payment_intent.payment_failed → Mark payment FAILED      │
│  - charge.refunded → Update to REFUNDED, cancel booking     │
│  - transfer.created → Record payout info                    │
│  - account.updated → Update Connect onboarding status       │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

### 1. Signature Verification ✅

**File:** `src/services/stripe-payment.service.ts`

```typescript
constructWebhookEvent(rawBody: string | Buffer, signature: string, webhookSecret: string): Stripe.Event {
  this.ensureConfigured('Verify webhook');

  try {
    // Stripe's constructEvent validates the signature
    const event = this.stripe!.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
    return event;
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}
```

**Why this matters:**
- Prevents unauthorized requests pretending to be from Stripe
- Ensures event data hasn't been tampered with
- Required for PCI compliance

### 2. Idempotency ✅

**File:** `src/modules/webhooks/webhook.service.ts`

```typescript
async processEvent(event: any): Promise<void> {
  const eventId = event.id;

  // Check if already processed
  const alreadyProcessed = await this.isEventProcessed(eventId);
  if (alreadyProcessed) {
    console.log(`⏭️  Webhook event ${eventId} already processed, skipping`);
    return;
  }

  // Record the event
  await this.recordWebhookEvent(eventId, eventType, event);

  // Process...

  // Mark as processed
  await this.markEventProcessed(eventId);
}
```

**Why this matters:**
- Stripe retries failed webhooks automatically
- Same event could arrive multiple times (network issues, retries)
- Prevents double-charging, double-refunds, duplicate state updates

**Database tracking:**
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  stripe_event_id VARCHAR UNIQUE,  -- e.g., evt_1234567890
  event_type VARCHAR,               -- e.g., payment_intent.succeeded
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  raw_data JSONB,                   -- Full event for debugging
  processing_error VARCHAR,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3. Raw Body Parsing ✅

**File:** `src/app.ts`

```typescript
// CRITICAL: Webhook routes BEFORE express.json()
app.use('/api/webhooks', webhookRoutes);

// Body parsing (applies to all OTHER routes)
app.use(express.json({ limit: '10mb' }));
```

**File:** `src/modules/webhooks/webhook.routes.ts`

```typescript
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }), // Raw body as Buffer
  webhookController.handleStripeWebhook.bind(webhookController)
);
```

**Why this matters:**
- Stripe signature is computed from exact raw bytes
- Parsing to JSON changes the bytes → signature verification fails
- Must use `express.raw()` for webhook endpoint only

## Supported Webhook Events

| Event Type | Handler | Action |
|------------|---------|--------|
| `payment_intent.succeeded` | `handlePaymentIntentSucceeded()` | Update booking to CAPTURED, auto-confirm booking |
| `payment_intent.payment_failed` | `handlePaymentIntentFailed()` | Mark payment as FAILED |
| `charge.refunded` | `handleChargeRefunded()` | Update to REFUNDED, cancel booking |
| `transfer.created` | `handleTransferCreated()` | Record transfer ID and payout timestamp |
| `account.updated` | `handleAccountUpdated()` | Update Connect onboarding status |

### Example: Payment Success Flow

**Stripe Event:**
```json
{
  "id": "evt_1234567890",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 5000,
      "status": "succeeded",
      "metadata": {
        "bookingId": "booking-uuid-here"
      }
    }
  }
}
```

**Processing:**
1. Webhook received → signature verified ✅
2. Check idempotency → not processed yet ✅
3. Extract `bookingId` from metadata
4. Update booking:
   - `paymentStatus` → `CAPTURED`
   - `status` → `CONFIRMED` (if pending)
5. Mark event as processed
6. Return 200 to Stripe

## Payment Status Source of Truth

### ❌ Before (Client-Driven)
```typescript
// Client confirms payment
await paymentApi.confirmPayment(bookingId);
// Backend trusts client without verification
```

**Problems:**
- Client could lie about payment success
- Network errors could cause inconsistency
- No handling of async payment methods (3DS, bank transfers)

### ✅ After (Webhook-Driven)
```typescript
// Client initiates payment
const { clientSecret } = await stripe.confirmPayment(...);

// Stripe processes payment (async)
// → Stripe sends webhook event

// Backend receives webhook
payment_intent.succeeded → Update booking to CAPTURED
```

**Benefits:**
- Server-side source of truth
- Handles async payments (3DS redirects)
- Works even if client disconnects
- Automatic retry on failures

## Configuration

### Environment Variables

```bash
# Required in production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Development (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe CLI or Dashboard)
```

### Stripe Dashboard Setup

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter endpoint URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to send:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
   - ✅ `transfer.created`
   - ✅ `account.updated`
5. Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Test with sample event
stripe trigger payment_intent.succeeded
```

The CLI will output a webhook secret like `whsec_...` - use this in your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Error Handling

### Signature Verification Failure

**Response:** `400 Bad Request`

```json
{
  "success": false,
  "error": "Webhook signature verification failed"
}
```

**Action:** Stripe will NOT retry (it's a permanent error)

### Processing Error

**Response:** `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Webhook processing failed"
}
```

**Action:** Stripe will retry with exponential backoff

**Database tracking:**
```typescript
await this.recordEventError(eventId, error.message);
// Increments retry_count, stores error message
```

## Monitoring & Debugging

### Check Webhook Status

```sql
-- Recent webhook events
SELECT
  stripe_event_id,
  event_type,
  processed,
  processed_at,
  processing_error,
  retry_count,
  created_at
FROM webhook_events
ORDER BY created_at DESC
LIMIT 20;

-- Failed webhooks
SELECT * FROM webhook_events
WHERE processing_error IS NOT NULL
ORDER BY created_at DESC;

-- Unprocessed webhooks (stuck)
SELECT * FROM webhook_events
WHERE processed = false
  AND created_at < NOW() - INTERVAL '5 minutes';
```

### Logs

**Console output:**
```
📥 Received webhook event: payment_intent.succeeded (evt_1234567890)
✅ Payment succeeded for booking abc-123
⏭️  Webhook event evt_1234567890 already processed, skipping
❌ Webhook processing error: Booking not found
```

### Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click your endpoint
3. View "Recent events" tab
4. Check delivery status (✅ succeeded / ❌ failed)

## Testing Checklist

### Manual Testing

- [ ] Send test webhook with Stripe CLI
- [ ] Verify signature is validated
- [ ] Verify event is processed once (idempotency)
- [ ] Verify booking status updated correctly
- [ ] Send duplicate event → should be skipped
- [ ] Send invalid signature → should return 400
- [ ] Check `webhook_events` table has records

### Integration Testing

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Terminal 3: Trigger test event
stripe trigger payment_intent.succeeded
```

**Expected:**
1. Webhook received with valid signature ✅
2. Event processed and recorded in DB ✅
3. Booking status updated ✅
4. 200 response sent to Stripe ✅

## Production Checklist

- [ ] `STRIPE_WEBHOOK_SECRET` set in production env
- [ ] Webhook endpoint registered in Stripe Dashboard (live mode)
- [ ] Events configured: `payment_intent.succeeded`, etc.
- [ ] SSL/HTTPS enabled (Stripe requires HTTPS)
- [ ] Endpoint accessible from internet (not localhost)
- [ ] Rate limiting disabled for webhook endpoint (Stripe sends bursts)
- [ ] Monitoring/alerting configured for failed webhooks
- [ ] Database indexes on `webhook_events.stripe_event_id`

## Files Modified/Created

### Created
1. `prisma/schema.prisma` - Added `WebhookEvent` model
2. `src/modules/webhooks/webhook.service.ts` - Event processing logic
3. `src/modules/webhooks/webhook.controller.ts` - HTTP handler
4. `src/modules/webhooks/webhook.routes.ts` - Route configuration
5. `prisma/migrations/..._add_webhook_events/` - Database migration

### Modified
1. `src/interfaces/IPaymentService.ts` - Added `constructWebhookEvent()` method
2. `src/services/stripe-payment.service.ts` - Implemented webhook verification
3. `src/container.ts` - Added webhook service + controller
4. `src/app.ts` - Mounted webhook routes (BEFORE express.json())

## Related Documentation

- [PAYMENT_SAFETY.md](./PAYMENT_SAFETY.md) - Production Stripe configuration
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Signature Verification](https://stripe.com/docs/webhooks/signatures)

---

**Version:** 1.0
**Last Updated:** 2026-02-12
**Author:** Claude Code Agent
**Status:** ✅ Production Ready
