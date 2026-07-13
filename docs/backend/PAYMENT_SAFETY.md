# Payment Safety - Stripe Configuration Enforcement

## Overview

This document describes the production safety measures implemented to prevent silent payment mocking in production environments.

## Problem Statement

**Before:** If Stripe API keys were missing in production, the payment service would silently fall back to mock responses. This could lead to:
- ❌ Bookings appearing "paid" without actual money transfer
- ❌ Revenue loss
- ❌ Silent failures difficult to detect
- ❌ Users believing they've paid when they haven't

## Solution

**After:** Multi-layered validation ensures Stripe must be properly configured in production:

### 1. Environment Validation (Server Startup)
**File:** `src/config/env.ts`

```typescript
// Stripe keys are REQUIRED in production
if (data.NODE_ENV === 'production') {
  if (!data.STRIPE_SECRET_KEY) {
    // ❌ Server fails to start
    ctx.addIssue({ message: 'STRIPE_SECRET_KEY is required in production' });
  }
  if (!data.STRIPE_WEBHOOK_SECRET) {
    // ❌ Server fails to start
    ctx.addIssue({ message: 'STRIPE_WEBHOOK_SECRET is required in production' });
  }
}
```

**Result:** Server **refuses to start** if production mode but Stripe keys are missing.

### 2. Service-Level Validation (Constructor)
**File:** `src/services/stripe-payment.service.ts`

```typescript
constructor(secretKey: string | undefined, isProduction = false) {
  if (!secretKey && isProduction) {
    throw new Error(
      'CRITICAL: Stripe is not configured in production. ' +
      'Payment operations cannot proceed without Stripe configuration.'
    );
  }
}
```

**Result:** Container fails to initialize if production + no key.

### 3. Runtime Validation (Every Operation)
**File:** `src/services/stripe-payment.service.ts`

```typescript
private ensureConfigured(operation: string): void {
  if (!this.stripe) {
    throw new Error(
      `Payment service unavailable: ${operation} requires Stripe configuration.`
    );
  }
}

async createPaymentIntent(...) {
  this.ensureConfigured('Create payment intent'); // ❌ Throws if not configured
  // ... actual Stripe call
}
```

**Result:** Every payment operation throws a **clear error** instead of mocking.

## Behavior by Environment

| Environment | Missing Keys | Behavior |
|-------------|--------------|----------|
| **Production** | ❌ | Server **fails to start** with clear error message |
| **Development** | ⚠️ | Server starts, logs warning, allows mocks for testing |
| **Test** | ⚠️ | Server starts, allows mocks for unit tests |

## Testing the Safety

### Test 1: Production without Stripe keys
```bash
NODE_ENV=production npm start
# Expected: Server fails with error:
# "STRIPE_SECRET_KEY is required in production environment"
```

### Test 2: Development without Stripe keys
```bash
NODE_ENV=development npm start
# Expected: Server starts with warning:
# "⚠️ Stripe not configured. Payments will be mocked (development only)."
```

### Test 3: Production with Stripe keys
```bash
NODE_ENV=production \
STRIPE_SECRET_KEY=sk_live_... \
STRIPE_WEBHOOK_SECRET=whsec_... \
npm start
# Expected: Server starts successfully
```

## Production Deployment Checklist

Before deploying to production, ensure:

- [ ] `NODE_ENV=production` is set
- [ ] `STRIPE_SECRET_KEY=sk_live_...` is set (live key, not test)
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...` is set
- [ ] Keys are stored in secure secret manager (not in code/repo)
- [ ] Server starts without errors
- [ ] Health check passes: `GET /health`

## Error Messages

### If Stripe not configured at startup (production):
```
Invalid environment variables:
  - STRIPE_SECRET_KEY: STRIPE_SECRET_KEY is required in production environment
  - STRIPE_WEBHOOK_SECRET: STRIPE_WEBHOOK_SECRET is required in production environment
```

### If Stripe not configured at runtime (any environment):
```json
{
  "success": false,
  "error": "Payment service unavailable: Create payment intent requires Stripe configuration. Please contact support or configure payment processing."
}
```

## Files Modified

1. **`src/config/env.ts`** - Added production validation for Stripe keys
2. **`src/services/stripe-payment.service.ts`** - Added runtime checks, removed silent mocks
3. **`src/container.ts`** - Pass `isProduction` flag to Stripe service

## Related Security Enhancements

This is part of **P0.1** in the production readiness checklist:
- ✅ P0.1: Disable silent Stripe mocks in production
- ⏳ P0.2: Implement Stripe webhook verification (next)
- ⏳ P0.3: Idempotency for payment actions
- ⏳ P0.4: Payment status source of truth
- ⏳ P0.5: Handle 3DS / SCA failures
- ⏳ P0.6: Refund + cancellation policy flow

---

**Version:** 1.0
**Last Updated:** 2026-02-12
**Author:** Claude Code Agent
