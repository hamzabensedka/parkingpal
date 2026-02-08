import { z } from 'zod';

const vehicleSizeSchema = z.enum(['compact', 'sedan', 'suv', 'van', 'motorcycle']);

export const createVehicleSchema = z.object({
  make: z.string().min(1, 'Make is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  licensePlate: z.string().min(1, 'License plate is required').max(20),
  color: z.string().min(1, 'Color is required').max(50),
  type: vehicleSizeSchema,
  year: z.number().int().min(1900).max(2100).optional(),
  isDefault: z.boolean().optional(),
});

export const updateVehicleSchema = z.object({
  make: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  licensePlate: z.string().min(1).max(20).optional(),
  color: z.string().min(1).max(50).optional(),
  type: vehicleSizeSchema.optional(),
  year: z.number().int().min(1900).max(2100).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export type CreateVehicleSchemaType = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleSchemaType = z.infer<typeof updateVehicleSchema>;
