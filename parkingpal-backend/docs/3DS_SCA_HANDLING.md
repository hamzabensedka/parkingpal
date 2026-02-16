# 3D Secure (3DS) & Strong Customer Authentication (SCA) Handling

## Overview

This document describes how ParkingPal handles 3D Secure (3DS) authentication and Strong Customer Authentication (SCA) requirements for payment processing.

## What is 3DS / SCA?

### 3D Secure (3DS)
An additional layer of security for online card payments where the cardholder must authenticate with their bank (e.g., SMS code, biometric, bank app).

### Strong Customer Authentication (SCA)
EU regulation (PSD2) requiring two-factor authentication for online payments. 3DS2 is the primary method to comply with SCA.

**Required in:** EU, UK, and expanding globally

---

## Payment Intent Lifecycle

### Status Flow with 3DS

```
CREATE PAYMENT INTENT
       │
       ▼
┌──────────────────────────┐
│ requires_payment_method  │  Initial state
└──────────────────────────┘
       │
       │ (Client attaches payment method)
       ▼
┌──────────────────────────┐
│ requires_confirmation    │  Payment method attached
└──────────────────────────┘
       │
       │ (Client confirms payment)
       ▼
       ├─────────────┬─────────────┐
       │             │             │
       ▼             ▼             ▼
┌────────────┐ ┌──────────┐ ┌──────────────┐
│ No 3DS     │ │ 3DS      │ │ Processing   │
│ required   │ │ required │ │ (bank delay) │
└────────────┘ └──────────┘ └──────────────┘
       │             │             │
       │             ▼             │
       │      ┌──────────────────┐ │
       │      │ requires_action  │ │
       │      └──────────────────┘ │
       │             │             │
       │  (User completes 3DS)     │
       │             │             │
       ├─────────────┼─────────────┘
       │             │
       ▼             ▼
┌──────────────────────────┐
│ requires_capture         │  Auth successful (manual capture)
└──────────────────────────┘  OR
       │                    ┌──────────────────────────┐
       │                    │ succeeded                │  Auto-captured
       │                    └──────────────────────────┘
       ▼
┌──────────────────────────┐
│ succeeded                │  Payment complete
└──────────────────────────┘
```

### Failure Paths

```
requires_action (3DS)
       │
       │ (User cancels / timeout)
       ▼
┌──────────────────────────┐
│ canceled                 │  Payment abandoned
└──────────────────────────┘

       OR

       │ (Authentication fails)
       ▼
┌──────────────────────────┐
│ payment_failed           │  3DS authentication failed
└──────────────────────────┘
```

---

## Implementation

### Backend: Payment Status Handling

**File:** `src/modules/payments/payment.service.ts`

```typescript
async confirmPayment(renterId: string, bookingId: string): Promise<void> {
  // Get payment status from Stripe
  const status = await this.stripeService.getPaymentIntentStatus(
    booking.stripePaymentIntentId
  );

  // Handle different statuses
  switch (status) {
    case 'requires_capture':
      // Auth successful, capture the payment
      await this.stripeService.capturePayment(paymentIntentId, idempotencyKey);
      break;

    case 'succeeded':
      // Already captured
      break;

    case 'requires_action':
    case 'requires_source_action':
      // 3DS REQUIRED - Return clear message
      throw ApiError.badRequest(
        'Payment requires additional authentication (3D Secure). ' +
        'Please complete the authentication in your payment app and try again.'
      );

    case 'requires_payment_method':
      throw ApiError.badRequest(
        'Payment method failed. Please try a different card or payment method.'
      );

    case 'requires_confirmation':
      throw ApiError.badRequest(
        'Payment needs to be confirmed. Please complete the payment in your app.'
      );

    case 'processing':
      throw ApiError.badRequest(
        'Payment is still processing. Please wait a moment and try again.'
      );

    case 'canceled':
      throw ApiError.badRequest(
        'This payment was canceled. Please create a new payment to complete your booking.'
      );

    default:
      throw ApiError.badRequest(
        `Payment not successful. Status: ${status}. Please try again or contact support.`
      );
  }
}
```

