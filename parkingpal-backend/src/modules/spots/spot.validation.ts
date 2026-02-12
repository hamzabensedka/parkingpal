import { z } from 'zod';

const spotTypeSchema = z.enum(['driveway', 'garage', 'covered', 'lot', 'underground']);
const locationTypeSchema = z.enum(['residential', 'commercial', 'public']);
const accessTypeSchema = z.enum(['code', 'key', 'smart_lock', 'remote', 'badge', 'open']);
const cancellationPolicySchema = z.enum(['flexible', 'moderate', 'strict', 'non_refundable']);
const vehicleSizeSchema = z.enum(['compact', 'sedan', 'suv', 'van', 'motorcycle']);
const amenitySchema = z.enum([
  'covered', 'lit', 'camera', 'ev_charging', 'gated',
  'handicap', 'elevator', 'wide_entry', 'direct_access', 'security_guard',
]);
const documentTypeSchema = z.enum([
  'property_tax', 'rental_agreement', 'parking_deed', 'management_auth',
  'business_lease', 'utility_bill', 'landlord_permission',
]);

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Must be HH:mm format'),
  endTime: z.string().regex(timeRegex, 'Must be HH:mm format'),
  isAllDay: z.boolean().optional(),
});

export const createSpotSchema = z.object({
  title: z.string().min(15, 'Title must be at least 15 characters').max(50, 'Title must be at most 50 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters').max(2000),
  address: z.string().min(5, 'Address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  postalCode: z.string().min(4, 'Postal code is required').max(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  spotType: spotTypeSchema,
  locationType: locationTypeSchema,
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10, 'Capacity cannot exceed 10').optional().default(1),
  vehicleSizes: z.array(vehicleSizeSchema).min(1, 'At least one vehicle size is required'),
  amenities: z.array(amenitySchema).default([]),
  accessType: accessTypeSchema,
  accessInstructions: z.string().min(10, 'Access instructions must be at least 10 characters').max(500),
  spotLocation: z.string().max(100).optional(),
  hourlyRate: z.number().min(2, 'Minimum hourly rate is 2€').max(20, 'Maximum hourly rate is 20€'),
  dailyRate: z.number().min(5).max(100).optional(),
  weeklyRate: z.number().min(20).max(500).optional(),
  monthlyRate: z.number().min(50).max(2000).optional(),
  houseRules: z.string().max(1000).optional(),
  cancellationPolicy: cancellationPolicySchema,
  instantBook: z.boolean().optional(),
  minBookingMinutes: z.number().int().min(30).max(1440).optional(),
  maxBookingMinutes: z.number().int().min(60).max(43200).optional(),
  advanceNoticeMinutes: z.number().int().min(0).max(10080).optional(),
  bookingWindowDays: z.number().int().min(1).max(365).optional(),
  availability: z.array(availabilitySlotSchema).min(1, 'At least one availability slot is required'),
  // Host agreement checkbox - must explicitly agree to terms
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms of Service and Host Agreement to create a listing' }),
  }),
});

export const updateSpotSchema = z.object({
  title: z.string().min(15).max(50).optional(),
  description: z.string().min(100).max(2000).optional(),
  address: z.string().min(5).max(200).optional(),
  city: z.string().min(2).max(100).optional(),
  postalCode: z.string().min(4).max(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  spotType: spotTypeSchema.optional(),
  locationType: locationTypeSchema.optional(),
  capacity: z.number().int().min(1).max(10).optional(),
  vehicleSizes: z.array(vehicleSizeSchema).min(1).optional(),
  amenities: z.array(amenitySchema).optional(),
  accessType: accessTypeSchema.optional(),
  accessInstructions: z.string().min(10).max(500).optional(),
  spotLocation: z.string().max(100).optional(),
  hourlyRate: z.number().min(2).max(20).optional(),
  dailyRate: z.number().min(5).max(100).optional(),
  weeklyRate: z.number().min(20).max(500).optional(),
  monthlyRate: z.number().min(50).max(2000).optional(),
  houseRules: z.string().max(1000).optional(),
  cancellationPolicy: cancellationPolicySchema.optional(),
  instantBook: z.boolean().optional(),
  minBookingMinutes: z.number().int().min(30).max(1440).optional(),
  maxBookingMinutes: z.number().int().min(60).max(43200).optional(),
  advanceNoticeMinutes: z.number().int().min(0).max(10080).optional(),
  bookingWindowDays: z.number().int().min(1).max(365).optional(),
  availability: z.array(availabilitySlotSchema).min(1).optional(),
});

export const searchSpotsSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.5).max(50).default(5),
  spotType: spotTypeSchema.optional(),
  vehicleSize: vehicleSizeSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  amenities: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',') : val),
    z.array(amenitySchema).optional()
  ),
  instantBook: z.preprocess(
    (val) => (val === 'true' ? true : val === 'false' ? false : val),
    z.boolean().optional()
  ),
});

export const uploadDocumentSchema = z.object({
  type: documentTypeSchema,
});

export type CreateSpotSchemaType = z.infer<typeof createSpotSchema>;
export type UpdateSpotSchemaType = z.infer<typeof updateSpotSchema>;
export type SearchSpotsSchemaType = z.infer<typeof searchSpotsSchema>;
export type UploadDocumentSchemaType = z.infer<typeof uploadDocumentSchema>;
