# Report & Block User Flow

## Overview

The Safety module provides user reporting and blocking capabilities to maintain a safe platform. Users can:
- Report other users for violations (harassment, spam, fraud, etc.)
- Block users to prevent future interactions
- View their submitted reports and reports against them
- Manage their blocked users list

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│  POST /api/safety/reports     - Submit a report             │
│  GET  /api/safety/reports/submitted - My submitted reports  │
│  GET  /api/safety/reports/against   - Reports against me    │
│  POST /api/safety/blocks      - Block a user                │
│  DELETE /api/safety/blocks/:userId - Unblock a user         │
│  GET  /api/safety/blocks      - My blocked users            │
│  GET  /api/safety/blocks/:userId/status - Check block status│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SafetyController                          │
│  - HTTP request handling                                     │
│  - Response formatting with DTOs                             │
│  - Pagination support                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SafetyService                            │
│  - Business logic validation                                 │
│  - Prevent self-reporting/blocking                           │
│  - Duplicate report detection                                │
│  - User existence verification                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Repository Layer (Prisma)                       │
│  IUserReportRepository  │  IUserBlockRepository             │
│  - CRUD operations      │  - Block/unblock                  │
│  - Pagination           │  - Check relationships            │
│  - Duplicate detection  │  - Bidirectional checks           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  UserReport table  │  UserBlock table                       │
│  - Indexed fields  │  - Unique constraints                  │
│  - Cascade delete  │  - Cascade delete                      │
└─────────────────────────────────────────────────────────────┘
```

## Database Models

### UserReport

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| reporterId | String | User who submitted the report |
| reportedId | String | User being reported |
| reason | ReportReason | Category of the report |
| description | String? | Optional detailed description |
| relatedId | String? | ID of related entity (booking, message, etc.) |
| relatedType | String? | Type of related entity |
| status | ReportStatus | Current status (PENDING, UNDER_REVIEW, RESOLVED, DISMISSED) |
| reviewedBy | String? | Admin who reviewed the report |
| reviewedAt | DateTime? | When the report was reviewed |
| resolution | String? | Resolution notes |
| actionTaken | String? | Action taken by admin |
| createdAt | DateTime | When report was created |
| updatedAt | DateTime | Last update timestamp |

**Unique Constraint:** `[reporterId, reportedId, relatedId]` - Prevents duplicate reports

### UserBlock

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| blockerId | String | User who initiated the block |
| blockedId | String | User being blocked |
| createdAt | DateTime | When block was created |

**Unique Constraint:** `[blockerId, blockedId]` - Prevents duplicate blocks

### Report Reasons

| Reason | Description |
|--------|-------------|
| HARASSMENT | Abusive or threatening behavior |
| SPAM | Unsolicited promotional content |
| INAPPROPRIATE_CONTENT | Offensive or inappropriate material |
| FRAUDULENT_LISTING | Fake or misleading listing |
| NO_SHOW | User didn't show up for booking |
| PROPERTY_DAMAGE | Damage to parking spot/property |
| SAFETY_CONCERN | Safety-related issues |
| PAYMENT_ISSUE | Payment fraud or disputes |
| OTHER | Other violations |

## API Endpoints

### Report Endpoints

#### POST /api/safety/reports
Submit a report against a user.

**Request:**
```json
{
  "reportedId": "uuid",
  "reason": "HARASSMENT",
  "description": "Optional detailed description",
  "relatedId": "uuid",
  "relatedType": "booking"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "report": {
      "id": "uuid",
      "reporterId": "uuid",
      "reportedId": "uuid",
      "reason": "harassment",
      "description": "...",
      "status": "pending",
      "createdAt": "2026-02-16T12:00:00Z",
      "reported": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }
}
```

**Rate Limit:** 10 reports per 24 hours per user

#### GET /api/safety/reports/submitted
Get reports submitted by the current user.

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### GET /api/safety/reports/against
Get reports against the current user.

### Block Endpoints

#### POST /api/safety/blocks
Block a user.

**Request:**
```json
{
  "blockedId": "uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "block": {
      "id": "uuid",
      "blockerId": "uuid",
      "blockedId": "uuid",
      "createdAt": "2026-02-16T12:00:00Z",
      "blocked": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "profilePhoto": "https://..."
      }
    }
  }
}
```

**Rate Limit:** 20 blocks per 24 hours per user

#### DELETE /api/safety/blocks/:userId
Unblock a user.

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

#### GET /api/safety/blocks
Get list of blocked users.

#### GET /api/safety/blocks/:userId/status
Check if a specific user is blocked.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isBlocked": true
  }
}
```

## Block Enforcement Middleware

