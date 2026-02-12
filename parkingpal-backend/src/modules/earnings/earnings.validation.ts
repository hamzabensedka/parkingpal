import { z } from 'zod';

/**
 * Earnings validation schemas
 */

export const earningsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year', 'all']).optional().default('month'),
});

export const transactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type EarningsQueryParams = z.infer<typeof earningsQuerySchema>;
export type TransactionsQueryParams = z.infer<typeof transactionsQuerySchema>;
