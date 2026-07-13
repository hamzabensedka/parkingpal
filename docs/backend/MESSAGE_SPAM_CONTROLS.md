# Message Spam Controls

## Overview

ParkingPal implements comprehensive spam prevention for the messaging system to protect users from harassment and abuse. This includes rate limiting, content validation, and spam pattern detection.

## Why Spam Controls?

**Problem:** Without spam controls:
- Users can flood conversations with hundreds of messages
- Bad actors can harass other users
- Spam messages (repeated characters, excessive uppercase, etc.) degrade UX
- System resources are wasted on processing spam

**Solution:** Multi-layered spam prevention with rate limiting and content validation

---

## Implementation Layers

### Layer 1: Rate Limiting

Three levels of rate limiting prevent message spam:

#### 1. Global Message Send Limit (Per User)

**Purpose:** Prevent users from sending excessive messages across all conversations

**Limit:** 60 messages per hour per user

**File:** `src/middleware/rateLimiter.ts`

```typescript
export const messageSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60,
  keyGenerator: getUserOrIpKey, // User ID if authenticated
  message: {
    success: false,
    error: 'Too many messages sent. Please wait before sending more messages.',
  },
});
```

**Applied to:** `POST /api/messages`

**Behavior:**
- Tracks total messages sent by user across all conversations
- Resets every hour
- Returns 429 status code when limit exceeded

---

#### 2. Per-Conversation Message Limit

**Purpose:** Prevent spamming a single conversation

**Limit:** 20 messages per conversation per 10 minutes

**File:** `src/middleware/rateLimiter.ts`

```typescript
export const conversationMessageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  keyGenerator: (req: Request): string => {
    const userId = req.user?.id || 'unknown';
    const conversationId = req.body?.conversationId || 'unknown';
    return `conv:${userId}:${conversationId}`;
  },
  message: {
    success: false,
    error: 'Too many messages in this conversation. Please wait before sending more.',
  },
});
```

**Applied to:** `POST /api/messages`

**Behavior:**
- Tracks messages per user per specific conversation
- Cache key format: `conv:{userId}:{conversationId}`
- Prevents rapid-fire spam in one conversation
- Resets every 10 minutes

---

#### 3. Conversation Creation Limit

**Purpose:** Prevent users from creating excessive conversations

**Limit:** 10 conversations per hour per user

**File:** `src/middleware/rateLimiter.ts`

```typescript
export const conversationCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: getUserOrIpKey,
  message: {
    success: false,
    error: 'Too many conversation creation attempts. Please wait before starting new conversations.',
  },
});
```

**Applied to:** `POST /api/conversations`

**Behavior:**
- Prevents mass conversation creation spam
- Tracks per user
- Resets every hour

---

### Layer 2: Content Validation

Content validation prevents spam patterns in message text.

**File:** `src/modules/messaging/message.validation.ts`

#### Basic Validation

```typescript
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
  text: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (maximum 2000 characters)')
    .refine((text) => text.trim().length >= 1, {
      message: 'Message must contain at least 1 non-whitespace character',
    }),
});
```

**Checks:**
- ✅ Message is not empty
- ✅ Message is ≤ 2000 characters
- ✅ Message contains at least 1 non-whitespace character

---

#### Spam Pattern Detection

The `detectSpamPatterns()` function identifies common spam patterns:

##### 1. Excessive Repeated Characters

**Pattern:** Same character repeated 10+ times consecutively

**Example:** `"aaaaaaaaaaa"`, `"!!!!!!!!!!"`

**Rule:**
```typescript
const repeatedCharsRegex = /(.)\1{9,}/; // Same character 10+ times
if (repeatedCharsRegex.test(text)) {
  return { isSpam: true, reason: 'Message contains excessive repeated characters' };
}
```

**Why:** Legitimate messages rarely have 10+ identical characters in a row.

---

##### 2. Excessive Word Repetition

**Pattern:** Same word repeated 5+ times in a short message

**Example:** `"hello hello hello hello hello"`

**Rule:**
```typescript
const words = trimmed.split(/\s+/);
if (words.length >= 5) {
  const wordCounts = words.reduce((acc, word) => {
    const normalized = word.toLowerCase();
    acc[normalized] = (acc[normalized] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxRepeats = Math.max(...Object.values(wordCounts));
  if (maxRepeats >= 5 && words.length < 20) {
    return { isSpam: true, reason: 'Message contains excessive word repetition' };
  }
}
```

**Why:** Spam often repeats words for emphasis. Legitimate messages vary vocabulary.

**Note:** Only triggers for messages with <20 words total (to allow legitimate repeated words in longer messages).

---

##### 3. Excessive Uppercase

**Pattern:** More than 70% of letters are uppercase