### Backend: Webhook Event Handlers

**File:** `src/modules/webhooks/webhook.service.ts`

#### 1. Payment Failed (Including 3DS Failures)

```typescript
async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
  // Extract failure details
  const failureCode = paymentIntent.last_payment_error?.code;
  const failureMessage = paymentIntent.last_payment_error?.message;
  const declineCode = paymentIntent.last_payment_error?.decline_code;

  // Identify 3DS failures
  let failureReason = 'Unknown';
  if (failureCode === 'authentication_required') {
    failureReason = '3DS authentication failed or was canceled by user';
  } else if (failureCode === 'card_declined') {
    failureReason = `Card declined${declineCode ? ` (${declineCode})` : ''}`;
  }

  // Update booking status
  await this.bookingRepository.updatePayment(bookingId, {
    paymentStatus: PaymentStatus.FAILED,
  });

  console.log(`❌ Payment failed for booking ${bookingId}: ${failureReason}`);
}
```

#### 2. Payment Canceled (3DS Timeout/Abandonment)

```typescript
async handlePaymentIntentCanceled(paymentIntent: any): Promise<void> {
  // Update booking if payment is still pending
  if (booking.paymentStatus === PaymentStatus.PENDING) {
    await this.bookingRepository.updatePayment(bookingId, {
      paymentStatus: PaymentStatus.FAILED,
    });

    console.log(`🚫 Payment canceled for booking ${bookingId} (3DS timeout or user abandonment)`);
  }
}
```

**Registered events:**
- `payment_intent.payment_failed` → Authentication failures
- `payment_intent.canceled` → Timeouts, user abandonment

---

## Frontend Integration (Mobile App)

### Using Stripe React Native SDK

**File:** `mobile/src/screens/PaymentReviewScreen.tsx`

```typescript
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';

const PaymentReviewScreen = () => {
  const { confirmPayment, loading } = useConfirmPayment();

  const handlePayment = async () => {
    try {
      // Step 1: Create payment intent on backend
      const { clientSecret } = await paymentApi.createPaymentIntent(bookingId);

      // Step 2: Confirm payment with Stripe (handles 3DS automatically)
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        // Handle 3DS errors
        if (error.code === 'Canceled') {
          Alert.alert('Payment Canceled', 'You canceled the 3D Secure authentication.');
        } else if (error.message?.includes('authentication')) {
          Alert.alert('Authentication Failed', '3D Secure authentication failed. Please try again.');
        } else {
          Alert.alert('Payment Failed', error.message);
        }
        return;
      }

      // Step 3: Verify payment status on backend
      if (paymentIntent.status === 'RequiresAction') {
        // This shouldn't happen after confirmPayment, but handle gracefully
        Alert.alert('Action Required', 'Please complete the authentication and try again.');
        return;
      }

      // Step 4: Confirm payment with backend
      await paymentApi.confirmPayment(bookingId);

      // Success!
      navigation.navigate('BookingConfirmation', { bookingId });

    } catch (error) {
      // Backend returned error
      if (error.response?.data?.error?.includes('requires additional authentication')) {
        Alert.alert(
          'Authentication Required',
          'This payment requires 3D Secure authentication. Please try again and complete the authentication process.'
        );
      } else {
        Alert.alert('Payment Error', error.response?.data?.error || 'Something went wrong');
      }
    }
  };

  return (
    <View>
      <CardField
        postalCodeEnabled={true}
        cardStyle={{ backgroundColor: '#FFFFFF' }}
        style={{ width: '100%', height: 50 }}
      />
      <Button title="Pay Now" onPress={handlePayment} loading={loading} />
    </View>
  );
};
```

### 3DS Flow

