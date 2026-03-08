/**
 * Booking Repository Interface
 * Single Responsibility: Database access for Booking entity
 */
import { Booking, BookingStatus, CancellationPolicy, PaymentStatus, User, Spot, SpotPhoto, Vehicle } from '@prisma/client';

export type BookingWithRelations = Booking & {
  spot: Spot & { photos: SpotPhoto[] };
  renter: User;
  host: User;
  vehicle: Vehicle;
};

export interface CreateBookingData {
  renterId: string;
  hostId: string;
  spotId: string;
  vehicleId: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  hourlyRate: number;
  duration: number;
  cancellationPolicy: CancellationPolicy;
  status: BookingStatus;
  renterNotes?: string;
  // Renter agreement tracking
  agreedToTermsAt?: Date;
  agreedToTermsIp?: string;
}

export interface UpdatePaymentData {
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  platformFee?: number;
  hostPayout?: number;
  payoutAt?: Date;
  disputeWindowEnds?: Date;
  paymentStatus?: PaymentStatus;
}

export interface CheckInData {
  checkInAt: Date;
  checkInPhoto?: string;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface BookedSlot {
  startTime: Date;
  endTime: Date;
}

export interface IBookingRepository {
  create(data: CreateBookingData): Promise<BookingWithRelations>;
  findById(id: string): Promise<BookingWithRelations | null>;
  findByRenterId(renterId: string, status?: BookingStatus, pagination?: PaginationOptions): Promise<PaginatedResult<BookingWithRelations>>;
  findByHostId(hostId: string, status?: BookingStatus, pagination?: PaginationOptions): Promise<PaginatedResult<BookingWithRelations>>;
  findBySpotId(spotId: string): Promise<BookingWithRelations[]>;
  updateStatus(id: string, status: BookingStatus, data?: Partial<Pick<Booking, 'cancelledAt' | 'cancelledBy' | 'cancellationReason' | 'hostNotes'>>): Promise<BookingWithRelations>;
  updatePayment(id: string, data: UpdatePaymentData): Promise<BookingWithRelations>;
  checkIn(id: string, data: CheckInData): Promise<BookingWithRelations>;
  checkOut(id: string): Promise<BookingWithRelations>;
  hasOverlap(spotId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<boolean>;
  findCompletedAwaitingPayout(): Promise<BookingWithRelations[]>;
  // Get booked time slots for a spot within a date range (for availability calendar)
  getBookedSlots(spotId: string, startDate: Date, endDate: Date): Promise<BookedSlot[]>;
}
