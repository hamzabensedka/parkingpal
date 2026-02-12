import type {
  PaymentMethodDTO,
  CreatePaymentMethodRequest,
  PaymentIntentDTO,
  ConnectStatusDTO,
  ConnectOnboardingDTO,
} from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Payment method API - list, create, delete, set default (metadata only)
 * Typed with @parkingpal/shared-types
 */
export function createPaymentApi(client: AxiosInstance) {
  return {
    // ==========================================
    // Payment Methods (metadata only)
    // ==========================================

    async list(): Promise<PaymentMethodDTO[]> {
      const { data } = await client.get<ApiResponse<{ paymentMethods: PaymentMethodDTO[] }>>(
        '/api/users/payment-methods'
      );
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to list payment methods');
      }
      return data.data.paymentMethods;
    },

    async create(body: CreatePaymentMethodRequest): Promise<PaymentMethodDTO> {
      const { data } = await client.post<ApiResponse<{ paymentMethod: PaymentMethodDTO }>>(
        '/api/users/payment-methods',
        body
      );
      if (!data.success || !data.data?.paymentMethod) {
        throw new Error(data.error ?? 'Failed to add payment method');
      }
      return data.data.paymentMethod;
    },

    async delete(id: string): Promise<void> {
      const { data } = await client.delete<ApiResponse<null>>(
        `/api/users/payment-methods/${id}`
      );
      if (!data.success) {
        throw new Error(data.error ?? 'Failed to delete payment method');
      }
    },

    async setDefault(id: string): Promise<PaymentMethodDTO> {
      const { data } = await client.post<ApiResponse<{ paymentMethod: PaymentMethodDTO }>>(
        `/api/users/payment-methods/${id}/default`
      );
      if (!data.success || !data.data?.paymentMethod) {
        throw new Error(data.error ?? 'Failed to set default payment method');
      }
      return data.data.paymentMethod;
    },

    // ==========================================
    // Payment Intents (Stripe Integration)
    // ==========================================

    /**
     * Create a payment intent for a booking
     * Returns clientSecret needed by Stripe SDK to confirm payment
     */
    async createPaymentIntent(bookingId: string): Promise<PaymentIntentDTO> {
      const { data } = await client.post<ApiResponse<PaymentIntentDTO>>(
        `/api/payments/bookings/${bookingId}/intent`,
        {},
        { timeout: 15000 }
      );
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to create payment intent');
      }
      return data.data;
    },

    /**
     * Confirm payment was successful after client-side Stripe confirmation
     */
    async confirmPayment(bookingId: string): Promise<void> {
      const { data } = await client.post<ApiResponse<null>>(
        `/api/payments/bookings/${bookingId}/confirm`,
        {},
        { timeout: 15000 }
      );
      if (!data.success) {
        throw new Error(data.error ?? 'Failed to confirm payment');
      }
    },

    // ==========================================
    // Stripe Connect (for Hosts)
    // ==========================================

    /**
     * Start Stripe Connect onboarding for hosts
     * Returns URL to redirect host to Stripe onboarding
     */
    async startConnectOnboarding(): Promise<ConnectOnboardingDTO> {
      const { data } = await client.post<ApiResponse<ConnectOnboardingDTO>>(
        '/api/payments/connect/onboard',
        {},
        { timeout: 15000 }
      );
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to start Stripe onboarding');
      }
      return data.data;
    },

    /**
     * Check Stripe Connect onboarding status
     */
    async checkConnectStatus(): Promise<ConnectStatusDTO> {
      const { data } = await client.get<ApiResponse<ConnectStatusDTO>>(
        '/api/payments/connect/status',
        { timeout: 10000 }
      );
      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to check Connect status');
      }
      return data.data;
    },
  };
}

export type PaymentApi = ReturnType<typeof createPaymentApi>;
