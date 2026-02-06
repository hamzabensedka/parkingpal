import * as yup from 'yup';

// Email validation
export const emailSchema = yup
  .string()
  .email('Please enter a valid email address')
  .required('Email is required');

// Password validation
export const passwordSchema = yup
  .string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .required('Password is required');

// Phone validation (French format)
export const phoneSchema = yup
  .string()
  .matches(
    /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
    'Please enter a valid French phone number'
  )
  .required('Phone number is required');

// Login form schema
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('Password is required'),
});

// Sign up form schema
export const signUpSchema = yup.object({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

// Vehicle form schema
export const vehicleSchema = yup.object({
  make: yup.string().required('Vehicle make is required'),
  model: yup.string().required('Vehicle model is required'),
  licensePlate: yup
    .string()
    .matches(/^[A-Z]{2}-\d{3}-[A-Z]{2}$/, 'Please enter a valid French license plate (XX-000-XX)')
    .required('License plate is required'),
  color: yup.string().required('Vehicle color is required'),
  type: yup.string().oneOf(['compact', 'sedan', 'suv', 'van', 'motorcycle']).required('Vehicle type is required'),
});

// Payment card form schema
export const paymentCardSchema = yup.object({
  cardNumber: yup
    .string()
    .matches(/^\d{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  expiryMonth: yup
    .number()
    .min(1)
    .max(12)
    .required('Expiry month is required'),
  expiryYear: yup
    .number()
    .min(new Date().getFullYear())
    .required('Expiry year is required'),
  cvv: yup
    .string()
    .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
    .required('CVV is required'),
  name: yup.string().required('Name on card is required'),
});

// Bank account schema
export const bankAccountSchema = yup.object({
  iban: yup
    .string()
    .matches(/^FR\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{3}$/, 'Please enter a valid French IBAN')
    .required('IBAN is required'),
  bic: yup
    .string()
    .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Please enter a valid BIC')
    .required('BIC is required'),
  accountHolder: yup.string().required('Account holder name is required'),
});

// Listing form schema
export const listingBasicSchema = yup.object({
  title: yup
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(50, 'Title must be at most 50 characters')
    .required('Title is required'),
  description: yup
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(500, 'Description must be at most 500 characters')
    .required('Description is required'),
});

export const listingPricingSchema = yup.object({
  hourlyRate: yup
    .number()
    .min(2, 'Minimum hourly rate is €2')
    .max(15, 'Maximum hourly rate is €15')
    .required('Hourly rate is required'),
  dailyRate: yup
    .number()
    .min(10, 'Minimum daily rate is €10')
    .max(100, 'Maximum daily rate is €100')
    .optional(),
});

// Review form schema
export const reviewSchema = yup.object({
  rating: yup
    .number()
    .min(1, 'Please select a rating')
    .max(5)
    .required('Rating is required'),
  comment: yup
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review must be at most 500 characters')
    .required('Review comment is required'),
});

// Report issue schema
export const reportIssueSchema = yup.object({
  category: yup
    .string()
    .oneOf(['damage', 'safety', 'fraud', 'other'])
    .required('Please select a category'),
  description: yup
    .string()
    .min(20, 'Description must be at least 20 characters')
    .required('Description is required'),
});

// Helper function to validate a value against a schema
export const validateField = async <T>(
  schema: yup.Schema<T>,
  value: unknown
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    await schema.validate(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'Validation failed' };
  }
};

// Helper function to validate an entire form
export const validateForm = async <T extends object>(
  schema: yup.ObjectSchema<T>,
  values: unknown
): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { form: 'Validation failed' } };
  }
};
