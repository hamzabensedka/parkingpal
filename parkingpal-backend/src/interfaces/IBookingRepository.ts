/**
 * Booking Repository Interface
 * Single Responsibility: Database access for Booking entity
 */
import { Booking, BookingStatus, CancellationPolicy, User, Spot, SpotPhoto, Vehicle } from '@prisma/client';

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
}

export interface IBookingRepository {
  create(data: CreateBookingData): Promise<BookingWithRelations>;
  findById(id: string): Promise<BookingWithRelations | null>;
  findByRenterId(renterId: string, status?: BookingStatus): Promise<BookingWithRelations[]>;
  findByHostId(hostId: string, status?: BookingStatus): Promise<BookingWithRelations[]>;
  findBySpotId(spotId: string): Promise<BookingWithRelations[]>;
  updateStatus(id: string, status: BookingStatus, data?: Partial<Pick<Booking, 'cancelledAt' | 'cancelledBy' | 'cancellationReason' | 'hostNotes'>>): Promise<BookingWithRelations>;
  hasOverlap(spotId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<boolean>;
}
