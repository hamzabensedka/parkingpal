/**
 * Payment Method Request/Response Types
 * Metadata only - NEVER store full card numbers or CVC
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';

/**
 * Payment method type
 */
export type PaymentMethodType = 'card' | 'bank';

/**
 * Payment method DTO (metadata only)
 */
export interface PaymentMethodDTO {
  id: string;
  type: PaymentMethodType;
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

/**
 * Create payment method request (POST /api/users/payment-methods)
 * Only metadata - actual card tokenization happens client-side with payment provider
 */
export interface CreatePaymentMethodRequest {
  type: PaymentMethodType;
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

/**
 * Response for GET /api/users/payment-methods
 */
export type ListPaymentMethodsResponse =
  | ApiSuccessResponse<{ paymentMethods: PaymentMethodDTO[] }>
  | ApiErrorResponse;

/**
 * Response for POST /api/users/payment-methods
 */
export type CreatePaymentMethodResponse =
  | ApiSuccessResponse<{ paymentMethod: PaymentMethodDTO }>
  | ApiErrorResponse;

/**
 * Response for DELETE /api/users/payment-methods/:id
 */
export type DeletePaymentMethodResponse = ApiSuccessResponse<null> | ApiErrorResponse;

/**
 * Response for POST /api/users/payment-methods/:id/default
 */
export type SetDefaultPaymentMethodResponse =
  | ApiSuccessResponse<{ paymentMethod: PaymentMethodDTO }>
  | ApiErrorResponse;
