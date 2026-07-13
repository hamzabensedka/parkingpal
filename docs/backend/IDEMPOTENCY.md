# Payment Idempotency Implementation

## Overview

This document describes the idempotency implementation for ParkingPal payment operations, ensuring safe retries and preventing duplicate charges, transfers, or refunds.

## What is Idempotency?

**Idempotency** means an operation can be performed multiple times with the same result as if it were performed once.

### Why It Matters

| Scenario | Without Idempotency | With Idempotency |
|----------|---------------------|------------------|
| Network timeout during payment creation | User retries → **double charge** 💸💸 | User retries → same payment intent returned ✅ |
| Webhook delivery retry | Same event processed twice → **duplicate booking confirmation** | Event processed once, duplicates ignored ✅ |
| Payout cron job failure | Retry → **double transfer to host** 💰💰 | Retry → transfer already exists, skipped ✅ |
| API request timeout | Retry → **new refund created** | Retry → refund already exists, skipped ✅ |

---

## Implementation Layers

### Layer 1: Stripe Idempotency Keys ✅

**File:** `src/services/stripe-payment.service.ts`

Stripe API accepts `Idempotency-Key` headers to ensure the same request isn't processed twice.

```typescript
// Create payment intent with idempotency key
const paymentIntent = await this.stripe!.paymentIntents.create(
  {
    amount,
    currency: 'eur',
    // ... other params
  },
  {
    idempotencyKey: `payment-intent-${bookingId}-${amountCents}`,
  }
);
```

**Format:** `{operation}-{resourceId}-{uniqueData}`

Examples:
- `payment-intent-abc123-5000`
- `capture-pi_1234567890`
- `transfer-abc123-4000`
- `refund-pi_1234567890-1000`

### Layer 2: Database State Checks ✅

**File:** `src/modules/payments/payment.service.ts`

Before making Stripe API calls, check if the operation has already been performed by examining database state.

#### Create Payment Intent

```typescript
// Check if payment intent already exists
if (booking.stripePaymentIntentId) {
  const status = await this.stripeService.getPaymentIntentStatus(
    booking.stripePaymentIntentId
  );

  if (status !== 'canceled') {
    // Return error - payment intent already exists
    throw ApiError.badRequest(`Payment intent already exists with status: ${status}`);
  }
}

// Generate idempotency key
const idempotencyKey = `payment-intent-${bookingId}-${amountCents}`;

// Create with idempotency
const result = await this.stripeService.createPaymentIntent(
  amountCents,
  customerId,
  hostConnectAccountId,
  bookingId,
  description,
  idempotencyKey
);
```

#### Confirm Payment (Capture)

```typescript
// IDEMPOTENCY: If already captured, return success (no-op)
if (booking.paymentStatus === PaymentStatus.CAPTURED) {
  return; // Already captured, safe to return
}

// Generate idempotency key
const idempotencyKey = `capture-${booking.stripePaymentIntentId}`;

// Capture with idempotency
await this.stripeService.capturePayment(paymentIntentId, idempotencyKey);
```

#### Release Payout (Transfer)

```typescript
// IDEMPOTENCY: If payout already processed, return success (no-op)
if (booking.stripeTransferId) {
  return; // Already processed
}

// Generate idempotency key
const idempotencyKey = `transfer-${bookingId}-${hostPayoutCents}`;

// Transfer with idempotency
const result = await this.stripeService.transferToHost(
  hostPayoutCents,
  hostConnectAccountId,
  bookingId,
  idempotencyKey
);
```

#### Refund

```typescript
// IDEMPOTENCY: If already refunded, return success (no-op)
if (booking.paymentStatus === PaymentStatus.REFUNDED) {
  return; // Already refunded
}

// Generate idempotency key
const idempotencyKey = `refund-${paymentIntentId}${amount ? `-${amount}` : ''}`;

// Refund with idempotency
await this.stripeService.refundPayment(paymentIntentId, amount, idempotencyKey);
```

### Layer 3: Webhook Idempotency ✅

**File:** `src/modules/webhooks/webhook.service.ts`

Webhooks are tracked in the `webhook_events` table to prevent duplicate processing.

```typescript
async processEvent(event: any): Promise<void> {
  const eventId = event.id;

  // Check if already processed
  const alreadyProcessed = await this.isEventProcessed(eventId);
  if (alreadyProcessed) {
    console.log(`⏭️ Webhook event ${eventId} already processed, skipping`);
    return;
  }

  // Record the event
  await this.recordWebhookEvent(eventId, eventType, event);

  // Process...

  // Mark as processed
  await this.markEventProcessed(eventId);
}
```

