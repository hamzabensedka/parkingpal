import { z } from 'zod';

const paymentMethodTypeSchema = z.enum(['card', 'bank']);

export const createPaymentMethodSchema = z.object({
  type: paymentMethodTypeSchema,
  last4: z.string().length(4, 'Last 4 digits must be exactly 4 characters').regex(/^\d{4}$/, 'Last 4 must be digits'),
  brand: z.string().max(50).optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(2020).max(2100).optional(),
  isDefault: z.boolean().optional(),
});

export type CreatePaymentMethodSchemaType = z.infer<typeof createPaymentMethodSchema>;
