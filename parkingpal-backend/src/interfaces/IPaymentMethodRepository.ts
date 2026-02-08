/**
 * Payment Method Repository Interface
 * Single Responsibility: Database access for PaymentMethod entity (metadata only)
 */
import { PaymentMethod, PaymentMethodType } from '@prisma/client';

export interface IPaymentMethodRepository {
  findById(id: string): Promise<PaymentMethod | null>;
  findByUserId(userId: string): Promise<PaymentMethod[]>;
  create(data: CreatePaymentMethodData): Promise<PaymentMethod>;
  delete(id: string, userId: string): Promise<void>;
  setDefault(id: string, userId: string): Promise<PaymentMethod>;
  clearDefaultForUser(userId: string): Promise<void>;
}

export interface CreatePaymentMethodData {
  userId: string;
  type: PaymentMethodType;
  last4: string;
  brand?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  isDefault?: boolean;
}