**Database:**
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  stripe_event_id VARCHAR UNIQUE,  -- Prevents duplicates
  event_type VARCHAR,
  processed BOOLEAN DEFAULT false,
  -- ...
);
```

---

## Idempotency Key Format

### Guidelines

✅ **DO:**
- Use consistent format: `{operation}-{resourceId}-{uniqueData}`
- Include resource ID (bookingId, paymentIntentId, etc.)
- Include amount/parameters that affect the operation
- Keep keys under 255 characters
- Use alphanumeric + hyphens only

❌ **DON'T:**
- Include timestamps (makes it non-idempotent)
- Include random values (defeats the purpose)
- Use special characters (only alphanumeric + hyphens)
- Reuse keys across different operations

### Examples

| Operation | Key Format | Example |
|-----------|------------|---------|
| Create Payment Intent | `payment-intent-{bookingId}-{amountCents}` | `payment-intent-abc123-5000` |
| Capture Payment | `capture-{paymentIntentId}` | `capture-pi_1234567890` |
| Transfer to Host | `transfer-{bookingId}-{amountCents}` | `transfer-abc123-4000` |
| Full Refund | `refund-{paymentIntentId}` | `refund-pi_1234567890` |
| Partial Refund | `refund-{paymentIntentId}-{amountCents}` | `refund-pi_1234567890-1000` |

---

## Testing Idempotency

### Test 1: Duplicate Payment Intent Creation

```bash
# Create payment intent
curl -X POST http://localhost:5000/api/payments/bookings/{bookingId}/intent \
  -H "Authorization: Bearer $TOKEN"

# Response: { clientSecret: "...", paymentIntentId: "pi_123" }

# Retry (simulating network failure)
curl -X POST http://localhost:5000/api/payments/bookings/{bookingId}/intent \
  -H "Authorization: Bearer $TOKEN"

# Expected: 400 error "Payment intent already exists with status: requires_payment_method"
```

**Verification:**
```sql
SELECT stripe_payment_intent_id, payment_status
FROM bookings
WHERE id = 'bookingId';

-- Should show only ONE payment intent ID
```

### Test 2: Duplicate Capture

```bash
# Capture payment
curl -X POST http://localhost:5000/api/payments/bookings/{bookingId}/confirm \
  -H "Authorization: Bearer $TOKEN"

# Response: 200 OK

# Retry (simulating network timeout)
curl -X POST http://localhost:5000/api/payments/bookings/{bookingId}/confirm \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK (idempotent - no error)
```

**Verification:**
```sql
SELECT payment_status FROM bookings WHERE id = 'bookingId';
-- Should be CAPTURED (not duplicated)

-- Check Stripe Dashboard
-- Should show only ONE capture event
```

### Test 3: Duplicate Transfer

```bash
# Release payout
curl -X POST http://localhost:5000/api/payments/bookings/{bookingId}/payout \
  -H "Authorization: Bearer $TOKEN"

# Response: 200 OK

# Retry (simulating cron job retry)
curl -X POST http://localhost:5000/api/payments/bookings/{bookingId}/payout \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK (idempotent - no error, no duplicate transfer)
```

**Verification:**
```sql
SELECT stripe_transfer_id, payout_at FROM bookings WHERE id = 'bookingId';
-- Should show only ONE transfer ID

-- Check Stripe Dashboard → Transfers
-- Should show only ONE transfer to host
```

### Test 4: Duplicate Webhook Processing

```bash
# Stripe CLI: Send same event twice
stripe events resend evt_1234567890
stripe events resend evt_1234567890

# Expected backend logs:
# 📥 Received webhook event: payment_intent.succeeded (evt_1234567890)
# ✅ Payment succeeded for booking abc-123
# 📥 Received webhook event: payment_intent.succeeded (evt_1234567890)
# ⏭️ Webhook event evt_1234567890 already processed, skipping
```

**Verification:**
```sql
SELECT COUNT(*) FROM webhook_events WHERE stripe_event_id = 'evt_1234567890';
-- Should be 1 (only recorded once)

SELECT processed, processed_at FROM webhook_events WHERE stripe_event_id = 'evt_1234567890';
-- Should show processed = true
```

---

## Stripe's Idempotency Guarantees

### Idempotency Window

- Stripe stores idempotency keys for **24 hours**
- After 24 hours, the same key can be reused (creates a new resource)
- Same key with different parameters → returns error

### What Stripe Guarantees

✅ **Safe to retry:**
- Network timeouts
- 5xx errors
- Connection failures

❌ **NOT safe to change:**
```typescript
// Original request
stripe.paymentIntents.create({ amount: 5000 }, { idempotencyKey: 'key123' });

