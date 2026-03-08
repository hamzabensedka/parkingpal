import { BookingStatus, PaymentStatus, CancellationPolicy, VehicleSize } from '@prisma/client';
import type { BookingDTO, BookingSummaryDTO, BookingStatusDTO, PaymentStatusDTO, CancellationPolicyDTO, BookingActionsDTO } from '@parkingpal/shared-types';
import { BookingWithRelations } from '../../interfaces/IBookingRepository';

interface BookingMapperOptions {
  viewerId?: string;  // The user viewing the booking (for calculating actions)
}

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
// Helper: Calculate booking actions
// ==========================================

function calculateBookingActions(
  booking: BookingWithRelations,
  viewerId?: string
): BookingActionsDTO | undefined {
  if (!viewerId) return undefined;

  const now = new Date();
  const isRenter = booking.renterId === viewerId;
  const isHost = booking.hostId === viewerId;
  const status = booking.status;

  // Check-in timing: 30 minutes before start until end time
  const checkInAvailableAt = new Date(booking.startTime.getTime() - 30 * 60 * 1000);
  const checkInExpiresAt = booking.endTime;

  // Can cancel: only pending or confirmed bookings
  const cancellableStatuses: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];
  const canCancel = (isRenter || isHost) && cancellableStatuses.includes(status);

  // Can confirm: host only, pending bookings only
  const canConfirm = isHost && status === BookingStatus.PENDING;

  // Can check-in: renter only, confirmed bookings, within time window, not already checked in
  const canCheckIn = isRenter
    && status === BookingStatus.CONFIRMED
    && !booking.checkInAt
    && now >= checkInAvailableAt
    && now <= checkInExpiresAt;

  // Can check-out: renter only, active bookings (already checked in)
  const canCheckOut = isRenter
    && status === BookingStatus.ACTIVE
    && !!booking.checkInAt;

  // Can complete: after end time, confirmed or active bookings
  const completableStatuses: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.ACTIVE];
  const canComplete = (isRenter || isHost)
    && completableStatuses.includes(status)
    && now > booking.endTime;

  // Can review: after completion (for future use)
  const canReview = status === BookingStatus.COMPLETED;

  return {
    canCancel,
    canConfirm,
    canCheckIn,
    canCheckOut,
    canComplete,
    canReview,
    checkInAvailableAt: checkInAvailableAt.toISOString(),
    checkInExpiresAt: checkInExpiresAt.toISOString(),
  };
}

// ==========================================
// Model -> DTO mappers
// ==========================================

export function toBookingDTO(booking: BookingWithRelations, options?: BookingMapperOptions): BookingDTO {
  const primaryPhoto = booking.spot.photos.find((p) => p.isPrimary) ?? booking.spot.photos[0];
  const actions = calculateBookingActions(booking, options?.viewerId);

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
    checkInAt: booking.checkInAt?.toISOString(),
    checkOutAt: booking.checkOutAt?.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    actions,
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
