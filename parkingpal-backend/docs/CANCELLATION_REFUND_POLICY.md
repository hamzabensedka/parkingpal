# Cancellation & Refund Policy Implementation

## Overview

This document describes how ParkingPal handles booking cancellations and automatic refunds based on cancellation policies.

## Cancellation Policies

Each parking spot has a **cancellation policy** that determines refund amounts based on when the renter cancels.

### Policy Types

| Policy | Description | Refund Rules |
|--------|-------------|--------------|
| **FLEXIBLE** | Most lenient | 100% refund if >24h before<br>50% refund if <24h before<br>0% if already started |
| **MODERATE** | Balanced | 100% refund if >48h before<br>50% refund if 24-48h before<br>0% refund if <24h before |
| **STRICT** | Least lenient | 100% refund if >7 days before<br>50% refund if 3-7 days before<br>0% refund if <3 days before |
| **NON_REFUNDABLE** | No refunds | 0% refund always |

### How It Works

```
Booking Start: 2026-02-20 14:00

FLEXIBLE Policy:
├─ Cancel on 2026-02-19 13:00 (25h before) → 100% refund ✅
├─ Cancel on 2026-02-20 13:00 (1h before)  → 50% refund ⚠️
└─ Cancel on 2026-02-20 15:00 (after start) → 0% refund ❌

MODERATE Policy:
├─ Cancel on 2026-02-18 13:00 (49h before) → 100% refund ✅
├─ Cancel on 2026-02-19 13:00 (25h before) → 50% refund ⚠️
└─ Cancel on 2026-02-20 13:00 (1h before)  → 0% refund ❌

STRICT Policy:
├─ Cancel on 2026-02-13 13:00 (7+ days)   → 100% refund ✅
├─ Cancel on 2026-02-17 13:00 (3-7 days)  → 50% refund ⚠️
└─ Cancel on 2026-02-19 13:00 (<3 days)   → 0% refund ❌
```

---

## Implementation

### Automatic Refund Flow

**File:** `src/modules/bookings/booking.service.ts`

When a booking is cancelled:

1. **Validate cancellation** - Check user permissions and booking status
2. **Update booking status** - Mark as CANCELLED
3. **Calculate refund** - Based on policy and time until start
4. **Process refund** - Call PaymentService.refundBooking() (idempotent)
5. **Return updated booking** - With cancellation details

```typescript
async cancel(bookingId: string, userId: string, reason?: string) {
  // ... validation ...

  // Cancel the booking
  const cancelledAt = new Date();
  const updated = await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED, {
    cancelledAt,
    cancelledBy: userId,
    cancellationReason: reason,
  });

  // Process refund if payment was captured
  if (booking.paymentStatus === PaymentStatus.CAPTURED && booking.stripePaymentIntentId) {
    // Calculate refund percentage based on cancellation policy
    const refundPercentage = this.calculateRefundPercentage(
      booking.cancellationPolicy,
      booking.startTime,
      cancelledAt
    );

    if (refundPercentage > 0) {
      // Calculate refund amount
      const totalAmountCents = Math.round(booking.totalPrice * 100);
      const refundAmountCents = Math.round((totalAmountCents * refundPercentage) / 100);

      // Process refund (idempotent)
      await this.paymentService.refundBooking(
        bookingId,
        refundAmountCents === totalAmountCents ? undefined : refundAmountCents
      );
    }
  }

  return toBookingDTO(updated);
}
```

### Refund Percentage Calculation

**File:** `src/modules/bookings/booking.service.ts`

```typescript
private calculateRefundPercentage(
  cancellationPolicy: CancellationPolicy,
  startTime: Date,
  cancelledAt: Date
): number {
  const hoursUntilStart = (startTime.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);

  switch (cancellationPolicy) {
    case CancellationPolicy.FLEXIBLE:
      if (hoursUntilStart <= 0) return 0; // Already started
      if (hoursUntilStart >= 24) return 100;
      return 50;

    case CancellationPolicy.MODERATE:
      if (hoursUntilStart < 24) return 0;
      if (hoursUntilStart >= 48) return 100;
      return 50;

    case CancellationPolicy.STRICT:
      const daysUntilStart = hoursUntilStart / 24;
      if (daysUntilStart < 3) return 0;
      if (daysUntilStart >= 7) return 100;
      return 50;

    case CancellationPolicy.NON_REFUNDABLE:
      return 0;

    default:
      // Default to moderate policy
      if (hoursUntilStart < 24) return 0;
      if (hoursUntilStart >= 48) return 100;
      return 50;
  }
}
```

