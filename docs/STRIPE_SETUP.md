# Stripe Setup Guide for ParkingPal

## Overview

ParkingPal uses **Stripe Connect** to handle marketplace payments between renters and hosts. This guide walks you through complete Stripe setup from scratch.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create Stripe Account](#2-create-stripe-account)
3. [Get API Keys](#3-get-api-keys)
4. [Configure Stripe Connect](#4-configure-stripe-connect)
5. [Set Up Webhooks](#5-set-up-webhooks)
6. [Configure Environment Variables](#6-configure-environment-variables)
7. [Testing with Stripe CLI](#7-testing-with-stripe-cli)
8. [Production Deployment](#8-production-deployment)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

Before you begin, ensure you have:

- [ ] A business email address (for Stripe account)
- [ ] Business information (name, address, tax ID)
- [ ] Bank account details (for receiving payouts)
- [ ] ParkingPal backend running locally

---

## 2. Create Stripe Account

### Step 1: Sign Up

1. Go to: https://dashboard.stripe.com/register
2. Enter your email and create a password
3. Verify your email address

### Step 2: Activate Your Account

1. Log in to: https://dashboard.stripe.com
2. Click **"Activate your account"** banner
3. Complete business profile:
   - Business type (Company, Individual, Non-profit)
   - Business name: **ParkingPal**
   - Industry: **Marketplaces & Platforms**
   - Website: Your domain
   - Business address
   - Tax ID (if applicable)

4. Add bank account for payouts
5. Verify identity (upload documents if required)

**Note:** You can start in **test mode** without full activation, but you'll need to activate for live payments.

---

## 3. Get API Keys

### Test Mode Keys (Development)

1. Ensure you're in **Test mode** (toggle in top-right)
2. Go to: https://dashboard.stripe.com/test/apikeys
3. Copy the following keys:

   | Key Type | Format | Purpose |
   |----------|--------|---------|
   | **Publishable key** | `pk_test_...` | Frontend (mobile app) |
   | **Secret key** | `sk_test_...` | Backend server |

4. Click **"Reveal test key"** to see the secret key
5. Copy `sk_test_...` → This is your `STRIPE_SECRET_KEY`

### Live Mode Keys (Production)

⚠️ **Only use after testing is complete!**

1. Activate your account fully (Step 2)
2. Switch to **Live mode** (toggle in top-right)
3. Go to: https://dashboard.stripe.com/apikeys
4. Copy the **Secret key** (`sk_live_...`)
5. **CRITICAL:** Never commit live keys to git!

---

## 4. Configure Stripe Connect

ParkingPal uses **Connect Express** accounts for hosts to receive payouts.

### Step 1: Enable Connect

1. Go to: https://dashboard.stripe.com/connect/accounts/overview
2. Click **"Get started"** or **"Enable Connect"**
3. Choose account type: **Express** (Recommended for marketplaces)

### Step 2: Configure Connect Settings

1. Go to: https://dashboard.stripe.com/settings/connect
2. **Platform settings:**
   - Platform name: **ParkingPal**
   - Platform logo: Upload your logo
   - Support email: `support@parkingpal.fr`
   - Support phone: Your support number

3. **Branding:**
   - Icon: Upload square icon (128x128px min)
   - Brand color: `#4F46E5` (or your primary color)
   - External account statement descriptor: **PARKINGPAL**

4. **Account requirements:**
   - ✅ Enable card payments
   - ✅ Enable transfers
   - Country: **France** (or your country)

### Step 3: Configure Onboarding Settings

1. Go to: https://dashboard.stripe.com/settings/connect/express
2. **Onboarding settings:**
   - Require business details: ✅
   - Require ID verification: ✅
   - Enable OAuth: ❌ (We use account links)

3. **Return URLs** (will be configured in code):
   - Success URL: `https://your-app.com/stripe/connect/return`
   - Refresh URL: `https://your-app.com/stripe/connect/refresh`

---

## 5. Set Up Webhooks

Webhooks are **CRITICAL** for production. They provide the source of truth for payment status.

### Step 1: Create Webhook Endpoint (Test Mode)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Configure:
   - **Endpoint URL:** `https://your-domain.com/api/webhooks/stripe`
     - For local testing: Use ngrok or Stripe CLI (see below)
   - **Description:** ParkingPal Payment Events

4. **Select events to listen to:**

   Click **"Select events"** and choose:

   #### Payment Events
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`

   #### Refund Events
   - ✅ `charge.refunded`

   #### Transfer Events
   - ✅ `transfer.created`
   - ✅ `transfer.failed`

   #### Connect Events
   - ✅ `account.updated`
   - ✅ `account.application.deauthorized`

5. Click **"Add endpoint"**

### Step 2: Get Webhook Signing Secret

1. Click on your newly created endpoint
2. Click **"Reveal signing secret"**
3. Copy the secret (starts with `whsec_...`)
4. Save as `STRIPE_WEBHOOK_SECRET` environment variable

### Step 3: Repeat for Live Mode (Production)

⚠️ **After testing is complete:**

1. Switch to **Live mode**
2. Go to: https://dashboard.stripe.com/webhooks
3. Add endpoint with same configuration
4. Use your production domain URL
5. Copy the **live** webhook secret

---

## 6. Configure Environment Variables

### Development (.env)

Create/update `parkingpal-backend/.env`:

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Other required vars
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=...
# ... other vars
```

### Production (.env.production or secret manager)

```bash
# Stripe Configuration (Live Mode)
STRIPE_SECRET_KEY=sk_live_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

NODE_ENV=production
# ... other vars
```

⚠️ **NEVER commit .env files to git!**

Add to `.gitignore`:
```
.env
.env.production
.env.local
```

---

## 7. Testing with Stripe CLI

The Stripe CLI lets you test webhooks locally without deploying.

### Step 1: Install Stripe CLI

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Or download from:** https://github.com/stripe/stripe-cli/releases

### Step 2: Login to Stripe CLI

```bash
stripe login
```

This opens your browser for authentication.

### Step 3: Forward Webhooks to Local Server

```bash
# Start your backend server first
cd parkingpal-backend
npm run dev

# In a new terminal, forward webhooks
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

**Expected output:**
```
> Ready! Your webhook signing secret is whsec_abc123... (^C to quit)
```

**Copy the signing secret** and update your `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

### Step 4: Test Webhook Events

**In a third terminal:**

```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test payment failure
stripe trigger payment_intent.payment_failed

# Test refund
stripe trigger charge.refunded

# Test transfer
stripe trigger transfer.created
```

**Expected backend logs:**
```
📥 Received webhook event: payment_intent.succeeded (evt_1234567890)
✅ Payment succeeded for booking abc-123
```

### Step 5: Test Full Payment Flow

1. **Create a test booking** (via mobile app or API)
2. **Create payment intent:**
   ```bash
   curl -X POST http://localhost:5000/api/payments/bookings/{bookingId}/intent \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Use Stripe test cards:**

   | Card Number | Scenario |
   |-------------|----------|
   | `4242 4242 4242 4242` | Success (no 3DS) |
   | `4000 0025 0000 3155` | Success (requires 3DS) |
   | `4000 0000 0000 9995` | Decline (insufficient funds) |
   | `4000 0000 0000 0002` | Decline (card declined) |

   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

4. **Verify webhook received:**
   - Check Stripe CLI output
   - Check backend logs
   - Check database: `SELECT * FROM webhook_events;`

---

## 8. Production Deployment

### Pre-Deployment Checklist

- [ ] Stripe account fully activated
- [ ] Live API keys obtained (`sk_live_...`)
- [ ] Live webhook endpoint created with production URL
- [ ] Live webhook secret saved securely
- [ ] SSL/HTTPS enabled on production domain
- [ ] Environment variables configured in production
- [ ] Test all payment flows in test mode first
- [ ] Review Stripe compliance requirements

### Step 1: Update Environment Variables

Use a **secret manager** (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, etc.):

```bash
# DO NOT hardcode in code or config files!
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
```

### Step 2: Deploy Backend

```bash
# Build
npm run build

# Run production server
NODE_ENV=production npm start
```

### Step 3: Verify Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click your production endpoint
3. Click **"Send test webhook"**
4. Choose `payment_intent.succeeded`
5. Check response status: **200 OK** ✅

### Step 4: Test Live Payments

⚠️ **Use a small amount first!**

1. Create a test booking
2. Use a **real card** (will charge actual money)
3. Verify:
   - Payment intent created
   - Webhook received
   - Booking status updated
   - Funds captured

4. **Immediately refund** the test payment:
   ```bash
   curl -X POST https://api.parkingpal.fr/api/payments/bookings/{bookingId}/refund \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Step 5: Monitor Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Monitor **"Recent events"** tab
3. Check for failed deliveries (red X)
4. Set up alerts for webhook failures

---

## 9. Troubleshooting

### Issue: Webhook Signature Verification Failed

**Symptoms:**
- 400 error on webhook endpoint
- Log: `Webhook signature verification failed`

**Fixes:**
1. Check `STRIPE_WEBHOOK_SECRET` is correct
2. Ensure webhook route uses **raw body** (not JSON-parsed)
3. Verify webhook endpoint URL matches exactly
4. Check SSL certificate is valid (Stripe requires HTTPS in production)

### Issue: Payment Intent Not Found

**Symptoms:**
- Webhook received but booking not found
- Log: `Booking ID not found in metadata`

**Fixes:**
1. Verify payment intent includes `bookingId` in metadata
2. Check booking exists in database
3. Review `createPaymentIntent` code

### Issue: Duplicate Webhook Events

**Symptoms:**
- Same event processed multiple times
- Duplicate booking confirmations

**Fixes:**
1. Check `webhook_events` table for duplicates:
   ```sql
   SELECT stripe_event_id, COUNT(*)
   FROM webhook_events
   GROUP BY stripe_event_id
   HAVING COUNT(*) > 1;
   ```
2. Verify idempotency logic in `webhook.service.ts`
3. Ensure unique index on `stripe_event_id`

### Issue: Webhooks Not Received

**Symptoms:**
- No webhook logs in backend
- Stripe dashboard shows delivery failures

**Fixes:**
1. Verify endpoint URL is accessible from internet (not localhost)
2. Check firewall/security group allows Stripe IPs
3. Verify webhook endpoint responds with 200 status
4. Check rate limits aren't blocking webhooks
5. Use Stripe CLI to test locally first

### Issue: Connect Onboarding Fails

**Symptoms:**
- Hosts can't complete onboarding
- Redirect errors

**Fixes:**
1. Verify return URLs are accessible
2. Check Connect settings in Stripe Dashboard
3. Ensure country code matches (e.g., FR for France)
4. Review Connect account requirements

---

## Test Card Numbers Reference

### Basic Cards

| Card Number | Brand | Scenario |
|-------------|-------|----------|
| `4242 4242 4242 4242` | Visa | Success |
| `5555 5555 5555 4444` | Mastercard | Success |
| `3782 822463 10005` | Amex | Success |
| `4000 0025 0000 3155` | Visa | 3DS required (success) |
| `4000 0000 0000 9995` | Visa | Insufficient funds |
| `4000 0000 0000 0002` | Visa | Card declined |

### 3D Secure 2 (3DS2)

| Card Number | Authentication Result |
|-------------|----------------------|
| `4000 0027 6000 3184` | 3DS required - success |
| `4000 0082 6000 3178` | 3DS required - failure |

**For all test cards:**
- Expiry: Any future date
- CVC: Any 3 digits (4 for Amex)
- ZIP: Any 5 digits

Full list: https://stripe.com/docs/testing

---

## Stripe Dashboard URLs Quick Reference

| Resource | Test Mode | Live Mode |
|----------|-----------|-----------|
| **API Keys** | https://dashboard.stripe.com/test/apikeys | https://dashboard.stripe.com/apikeys |
| **Webhooks** | https://dashboard.stripe.com/test/webhooks | https://dashboard.stripe.com/webhooks |
| **Connect** | https://dashboard.stripe.com/test/connect | https://dashboard.stripe.com/connect |
| **Payments** | https://dashboard.stripe.com/test/payments | https://dashboard.stripe.com/payments |
| **Logs** | https://dashboard.stripe.com/test/logs | https://dashboard.stripe.com/logs |

---

## Security Best Practices

### ✅ DO

- ✅ Store API keys in environment variables
- ✅ Use different keys for test and live modes
- ✅ Rotate keys periodically (every 90 days)
- ✅ Use HTTPS for all webhook endpoints
- ✅ Verify webhook signatures on every request
- ✅ Monitor webhook delivery failures
- ✅ Log all payment operations
- ✅ Use idempotency keys for payment operations

### ❌ DON'T

- ❌ Commit API keys to git
- ❌ Hardcode keys in source code
- ❌ Share keys via email/Slack
- ❌ Use live keys in development
- ❌ Skip webhook signature verification
- ❌ Trust client-side payment confirmations
- ❌ Process webhooks without idempotency

---

## Support & Resources

### Official Documentation
- Stripe Connect Guide: https://stripe.com/docs/connect
- Webhook Guide: https://stripe.com/docs/webhooks
- Testing Guide: https://stripe.com/docs/testing
- API Reference: https://stripe.com/docs/api

### ParkingPal Documentation
- [PAYMENT_SAFETY.md](./PAYMENT_SAFETY.md) - Production safety measures
- [WEBHOOK_IMPLEMENTATION.md](./WEBHOOK_IMPLEMENTATION.md) - Webhook architecture
- [Feature_Audit_Report.md](./Feature_Audit_Report.md) - Implementation status

### Get Help
- Stripe Support: https://support.stripe.com
- Stripe Community: https://github.com/stripe
- ParkingPal Issues: (Your GitHub repo)

---

## Compliance & Legal

### PCI Compliance
- ✅ Stripe is PCI-DSS Level 1 certified
- ✅ ParkingPal never stores card numbers (Stripe handles)
- ✅ Use Stripe Elements/CardField for card input
- ❌ Never log card numbers, CVV, or full PANs

### GDPR Compliance
- Store minimal customer data
- Delete Stripe customer data on account deletion
- Honor data export requests
- Review Stripe's DPA: https://stripe.com/legal/dpa

### Strong Customer Authentication (SCA)
- Required in EU/UK since September 2019
- Stripe handles 3DS2 automatically
- Test with 3DS cards before production

---

**Version:** 1.0
**Last Updated:** 2026-02-12
**Author:** Claude Code Agent
**Status:** ✅ Complete