1. **User enters card details** → CardField captures card info
2. **User taps "Pay Now"** → `confirmPayment()` is called
3. **Stripe determines if 3DS required:**
   - If YES → Opens 3DS authentication modal (bank app/SMS/biometric)
   - If NO → Proceeds directly to payment
4. **User completes 3DS** → Stripe SDK handles the authentication
5. **Payment succeeds or fails** → App receives result
6. **Backend confirmation** → Final verification with server

---

## Testing 3DS

### Test Cards (Stripe Test Mode)

| Card Number | 3DS Behavior | Expected Result |
|-------------|--------------|-----------------|
| `4242 4242 4242 4242` | No 3DS | Succeeds immediately |
| `4000 0025 0000 3155` | 3DS required - **Success** | Opens 3DS modal → Succeeds |
| `4000 0082 6000 3178` | 3DS required - **Failure** | Opens 3DS modal → Fails authentication |
| `4000 0000 0000 3220` | 3DS required - **Timeout** | 3DS times out → Payment canceled |

**Expiry:** Any future date (e.g., `12/34`)
**CVC:** Any 3 digits (e.g., `123`)
**ZIP:** Any 5 digits (e.g., `12345`)

### Test Scenarios

#### Scenario 1: Successful 3DS

```bash
# 1. Create payment intent
POST /api/payments/bookings/{bookingId}/intent
→ 200 OK { clientSecret: "pi_..._secret_..." }

# 2. Mobile app calls confirmPayment with 3DS test card (4000 0025 0000 3155)
# → Stripe SDK opens 3DS modal
# → User completes authentication
# → SDK returns success

# 3. Confirm payment with backend
POST /api/payments/bookings/{bookingId}/confirm
→ 200 OK (payment captured)
```

**Webhook received:**
```
payment_intent.succeeded → Booking confirmed
```

#### Scenario 2: 3DS Authentication Failure

```bash
# 1. Create payment intent
POST /api/payments/bookings/{bookingId}/intent
→ 200 OK { clientSecret: "..." }

# 2. Mobile app calls confirmPayment with failing 3DS card (4000 0082 6000 3178)
# → Stripe SDK opens 3DS modal
# → Authentication fails
# → SDK returns error: "We are unable to authenticate your payment method."

# 3. User sees error in app
```

**Webhook received:**
```
payment_intent.payment_failed
→ last_payment_error.code: "authentication_required"
→ Booking payment status → FAILED
```

#### Scenario 3: User Cancels 3DS

```bash
# 1. Create payment intent
# 2. User opens 3DS modal, then cancels/closes it

# Mobile app receives:
{ error: { code: "Canceled", message: "The payment was canceled" } }
```

**Webhook received:**
```
payment_intent.canceled → Booking payment status → FAILED
```

#### Scenario 4: 3DS Timeout

```bash
# 1. Create payment intent with timeout card (4000 0000 0000 3220)
# 2. 3DS modal opens
# 3. User doesn't complete within timeout window (usually 5-10 minutes)
```

**Webhook received:**
```
payment_intent.canceled → Booking payment status → FAILED
```

---

## Error Messages

### User-Facing Error Messages

| Status/Error | User Message | Action |
|--------------|--------------|--------|
| `requires_action` | "Payment requires additional authentication (3D Secure). Please complete the authentication in your payment app and try again." | Retry payment, complete 3DS |
| `requires_payment_method` | "Payment method failed. Please try a different card or payment method." | Use different card |
| `authentication_required` | "3D Secure authentication failed. Please try again or use a different card." | Retry or change card |
| User cancels 3DS | "You canceled the 3D Secure authentication. Please try again to complete your booking." | Retry payment |
| `processing` | "Payment is still processing. Please wait a moment and try again." | Wait and retry |
| `canceled` | "This payment was canceled. Please create a new payment to complete your booking." | Start new payment |

---

## Monitoring & Debugging

### Check 3DS Completion Rates

