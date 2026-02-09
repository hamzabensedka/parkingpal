import { BookingStatus, PaymentStatus, CancellationPolicy, VehicleSize } from '@prisma/client';
import type { BookingDTO, BookingSummaryDTO, BookingStatusDTO, PaymentStatusDTO, CancellationPolicyDTO } from '@parkingpal/shared-types';
import { BookingWithRelations } from '../../interfaces/IBookingRepository';

// ==========================================
// Prisma -> DTO enum converters
// ==========================================

const PRISMA_TO_DTO_BOOKING_STATUS: Record<BookingStatus, BookingStatusDTO> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

const DTO_TO_PRISMA_BOOKING_STATUS: Record<BookingStatusDTO, BookingStatus> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  active: 'ACTIVE',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  no_show: 'NO_SHOW',
};

const PRISMA_TO_DTO_PAYMENT_STATUS: Record<PaymentStatus, PaymentStatusDTO> = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

const PRISMA_TO_DTO_CANCELLATION: Record<CancellationPolicy, CancellationPolicyDTO> = {
  FLEXIBLE: 'flexible',
  MODERATE: 'moderate',
  STRICT: 'strict',
  NON_REFUNDABLE: 'non_refundable',
};

const PRISMA_TO_DTO_VEHICLE_SIZE: Record<VehicleSize, string> = {
  COMPACT: 'compact',
  SEDAN: 'sedan',
  SUV: 'suv',
  VAN: 'van',
  MOTORCYCLE: 'motorcycle',
};

// ==========================================
// Public converter functions
// ==========================================

export function dtoBookingStatusToPrisma(status: BookingStatusDTO): BookingStatus {
  return DTO_TO_PRISMA_BOOKING_STATUS[status];
}

// ==========================================
// Model -> DTO mappers
// ==========================================

export function toBookingDTO(booking: BookingWithRelations): BookingDTO {
  const primaryPhoto = booking.spot.photos.find((p) => p.isPrimary) ?? booking.spot.photos[0];

  return {
    id: booking.id,
    spot: {
      id: booking.spot.id,
      title: booking.spot.title,
      address: booking.spot.address,
      city: booking.spot.city,
      primaryPhoto: primaryPhoto?.url,
    },
    renter: {
      id: booking.renter.id,
      firstName: booking.renter.firstName,
      lastName: booking.renter.lastName,
      profilePhoto: booking.renter.profilePhoto ?? undefined,
    },
    host: {
      id: booking.host.id,
      firstName: booking.host.firstName,
      lastName: booking.host.lastName,
      profilePhoto: booking.host.profilePhoto ?? undefined,
    },
    vehicle: {
      id: booking.vehicle.id,
      make: booking.vehicle.make,
      model: booking.vehicle.model,
      licensePlate: booking.vehicle.licensePlate,
      color: booking.vehicle.color,
      type: PRISMA_TO_DTO_VEHICLE_SIZE[booking.vehicle.type] ?? 'sedan',
    },
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    status: PRISMA_TO_DTO_BOOKING_STATUS[booking.status],
    totalPrice: booking.totalPrice,
    hourlyRate: booking.hourlyRate,
    duration: booking.duration,
    paymentStatus: PRISMA_TO_DTO_PAYMENT_STATUS[booking.paymentStatus],
    cancellationPolicy: PRISMA_TO_DTO_CANCELLATION[booking.cancellationPolicy],
    cancelledAt: booking.cancelledAt?.toISOString(),
    cancelledBy: booking.cancelledBy ?? undefined,
    cancellationReason: booking.cancellationReason ?? undefined,
    hostNotes: booking.hostNotes ?? undefined,
    renterNotes: booking.renterNotes ?? undefined,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

export function toBookingSummaryDTO(booking: BookingWithRelations): BookingSummaryDTO {
  const primaryPhoto = booking.spot.photos.find((p) => p.isPrimary) ?? booking.spot.photos[0];

  return {
    id: booking.id,
    spotTitle: booking.spot.title,
    spotAddress: booking.spot.address,
    spotCity: booking.spot.city,
    spotPrimaryPhoto: primaryPhoto?.url,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    status: PRISMA_TO_DTO_BOOKING_STATUS[booking.status],
    totalPrice: booking.totalPrice,
    createdAt: booking.createdAt.toISOString(),
  };
}
