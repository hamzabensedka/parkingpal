import { PrismaClient } from '@prisma/client';
import {
  IPaymentMethodRepository,
  CreatePaymentMethodData,
} from '../interfaces/IPaymentMethodRepository';

/**
 * Prisma implementation of IPaymentMethodRepository
 * Single Responsibility: Database access for PaymentMethod entity (metadata only)
 */
export class PrismaPaymentMethodRepository implements IPaymentMethodRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.paymentMethod.findUnique({ where: { id } });
  }

  async findByUserId(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async create(data: CreatePaymentMethodData) {
    if (data.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: data.userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.paymentMethod.create({
      data: {
        userId: data.userId,
        type: data.type,
        last4: data.last4,
        brand: data.brand ?? undefined,
        expiryMonth: data.expiryMonth ?? undefined,
        expiryYear: data.expiryYear ?? undefined,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async delete(id: string, userId: string) {
    const existing = await this.prisma.paymentMethod.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new Error('PAYMENT_METHOD_NOT_FOUND');
    }
    await this.prisma.paymentMethod.delete({ where: { id } });
  }

  async setDefault(id: string, userId: string) {
    const existing = await this.prisma.paymentMethod.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new Error('PAYMENT_METHOD_NOT_FOUND');
    }
    await this.prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.paymentMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async clearDefaultForUser(userId: string) {
    await this.prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
}
