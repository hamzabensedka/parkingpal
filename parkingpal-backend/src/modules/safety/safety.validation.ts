import { z } from 'zod';

/**
 * Valid report reasons (matches Prisma ReportReason enum)
 */
const reportReasons = [
  'HARASSMENT',
  'SPAM',
  'INAPPROPRIATE_CONTENT',
  'FRAUDULENT_LISTING',
  'NO_SHOW',
  'PROPERTY_DAMAGE',
  'SAFETY_CONCERN',
  'PAYMENT_ISSUE',
  'OTHER',
] as const;

/**
 * Valid related entity types for reports
 */
const relatedTypes = ['booking', 'message', 'spot', 'review'] as const;

/**
 * Validation schema for creating a report
 */
export const createReportSchema = z.object({
  reportedId: z.string().uuid('Invalid user ID format'),
  reason: z.enum(reportReasons, {
    errorMap: () => ({ message: 'Invalid report reason' }),
  }),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  relatedId: z.string().uuid('Invalid related entity ID format').optional(),
  relatedType: z.enum(relatedTypes, {
    errorMap: () => ({ message: 'Invalid related type' }),
  }).optional(),
}).refine(
  (data) => {
    // If relatedId is provided, relatedType must also be provided
    if (data.relatedId && !data.relatedType) {
      return false;
    }
    // If relatedType is provided, relatedId must also be provided
    if (data.relatedType && !data.relatedId) {
      return false;
    }
    return true;
  },
  {
    message: 'Both relatedId and relatedType must be provided together',
    path: ['relatedType'],
  }
);

/**
 * Validation schema for blocking a user
 */
export const blockUserSchema = z.object({
  blockedId: z.string().uuid('Invalid user ID format'),
});

/**
 * Validation schema for list query parameters
 */
export const safetyListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * Validation schema for unblock path parameter
 */
export const unblockUserParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

/**
 * Validation schema for checking block status
 */
export const checkBlockStatusSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

// Type exports for use in controllers
export type CreateReportInput = z.infer<typeof createReportSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
export type SafetyListQueryInput = z.infer<typeof safetyListQuerySchema>;
export type UnblockUserParamInput = z.infer<typeof unblockUserParamSchema>;
export type CheckBlockStatusInput = z.infer<typeof checkBlockStatusSchema>;