```sql
-- Total payment intents created
SELECT COUNT(*) FROM bookings WHERE stripe_payment_intent_id IS NOT NULL;

-- Successful payments
SELECT COUNT(*) FROM bookings WHERE payment_status = 'CAPTURED';

-- Failed payments
SELECT COUNT(*) FROM bookings WHERE payment_status = 'FAILED';

-- 3DS failure rate (approximate - based on webhook events)
SELECT
  event_type,
  COUNT(*),
  COUNT(*) FILTER (WHERE raw_data->>'last_payment_error'->>'code' = 'authentication_required') AS auth_failures
FROM webhook_events
WHERE event_type = 'payment_intent.payment_failed'
GROUP BY event_type;
```

### Stripe Dashboard

1. **Payments** → Filter by "Failed"
2. Check **"Failure reason"** column
3. Look for:
   - "Authentication required"
   - "3DS authentication failed"
   - "Customer canceled"

### Logs

```
# Successful 3DS
✅ Payment succeeded for booking abc-123

# 3DS failure
❌ Payment failed for booking abc-123: 3DS authentication failed or was canceled by user

# 3DS timeout
🚫 Payment canceled for booking abc-123 (3DS timeout or user abandonment)
```

---

## Best Practices

### ✅ DO

- **Use Stripe SDK for 3DS** - Handles authentication modal automatically
- **Show clear loading states** - 3DS can take 30-60 seconds
- **Provide retry option** - Allow users to try again after failure
- **Log failure reasons** - Track why payments fail (3DS vs card decline)
- **Test with all test cards** - Cover success, failure, timeout scenarios
- **Handle cancellations gracefully** - User should be able to go back and try again

### ❌ DON'T

- ❌ Assume payment succeeded after `confirmPayment()` - Always verify on backend
- ❌ Skip 3DS testing - It's required in EU and will cause production failures
- ❌ Show generic error messages - Be specific about what went wrong
- ❌ Auto-retry failed 3DS - User needs to complete authentication manually
- ❌ Ignore `payment_intent.canceled` webhook - This indicates abandoned payments

---

## SCA Exemptions

Certain transactions may be exempt from SCA (not require 3DS):

| Exemption | Criteria |
|-----------|----------|
| **Low-value** | Transaction under €30 EUR |
| **Recurring** | Subsequent subscription payments (after first payment) |
| **Trusted beneficiary** | User whitelisted merchant with their bank |
| **Corporate card** | B2B virtual cards |

**Note:** Stripe automatically applies exemptions when possible. Backend handles all statuses, so no code changes needed.

---

## Troubleshooting

### Issue: 3DS Modal Never Opens

**Cause:** Stripe SDK not properly initialized or test card not recognized

**Fix:**
1. Verify Stripe publishable key is correct
2. Use exact test card number: `4000 0025 0000 3155`
3. Check `@stripe/stripe-react-native` version is up to date

### Issue: Payment Succeeds in Test but Fails in Production

**Cause:** Live cards have stricter 3DS requirements

**Fix:**
- Ensure user completes full 3DS flow (don't skip)
- Check bank isn't blocking international transactions
- Verify card supports 3DS (very old cards may not)

### Issue: Payment Stuck in "Processing"

**Cause:** Bank transfer or delayed 3DS

**Fix:**
- Wait 1-2 minutes
- Check payment status with `getPaymentIntentStatus()`
- Webhook will eventually fire with final status

---

## Related Documentation

- [PAYMENT_SAFETY.md](./PAYMENT_SAFETY.md) - Production safety
- [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md) - Webhook architecture
- [IDEMPOTENCY.md](./IDEMPOTENCY.md) - Safe retries
- [Stripe 3DS Guide](https://stripe.com/docs/payments/3d-secure)

---

**Version:** 1.0
**Last Updated:** 2026-02-12
**Author:** Claude Code Agent
**Status:** ✅ Production Ready