**Example:** `"THIS IS SPAM MESSAGE BUY NOW!!!"`

**Rule:**
```typescript
const letters = text.replace(/[^a-zA-Z]/g, '');
if (letters.length >= 20) {
  const uppercaseCount = text.replace(/[^A-Z]/g, '').length;
  const uppercaseRatio = uppercaseCount / letters.length;
  if (uppercaseRatio > 0.7) {
    return { isSpam: true, reason: 'Message contains excessive uppercase letters' };
  }
}
```

**Why:** Spam messages often use ALL CAPS for attention. Legitimate messages use mixed case.

**Note:** Only triggers for messages with 20+ letters (to allow short acronyms like "OK" or "LOL").

---

##### 4. Excessive Special Characters

**Pattern:** Less than 30% alphanumeric characters (for messages ≥20 chars)

**Example:** `"!@#$%^&*()_+{}|:<>?~!@#$"`

**Rule:**
```typescript
const alphanumeric = text.replace(/[^a-zA-Z0-9\s]/g, '');
const alphanumericRatio = alphanumeric.length / text.length;
if (text.length >= 20 && alphanumericRatio < 0.3) {
  return { isSpam: true, reason: 'Message contains excessive special characters' };
}
```

**Why:** Spam often uses excessive punctuation/symbols. Legitimate messages are mostly words.

**Note:** Allows emojis and punctuation in moderation.

---

## Combined Protection

Messages must pass **all** validation layers:

```
User sends message
    ↓
[1] Global rate limit (60 msg/hour) ✅
    ↓
[2] Per-conversation rate limit (20 msg/10min) ✅
    ↓
[3] Content validation (length, patterns) ✅
    ↓
Message sent successfully
```

If any layer fails, the request is rejected with a 429 (rate limit) or 400 (validation error) status code.

---

## Route Protection

### Message Sending

**Route:** `POST /api/messages`

**Protection Applied:**
```typescript
router.post(
  '/messages',
  authenticate,                    // Must be logged in
  messageSendLimiter,             // 60 messages/hour globally
  conversationMessageLimiter,     // 20 messages/10min per conversation
  validate(sendMessageSchema),    // Content validation + spam detection
  messageController.sendMessage.bind(messageController)
);
```

---

### Conversation Creation

**Route:** `POST /api/conversations`

**Protection Applied:**
```typescript
router.post(
  '/conversations',
  authenticate,                       // Must be logged in
  conversationCreateLimiter,         // 10 conversations/hour
  validate(createConversationSchema), // Booking ID validation
  messageController.createConversation.bind(messageController)
);
```

---

## Error Responses

### Rate Limit Exceeded (429)

**Global Message Limit:**
```json
{
  "success": false,
  "error": "Too many messages sent. Please wait before sending more messages."
}
```

**Per-Conversation Limit:**
```json
{
  "success": false,
  "error": "Too many messages in this conversation. Please wait before sending more."
}
```

**Conversation Creation Limit:**
```json
{
  "success": false,
  "error": "Too many conversation creation attempts. Please wait before starting new conversations."
}
```

**Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1645123456
```

---

### Validation Errors (400)

**Empty Message:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "text",
      "message": "Message cannot be empty"
    }
  ]
}
```

**Message Too Long:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "text",
      "message": "Message too long (maximum 2000 characters)"
    }
  ]
}
```

**Spam Pattern Detected:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "text",
      "message": "Message contains excessive repeated characters"
    }
  ]
}
```

---

## Testing

### Test Rate Limits

**Test global message limit:**
```bash
# Send 61 messages in quick succession
for i in {1..61}; do
  curl -X POST http://localhost:5000/api/messages \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"conversationId\": \"$CONV_ID\", \"text\": \"Message $i\"}"
done

# Expected: First 60 succeed, 61st returns 429
```

**Test per-conversation limit:**
```bash
# Send 21 messages to same conversation in 10 minutes
for i in {1..21}; do
  curl -X POST http://localhost:5000/api/messages \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"conversationId\": \"$CONV_ID\", \"text\": \"Test $i\"}"
done

# Expected: First 20 succeed, 21st returns 429
```

---

### Test Spam Detection

**Test repeated characters:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "'$CONV_ID'", "text": "aaaaaaaaaa"}'

# Expected: 400 error - "Message contains excessive repeated characters"
```

**Test repeated words:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "'$CONV_ID'", "text": "spam spam spam spam spam"}'

# Expected: 400 error - "Message contains excessive word repetition"
```

**Test excessive uppercase:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "'$CONV_ID'", "text": "BUY NOW LIMITED TIME OFFER CLICK HERE!!!"}'