### Idempotent Refund Processing

**File:** `src/modules/payments/payment.service.ts`

The refund is idempotent - safe to call multiple times:

```typescript
async refundBooking(bookingId: string, amount?: number): Promise<void> {
  const booking = await this.bookingRepository.findById(bookingId);

  // IDEMPOTENCY: If already refunded, return success (no-op)
  if (booking.paymentStatus === PaymentStatus.REFUNDED) {
    return; // Already refunded
  }

  // Generate idempotency key
  const idempotencyKey = `refund-${booking.stripePaymentIntentId}${amount ? `-${amount}` : ''}`;

  // Refund with idempotency
  await this.stripeService.refundPayment(booking.stripePaymentIntentId, amount, idempotencyKey);

  // Update booking payment status
  await this.bookingRepository.updatePayment(bookingId, {
    paymentStatus: PaymentStatus.REFUNDED,
  });
}
```

---

## API Usage

### Cancel a Booking

```http
POST /api/bookings/:id/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Plans changed"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "abc-123",
    "status": "cancelled",
    "paymentStatus": "refunded",
    "cancellationPolicy": "flexible",
    "cancelledAt": "2026-02-12T10:00:00Z",
    "cancelledBy": "user-456",
    "cancellationReason": "Plans changed",
    "totalPrice": 25.00,
    "refundAmount": 25.00,
    "...": "..."
  }
}
```

### Policy Scenarios

#### Scenario 1: Full Refund (FLEXIBLE, >24h before)

```bash
# Booking: 2026-02-20 14:00
# Cancel: 2026-02-18 10:00 (50h before)
POST /api/bookings/abc-123/cancel

# Result:
# - Status: CANCELLED
# - Payment Status: REFUNDED
# - Refund: 100% (€25.00 / €25.00)
```

**Logs:**
```
💰 Refund processed for booking abc-123: 100% (25€) based on FLEXIBLE policy
```

#### Scenario 2: Partial Refund (FLEXIBLE, <24h before)

```bash
# Booking: 2026-02-20 14:00
# Cancel: 2026-02-20 10:00 (4h before)
POST /api/bookings/abc-123/cancel

# Result:
# - Status: CANCELLED
# - Payment Status: REFUNDED
# - Refund: 50% (€12.50 / €25.00)
```

**Logs:**
```
💰 Refund processed for booking abc-123: 50% (12.5€) based on FLEXIBLE policy
```

#### Scenario 3: No Refund (STRICT, <3 days before)

```bash
# Booking: 2026-02-20 14:00
# Cancel: 2026-02-19 10:00 (28h before, <3 days)
POST /api/bookings/abc-123/cancel

# Result:
# - Status: CANCELLED
# - Payment Status: CAPTURED (no refund)
# - Refund: 0% (€0.00 / €25.00)
```

**Logs:**
```
ℹ️  No refund for booking abc-123: STRICT policy, cancelled 28h before start
```

#### Scenario 4: Non-Refundable

```bash
# Booking: 2026-02-20 14:00
# Cancel: Any time
POST /api/bookings/abc-123/cancel

# Result:
# - Status: CANCELLED
# - Payment Status: CAPTURED
# - Refund: 0% (€0.00 / €25.00)
```

**Logs:**
```
ℹ️  No refund for booking abc-123: NON_REFUNDABLE policy, cancelled 50h before start
```

---

## Error Handling

### Cancellation Errors

| Error | Message | Action |
|-------|---------|--------|
| Booking not found | "Booking not found" | Verify booking ID |
| Not authorized | "Booking not found" | Only renter or host can cancel |
| Already cancelled | "This booking cannot be cancelled" | Booking already in final state |
| Already completed | "This booking cannot be cancelled" | Cannot cancel completed bookings |
| Already active | "This booking cannot be cancelled" | Check-in occurred, cannot cancel |

### Refund Errors

If the refund fails, the cancellation still succeeds but the refund must be processed manually:

