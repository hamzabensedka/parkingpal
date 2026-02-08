import { PaymentMethod } from '@prisma/client';
import type { PaymentMethodDTO, PaymentMethodType as SharedPaymentMethodType } from '@parkingpal/shared-types';

const PRISMA_TO_DTO_TYPE: Record<string, SharedPaymentMethodType> = {
  CARD: 'card',
  BANK: 'bank',
};

export function toPaymentMethodDTO(p: PaymentMethod): PaymentMethodDTO {
  return {
    id: p.id,
    type: PRISMA_TO_DTO_TYPE[p.type] ?? 'card',
    last4: p.last4,
    brand: p.brand ?? undefined,
    expiryMonth: p.expiryMonth ?? undefined,
    expiryYear: p.expiryYear ?? undefined,
    isDefault: p.isDefault,
  };
}

export function dtoTypeToPrisma(type: SharedPaymentMethodType): 'CARD' | 'BANK' {
  return type === 'bank' ? 'BANK' : 'CARD';
}
