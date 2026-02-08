import {
  IPaymentMethodRepository,
  CreatePaymentMethodData,
} from '../../interfaces/IPaymentMethodRepository';
import type { CreatePaymentMethodRequest } from '@parkingpal/shared-types';
import { ApiError } from '../../middleware/errorHandler';
import { toPaymentMethodDTO, dtoTypeToPrisma } from './payment-method.mappers';

/**
 * Payment Method Service
 * Single Responsibility: Business logic for payment method metadata (no PAN/CVC)
 * Depends on IPaymentMethodRepository (DIP)
 */
export class PaymentMethodService {
  constructor(private readonly paymentMethodRepository: IPaymentMethodRepository) {}

  async listByUserId(userId: string) {
    const methods = await this.paymentMethodRepository.findByUserId(userId);
    return methods.map(toPaymentMethodDTO);
  }

  async create(userId: string, body: CreatePaymentMethodRequest) {
    const data: CreatePaymentMethodData = {
      userId,
      type: dtoTypeToPrisma(body.type),
      last4: body.last4,
      brand: body.brand ?? null,
      expiryMonth: body.expiryMonth ?? null,
      expiryYear: body.expiryYear ?? null,
      isDefault: body.isDefault,
    };
    const method = await this.paymentMethodRepository.create(data);
    return toPaymentMethodDTO(method);
  }

  async delete(userId: string, methodId: string) {
    try {
      await this.paymentMethodRepository.delete(methodId, userId);
    } catch (e) {
      if (e instanceof Error && e.message === 'PAYMENT_METHOD_NOT_FOUND') {
        throw ApiError.notFound('Payment method not found');
      }
      throw e;
    }
  }

  async setDefault(userId: string, methodId: string) {
    try {
      const method = await this.paymentMethodRepository.setDefault(methodId, userId);
      return toPaymentMethodDTO(method);
    } catch (e) {
      if (e instanceof Error && e.message === 'PAYMENT_METHOD_NOT_FOUND') {
        throw ApiError.notFound('Payment method not found');
      }
      throw e;
    }
  }
}
