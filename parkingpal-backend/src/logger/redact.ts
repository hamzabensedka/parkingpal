/**
 * Sensitive field redaction utility
 * Prevents accidental logging of secrets, passwords, tokens, and PII
 */

/**
 * Fields that should be redacted in logs (case-insensitive matching)
 */
const SENSITIVE_FIELDS = new Set([
  // Authentication
  'password',
  'newpassword',
  'currentpassword',
  'confirmpassword',
  'oldpassword',

  // Tokens
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'bearertoken',
  'authorization',

  // Payment/Card data
  'cardnumber',
  'card_number',
  'cvv',
  'cvc',
  'securitycode',
  'expiry',
  'expirydate',

  // API keys and secrets
  'secret',
  'apikey',
  'api_key',
  'privatekey',
  'private_key',
  'secretkey',
  'secret_key',
  'stripekey',
  'webhooksecret',
  'clientsecret',
  'client_secret',

  // Other sensitive data
  'ssn',
  'socialsecuritynumber',
  'pin',
]);

const REDACTED = '[REDACTED]';

/**
 * Deep clone and redact sensitive fields from an object
 * Works with nested objects and arrays
 *
 * @param obj - Object to redact (will not be mutated)
 * @returns New object with sensitive fields redacted
 */
export function redact<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redact(item)) as T;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');

    if (SENSITIVE_FIELDS.has(lowerKey)) {
      result[key] = REDACTED;
    } else if (typeof value === 'string') {
      // Check if value looks like a secret
      result[key] = redactString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redact(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Redact a string value if it looks like a secret
 * Detects common patterns: Stripe keys, JWTs, Bearer tokens
 *
 * @param value - String to check and potentially redact
 * @returns Original string or redacted version
 */
export function redactString(value: string): string {
  if (!value || typeof value !== 'string') {
    return value;
  }

  // Stripe secret keys (sk_live_, sk_test_)
  if (/^sk_(live|test)_[A-Za-z0-9]+/.test(value)) {
    return value.substring(0, 8) + '...' + REDACTED;
  }

  // Stripe publishable keys (pk_live_, pk_test_)
  if (/^pk_(live|test)_[A-Za-z0-9]+/.test(value)) {
    return value.substring(0, 8) + '...' + REDACTED;
  }

  // Stripe webhook secrets (whsec_)
  if (value.startsWith('whsec_')) {
    return 'whsec_...' + REDACTED;
  }

  // JWT tokens (base64.base64.base64 format)
  if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value) && value.length > 50) {
    return value.substring(0, 20) + '...' + REDACTED;
  }

  // Bearer token in Authorization header
  if (value.toLowerCase().startsWith('bearer ')) {
    return 'Bearer ...' + REDACTED;
  }

  // Basic auth
  if (value.toLowerCase().startsWith('basic ')) {
    return 'Basic ...' + REDACTED;
  }

  return value;
}

/**
 * Create a redacted copy of request headers
 * Specifically handles Authorization header
 */
export function redactHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    if (lowerKey === 'authorization') {
      result[key] = typeof value === 'string' ? redactString(value) : REDACTED;
    } else if (lowerKey === 'cookie' || lowerKey === 'set-cookie') {
      result[key] = REDACTED;
    } else {
      result[key] = value;
    }
  }

  return result;
}
