import type {
  PaymentMethodDTO,
  CreatePaymentMethodRequest,
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
  };
}

export type PaymentApi = ReturnType<typeof createPaymentApi>;
