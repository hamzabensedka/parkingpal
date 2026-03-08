import { z } from 'zod';

// Admin login validation
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Document verification validation
export const verifyDocumentSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => data.status !== 'REJECTED' || (data.rejectionReason && data.rejectionReason.length > 0),
  { message: 'Rejection reason is required when rejecting a document', path: ['rejectionReason'] }
);

// User ID verification validation
export const verifyUserIdSchema = z.object({
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => data.approved || (data.rejectionReason && data.rejectionReason.length > 0),
  { message: 'Rejection reason is required when rejecting ID', path: ['rejectionReason'] }
);

// Create admin validation
export const createAdminSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['SUPER_ADMIN', 'MODERATOR', 'SUPPORT']),
});

// Update admin role validation
export const updateAdminRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'MODERATOR', 'SUPPORT']),
});

// Suspend user validation
export const suspendUserSchema = z.object({
  reason: z.string().min(10, 'Suspension reason must be at least 10 characters'),
});

// Resolve report validation
export const resolveReportSchema = z.object({
  resolution: z.string().min(10, 'Resolution notes must be at least 10 characters'),
  actionTaken: z.enum(['WARNING', 'SUSPENSION', 'BAN', 'NO_ACTION']),
  suspendUser: z.boolean().optional(),
  suspensionReason: z.string().optional(),
});

// Update entity validation (generic - specific field validation done in service)
export const updateEntitySchema = z.object({
  updates: z.record(z.string(), z.unknown()),
});

// Create user validation
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  userType: z.enum(['RENTER', 'HOST', 'SUPERHOST']).default('RENTER'),
});

// Update user validation
export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  userType: z.enum(['RENTER', 'HOST', 'SUPERHOST']).optional(),
  isActive: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  suspendedReason: z.string().nullable().optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  idVerified: z.boolean().optional(),
});

// Spot status update validation
export const updateSpotStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_VERIFICATION', 'UNDER_REVIEW', 'ACTIVE', 'PAUSED', 'REJECTED', 'DELETED']),
  rejectionReason: z.string().optional(),
});

// Pagination query validation
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  sort: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Entity list query validation
export const entityListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;
export type VerifyUserIdInput = z.infer<typeof verifyUserIdSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminRoleInput = z.infer<typeof updateAdminRoleSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSpotStatusInput = z.infer<typeof updateSpotStatusSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type EntityListQuery = z.infer<typeof entityListQuerySchema>;
