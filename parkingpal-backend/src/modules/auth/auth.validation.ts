import { z } from 'zod';
import { AUTH, VALIDATION, USER_TYPES } from '../../config/constants';

// Common validation schemas
const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(VALIDATION.EMAIL_MAX_LENGTH, `Email must be less than ${VALIDATION.EMAIL_MAX_LENGTH} characters`)
  .transform((email) => email.toLowerCase().trim());

const passwordSchema = z
  .string()
  .min(AUTH.PASSWORD_MIN_LENGTH, `Password must be at least ${AUTH.PASSWORD_MIN_LENGTH} characters`)
  .max(AUTH.PASSWORD_MAX_LENGTH, `Password must be less than ${AUTH.PASSWORD_MAX_LENGTH} characters`)
  .refine(
    (password) => AUTH.PASSWORD_REGEX.test(password),
    AUTH.PASSWORD_REQUIREMENTS
  );

const nameSchema = z
  .string()
  .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
  .max(VALIDATION.NAME_MAX_LENGTH, `Name must be less than ${VALIDATION.NAME_MAX_LENGTH} characters`)
  .refine(
    (name) => VALIDATION.NAME_REGEX.test(name),
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .transform((name) => name.trim());

const phoneSchema = z
  .string()
  .refine(
    (phone) => VALIDATION.PHONE_REGEX.test(phone),
    'Invalid phone number format. Use French format: +33 6 12 34 56 78'
  )
  .transform((phone) => {
    // Normalize to +33 format without spaces
    let normalized = phone.replace(/[\s.-]/g, '');
    if (normalized.startsWith('0')) {
      normalized = '+33' + normalized.substring(1);
    } else if (normalized.startsWith('00')) {
      normalized = '+' + normalized.substring(2);
    }
    return normalized;
  })
  .optional();

const userTypeSchema = z
  .enum(USER_TYPES, {
    errorMap: () => ({ message: 'User type must be renter, host, or superhost' }),
  })
  .default('renter');

// Registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  userType: userTypeSchema,
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Logout schema
export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

// Verify email schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  profilePhoto: z.string().url('Invalid photo URL').optional(),
  bio: z.string().max(500).optional().nullable(),
});

// Export types inferred from schemas
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RefreshTokenSchemaType = z.infer<typeof refreshTokenSchema>;
export type LogoutSchemaType = z.infer<typeof logoutSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailSchemaType = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileSchemaType = z.infer<typeof updateProfileSchema>;