# Expected: 400 error - "Message contains excessive uppercase letters"
```

**Test excessive special characters:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "'$CONV_ID'", "text": "!@#$%^&*()_+{}|:<>?~"}'

# Expected: 400 error - "Message contains excessive special characters"
```

**Test legitimate messages:**
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId": "'$CONV_ID'", "text": "Hi! When can I park at your spot?"}'

# Expected: 200 success
```

---

## Monitoring

### Track Spam Attempts

**Query for rate limit violations:**
```sql
-- Track users hitting rate limits (if logging implemented)
SELECT user_id, COUNT(*) as violations, MAX(created_at) as last_violation
FROM api_request_logs
WHERE status_code = 429 AND endpoint = '/api/messages'
GROUP BY user_id
ORDER BY violations DESC
LIMIT 20;
```

**Query for spam pattern violations:**
```sql
-- Track spam validation errors
SELECT user_id, error_message, COUNT(*) as violations
FROM api_request_logs
WHERE status_code = 400 AND endpoint = '/api/messages'
  AND error_message LIKE '%spam%'
GROUP BY user_id, error_message
ORDER BY violations DESC;
```

---

## Adjusting Limits

### Modify Rate Limits

Edit `src/middleware/rateLimiter.ts`:

```typescript
// For legitimate high-volume users (e.g., customer support)
export const messageSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 120, // Increased from 60
  keyGenerator: getUserOrIpKey,
  // ...
});
```

### Modify Spam Detection Thresholds

Edit `src/modules/messaging/message.validation.ts`:

```typescript
// Make spam detection less strict
const repeatedCharsRegex = /(.)\1{14,}/; // Changed from {9,} to {14,}

// Allow more repeated words
if (maxRepeats >= 8 && words.length < 20) { // Changed from 5 to 8
  return { isSpam: true, reason: '...' };
}
```

---

## Best Practices

### 1. Monitor False Positives

If legitimate users are being flagged as spam:
- Review spam pattern thresholds
- Check rate limit values
- Consider user feedback

### 2. User Warnings

Before blocking, consider warning users:
```typescript
if (violations >= 3) {
  // Send warning notification
}
if (violations >= 5) {
  // Temporarily block
}
```

### 3. Whitelist Verified Users

For verified hosts/superhosts, consider relaxed limits:
```typescript
const limit = req.user?.verified ? 100 : 60;
```

### 4. Log Spam Attempts

Add logging to track patterns:
```typescript
if (isSpam) {
  logger.warn('Spam attempt detected', {
    userId: req.user?.id,
    conversationId: req.body.conversationId,
    reason,
    text: text.substring(0, 100),
  });
}
```

---

## Future Enhancements

### 1. Machine Learning Spam Detection

Train ML model on spam vs legitimate messages:
```typescript
const spamProbability = await mlModel.predict(text);
if (spamProbability > 0.8) {
  return { isSpam: true, reason: 'ML detected spam' };
}
```

### 2. User Reputation System

Track user behavior over time:
```typescript
const reputation = await getUserReputation(userId);
const limit = calculateDynamicLimit(reputation); // Higher rep = higher limit
```

### 3. Profanity/Abuse Detection

Add profanity filter:
```typescript
const containsProfanity = profanityFilter.check(text);
if (containsProfanity) {
  return { isSpam: true, reason: 'Inappropriate content' };
}
```

### 4. Link/URL Detection

Prevent spam links:
```typescript
const urlRegex = /(https?:\/\/[^\s]+)/g;
const urls = text.match(urlRegex) || [];
if (urls.length > 2) {
  return { isSpam: true, reason: 'Excessive links' };
}
```

---

## Summary

### Current Implementation (P1.4 ✅ COMPLETE)

**Rate Limiting:**
- ✅ Global message limit: 60 messages/hour per user
- ✅ Per-conversation limit: 20 messages/10 minutes
- ✅ Conversation creation limit: 10 conversations/hour

**Content Validation:**
- ✅ Message length: 1-2000 characters
- ✅ Non-empty content check
- ✅ Repeated character detection
- ✅ Repeated word detection
- ✅ Excessive uppercase detection
- ✅ Excessive special character detection

**Protection Applied:**
- ✅ `POST /api/messages` - Fully protected
- ✅ `POST /api/conversations` - Rate limited

### Impact

- **Spam Prevention:** Multi-layered protection against message spam
- **User Experience:** Legitimate users unaffected by reasonable limits
- **Resource Protection:** Prevents system resource waste on spam
- **Harassment Prevention:** Limits prevent conversation flooding

---

**Version:** 1.0
**Last Updated:** 2026-02-16
**Author:** Claude Code Agent
**Status:** ✅ **IMPLEMENTED** - Message spam controls active