The `blockEnforcementMiddleware` prevents blocked users from interacting with each other. It checks for bidirectional blocks - if either user has blocked the other, the interaction is prevented.

### Available Middleware

```typescript
// In container.ts
export const blockEnforcementMiddleware = {
  forUserIdInBody,      // Checks req.body.userId
  forUserIdInParams,    // Checks req.params.userId
  forBookingParticipant // Checks req.body.hostId or renterId
};
```

### Usage Example

```typescript
// In routes file
router.post(
  '/some-endpoint',
  authenticate,
  blockEnforcementMiddleware.forUserIdInBody,
  controller.someMethod.bind(controller)
);
```

### Block Enforcement Points

The middleware can be applied to:
1. **Message sending** - Prevent blocked users from messaging each other
2. **Conversation creation** - Prevent starting conversations with blocked users
3. **Review creation** - Optionally prevent reviews between blocked users
4. **Booking creation** - Prevent bookings between blocked users

## Error Handling

| Error Code | Scenario |
|------------|----------|
| 400 Bad Request | Self-reporting/blocking, invalid input |
| 403 Forbidden | Blocked user interaction, unauthorized access |
| 404 Not Found | User/report/block not found |
| 409 Conflict | Duplicate report, already blocked |
| 429 Too Many Requests | Rate limit exceeded |

## Validation Rules

### Create Report
- `reportedId`: Valid UUID, must exist, cannot be self
- `reason`: One of the valid ReportReason values
- `description`: 10-1000 characters (optional)
- `relatedId`: Valid UUID (optional)
- `relatedType`: One of: booking, message, spot, review (required if relatedId provided)

### Block User
- `blockedId`: Valid UUID, must exist, cannot be self

## Testing Scenarios

### Report Flow
1. Submit a valid report → 201 Created
2. Submit duplicate report → 409 Conflict
3. Report yourself → 400 Bad Request
4. Report non-existent user → 404 Not Found
5. Exceed rate limit → 429 Too Many Requests

### Block Flow
1. Block a user → 201 Created
2. Block already blocked user → 409 Conflict
3. Block yourself → 400 Bad Request
4. Unblock a user → 200 OK
5. Unblock not-blocked user → 404 Not Found
6. Check block status → 200 OK with isBlocked boolean

### Block Enforcement
1. Send message to blocked user → 403 Forbidden
2. Start conversation with blocker → 403 Forbidden

## Monitoring Queries

### Report Statistics
```sql
-- Total reports by status
SELECT status, COUNT(*) FROM "UserReport" GROUP BY status;

-- Reports by reason (last 30 days)
SELECT reason, COUNT(*) FROM "UserReport"
WHERE "createdAt" > NOW() - INTERVAL '30 days'
GROUP BY reason ORDER BY COUNT(*) DESC;

-- Users with most reports against them
SELECT "reportedId", COUNT(*) as report_count
FROM "UserReport"
GROUP BY "reportedId"
ORDER BY report_count DESC LIMIT 10;
```

### Block Statistics
```sql
-- Total active blocks
SELECT COUNT(*) FROM "UserBlock";

-- Users who have blocked the most users
SELECT "blockerId", COUNT(*) as block_count
FROM "UserBlock"
GROUP BY "blockerId"
ORDER BY block_count DESC LIMIT 10;
```

## Future Enhancements

1. **Admin Dashboard** - Review and resolve pending reports
2. **Automated Actions** - Auto-suspend users with many reports
3. **Appeal System** - Allow users to appeal decisions
4. **Report Analytics** - Dashboard for report trends
5. **Block Notifications** - Optional notification when blocked
6. **Temporary Blocks** - Time-limited blocks
7. **Content Filtering** - Integration with report system

## Files

| File | Purpose |
|------|---------|
| `src/modules/safety/safety.service.ts` | Business logic |
| `src/modules/safety/safety.controller.ts` | HTTP handlers |
| `src/modules/safety/safety.routes.ts` | Route definitions |
| `src/modules/safety/safety.validation.ts` | Zod schemas |
| `src/modules/safety/safety.mappers.ts` | DTO mappers |
| `src/interfaces/IUserReportRepository.ts` | Report repository interface |
| `src/interfaces/IUserBlockRepository.ts` | Block repository interface |
| `src/repositories/prisma-user-report.repository.ts` | Report repository impl |
| `src/repositories/prisma-user-block.repository.ts` | Block repository impl |
| `src/middleware/blockEnforcement.ts` | Block enforcement middleware |
| `src/middleware/rateLimiter.ts` | Rate limiters (reportLimiter, blockLimiter) |
| `shared-types/src/safety/safety.types.ts` | Shared type definitions |
