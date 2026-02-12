import { z } from 'zod';

const bookingStatusSchema = z.enum(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show']);
const bookingRoleSchema = z.enum(['renter', 'host']);

export const createBookingSchema = z.object({
  spotId: z.string().uuid('Invalid spot ID'),
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  startTime: z.string().datetime({ message: 'startTime must be a valid ISO 8601 date' }),
  endTime: z.string().datetime({ message: 'endTime must be a valid ISO 8601 date' }),
  renterNotes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  // Renter agreement checkbox - must explicitly agree to terms
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms of Service and Booking Agreement to proceed' }),
  }),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  { message: 'endTime must be after startTime', path: ['endTime'] }
).refine(
  (data) => new Date(data.startTime) > new Date(),
  { message: 'startTime must be in the future', path: ['startTime'] }
);

export const cancelBookingSchema = z.object({
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
});

export const listBookingsSchema = z.object({
  status: bookingStatusSchema.optional(),
  role: bookingRoleSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const checkInSchema = z.object({
  photoUrl: z.string().url('Invalid photo URL').optional(),
});

export type CreateBookingSchemaType = z.infer<typeof createBookingSchema>;
export type CancelBookingSchemaType = z.infer<typeof cancelBookingSchema>;
export type ListBookingsSchemaType = z.infer<typeof listBookingsSchema>;
export type CheckInSchemaType = z.infer<typeof checkInSchema>;