```typescript
try {
  await this.paymentService.refundBooking(bookingId, refundAmountCents);
  console.log(`💰 Refund processed for booking ${bookingId}: ${refundPercentage}%`);
} catch (error: any) {
  // Log error but don't fail the cancellation
  console.error(`❌ Refund failed for booking ${bookingId}:`, error.message);
  console.error('   Booking is cancelled but refund must be processed manually');
}
```

**Manual Refund Process:**

1. Check Stripe Dashboard for payment intent
2. Issue manual refund via Stripe Dashboard
3. Update booking payment status manually if needed

---

## Webhooks

When a refund is processed, Stripe sends a `charge.refunded` webhook:

**File:** `src/modules/webhooks/webhook.service.ts`

```typescript
async handleChargeRefunded(charge: any): Promise<void> {
  const paymentIntentId = charge.payment_intent;

  // Find booking by payment intent ID
  const booking = await this.prisma.booking.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!booking) return;

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
```

---

## Database Schema

### Cancellation Tracking Fields

```prisma
model Booking {
  id                    String              @id @default(uuid())
  status                BookingStatus       @default(PENDING)
  paymentStatus         PaymentStatus       @default(PENDING)
  cancellationPolicy    CancellationPolicy  // Copied from spot at booking time

  // Cancellation tracking
  cancelledAt           DateTime?
  cancelledBy           String?             // User ID who cancelled
  cancellationReason    String?

  // Payment tracking
  stripePaymentIntentId String?             @unique
  totalPrice            Decimal             @db.Decimal(10, 2)

  // ... other fields
}

enum CancellationPolicy {
  FLEXIBLE
  MODERATE
  STRICT
  NON_REFUNDABLE
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}
```

---

## Testing

### Test 1: Full Refund (FLEXIBLE, >24h)

```bash
# 1. Create booking for tomorrow 14:00
POST /api/bookings
{
  "spotId": "spot-123",
  "vehicleId": "vehicle-456",
  "startTime": "2026-02-13T14:00:00Z",
  "endTime": "2026-02-13T16:00:00Z"
}

# 2. Create and confirm payment
POST /api/payments/bookings/{bookingId}/intent
POST /api/payments/bookings/{bookingId}/confirm

# 3. Cancel booking (>24h before)
POST /api/bookings/{bookingId}/cancel
{ "reason": "Testing full refund" }

# Expected:
# - Booking status: CANCELLED
# - Payment status: REFUNDED
# - Refund amount: 100% of totalPrice
```

**Verification:**
```sql
SELECT
  id,
  status,
  payment_status,
  cancellation_policy,
  total_price,
  cancelled_at,
  cancellation_reason
FROM bookings
WHERE id = 'bookingId';

-- Stripe Dashboard:
-- Check payment_intent has full refund
```

### Test 2: Partial Refund (MODERATE, 24-48h)

```bash
# 1. Create booking for 36h from now
# 2. Confirm payment
# 3. Cancel booking (36h before, MODERATE policy)

# Expected:
# - Refund: 50% of totalPrice
```

### Test 3: No Refund (STRICT, <3 days)

```bash
# 1. Create booking for 2 days from now with STRICT policy
# 2. Confirm payment
# 3. Cancel booking (<3 days)

# Expected:
# - Booking status: CANCELLED
# - Payment status: CAPTURED (no refund)
# - No charge.refunded webhook
```

### Test 4: Idempotency

```bash
# Cancel same booking twice
POST /api/bookings/{bookingId}/cancel
POST /api/bookings/{bookingId}/cancel

# Expected:
# - First call: Success, refund processed
# - Second call: Error "This booking cannot be cancelled" (already cancelled)
# - Only ONE refund in Stripe
```

---

## Host vs Renter Cancellation

Both renters and hosts can cancel bookings. The refund policy applies regardless of who cancels:

### Renter Cancels

```typescript
// Renter cancels their own booking
POST /api/bookings/{bookingId}/cancel
Authorization: Bearer {renterToken}

// Refund processed based on policy
```

### Host Cancels

```typescript
// Host cancels a booking to their spot
POST /api/bookings/{bookingId}/cancel
Authorization: Bearer {hostToken}

// Refund processed based on policy (same as renter cancellation)
```