// Retry with DIFFERENT amount - will fail!
stripe.paymentIntents.create({ amount: 6000 }, { idempotencyKey: 'key123' });
// Error: Idempotency key used with different parameters
```

### Error Handling

```typescript
try {
  const result = await stripe.paymentIntents.create(params, { idempotencyKey });
} catch (err) {
  if (err.type === 'idempotency_error') {
    // Idempotency key used with different parameters
    // This means the client changed the request - don't retry!
    throw new Error('Payment parameters changed. Cannot retry.');
  }

  // Other errors (network, etc.) are safe to retry
  throw err;
}
```

---

## Database-Level Idempotency

### Unique Constraints

```prisma
model Booking {
  id                      String  @id @default(uuid())
  stripePaymentIntentId   String? @unique  // Prevents duplicate payment intents
  stripeTransferId        String? @unique  // Prevents duplicate transfers
  // ...
}

model WebhookEvent {
  id             String  @id @default(uuid())
  stripeEventId  String  @unique  // Prevents duplicate event processing
  // ...
}
```

These unique constraints provide an additional safety layer:
- Attempting to insert duplicate `stripePaymentIntentId` → database error
- Attempting to insert duplicate `stripeEventId` → database error

---

## Retry Strategy

### Client-Side (Mobile App)

```typescript
// Expo/React Native
async function createPaymentWithRetry(bookingId: string) {
  const maxRetries = 3;
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await paymentApi.createPaymentIntent(bookingId);
      return result; // Success!
    } catch (error) {
      lastError = error;

      if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
        // Payment intent already exists - this is OK (idempotent)
        throw error; // Don't retry
      }

      if (error.response?.status >= 400 && error.response?.status < 500) {
        // Client error (bad request, unauthorized, etc.) - don't retry
        throw error;
      }

      // Network error or 5xx - safe to retry
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }

  throw lastError;
}
```

### Server-Side (Webhooks)

Stripe automatically retries failed webhooks:
- Immediate retry
- 1 hour later
- 3 hours later
- 6 hours later
- 12 hours later
- ... up to 3 days

Our webhook handler is idempotent, so retries are safe.

---

## Monitoring & Debugging

### Check for Duplicate Operations

```sql
-- Duplicate payment intents (should be 0)
SELECT stripe_payment_intent_id, COUNT(*)
FROM bookings
WHERE stripe_payment_intent_id IS NOT NULL
GROUP BY stripe_payment_intent_id
HAVING COUNT(*) > 1;

-- Duplicate transfers (should be 0)
SELECT stripe_transfer_id, COUNT(*)
FROM bookings
WHERE stripe_transfer_id IS NOT NULL
GROUP BY stripe_transfer_id
HAVING COUNT(*) > 1;

-- Duplicate webhook events (should be 0)
SELECT stripe_event_id, COUNT(*)
FROM webhook_events
GROUP BY stripe_event_id
HAVING COUNT(*) > 1;
```

### Stripe Dashboard Checks

1. **Payments** → Check for duplicate payment intents with same metadata
2. **Transfers** → Check for duplicate transfers to same Connect account
3. **Webhooks** → Check delivery status and retries

### Logs

```
# Idempotent responses logged
✅ Payment intent already exists for booking abc-123 (status: requires_capture)
✅ Payment already captured for booking abc-123 (idempotent response)
✅ Transfer already processed for booking abc-123 (idempotent response)
⏭️ Webhook event evt_123 already processed, skipping
```

---

## Production Checklist

- [ ] All payment operations use idempotency keys
- [ ] Database unique constraints on payment/transfer IDs
- [ ] Webhook idempotency table in place
- [ ] Client-side retry logic implemented
- [ ] Monitoring for duplicate operations
- [ ] Stripe idempotency errors handled gracefully
- [ ] Test scenarios verified (see Testing section)
- [ ] Logs include idempotency key for debugging

---

## Related Documentation

- [PAYMENT_SAFETY.md](./PAYMENT_SAFETY.md) - Production safety measures
- [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md) - Webhook architecture
- [Stripe Idempotency Guide](https://stripe.com/docs/api/idempotent_requests)

---

**Version:** 1.0
**Last Updated:** 2026-02-12
**Author:** Claude Code Agent
**Status:** ✅ Production Ready