**Note:** In the future, you may want to differentiate host vs renter cancellations (e.g., host cancellations always get full refund + penalty).

---

## Policy Selection (Host Side)

Hosts select the cancellation policy when listing a spot:

**File:** `src/modules/spots/spot.service.ts`

```typescript
// When creating/updating a spot
{
  "cancellationPolicy": "FLEXIBLE" | "MODERATE" | "STRICT" | "NON_REFUNDABLE"
}
```

The policy is **copied** to the booking at booking time, so changes to the spot's policy don't affect existing bookings.

---

## Monitoring & Analytics

### Check Cancellation Rates

```sql
-- Overall cancellation rate
SELECT
  COUNT(*) FILTER (WHERE status = 'CANCELLED') * 100.0 / COUNT(*) AS cancellation_rate_percent,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled_count,
  COUNT(*) AS total_bookings
FROM bookings;

-- Cancellation rate by policy
SELECT
  cancellation_policy,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') * 100.0 / COUNT(*) AS cancellation_rate
FROM bookings
GROUP BY cancellation_policy;

-- Average refund percentage
SELECT
  cancellation_policy,
  AVG(
    CASE
      WHEN payment_status = 'REFUNDED' THEN 100
      WHEN payment_status = 'PARTIALLY_REFUNDED' THEN 50
      ELSE 0
    END
  ) AS avg_refund_percentage
FROM bookings
WHERE status = 'CANCELLED'
GROUP BY cancellation_policy;
```

### Stripe Dashboard Metrics

1. **Refunds** → Filter by date range
2. Check refund amounts and reasons
3. Monitor partial vs full refunds
4. Track refund disputes

---

## Production Checklist

- [x] Cancellation policy defined in schema
- [x] Refund percentage calculation implemented
- [x] Automatic refund processing in cancel()
- [x] Idempotent refund handling
- [x] Error handling for failed refunds
- [x] Webhook handler for charge.refunded
- [x] Cancellation tracking (who, when, why)
- [x] Policy copied to booking at creation
- [ ] Mobile app UI shows refund policy before booking
- [ ] Mobile app shows expected refund amount on cancel
- [ ] Email notifications for cancellations + refunds
- [ ] Admin dashboard to track cancellation rates
- [ ] Analytics on policy effectiveness

---

## Future Enhancements

### 1. Host Penalty for Cancellations

If a host cancels, charge them a penalty or give renter a full refund + credit:

```typescript
if (cancelledBy === booking.hostId) {
  // Host cancelled - always full refund + penalty
  refundPercentage = 100;
  // TODO: Charge host penalty or give renter credit
}
```

### 2. Grace Period

Allow renters to cancel within X minutes of booking without penalty:

```typescript
const minutesSinceBooking = (cancelledAt - booking.createdAt) / (1000 * 60);
if (minutesSinceBooking <= 30) {
  return 100; // Grace period: full refund
}
```

### 3. Partial Refund for Early Checkout

If renter leaves early, refund unused time:

```typescript
async checkOut(bookingId: string, renterId: string) {
  const now = new Date();
  if (now < booking.endTime) {
    // Left early - calculate partial refund
    const unusedMinutes = (booking.endTime - now) / (1000 * 60);
    const unusedPercentage = (unusedMinutes / booking.duration) * 100;
    // Process partial refund...
  }
}
```

### 4. Dynamic Policies

Allow hosts to set custom refund percentages:

```typescript
{
  "cancellationPolicy": "CUSTOM",
  "customRefundRules": [
    { "hoursBeforeStart": 48, "refundPercentage": 100 },
    { "hoursBeforeStart": 24, "refundPercentage": 75 },
    { "hoursBeforeStart": 0, "refundPercentage": 25 }
  ]
}
```

---

## Related Documentation

- [PAYMENT_SAFETY.md](./PAYMENT_SAFETY.md) - Production payment safety
- [IDEMPOTENCY.md](./IDEMPOTENCY.md) - Idempotent operations
- [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md) - Webhook handlers
- [Stripe Refunds Guide](https://stripe.com/docs/refunds)

---

**Version:** 1.0
**Last Updated:** 2026-02-12
**Author:** Claude Code Agent
**Status:** ✅ Production Ready
