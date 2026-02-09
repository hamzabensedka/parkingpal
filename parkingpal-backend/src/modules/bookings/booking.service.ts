import { BookingStatus, SpotStatus } from '@prisma/client';
import type { CreateBookingRequest } from '@parkingpal/shared-types';
import { IBookingRepository, CreateBookingData } from '../../interfaces/IBookingRepository';
import { ISpotRepository } from '../../interfaces/ISpotRepository';
import { IVehicleRepository } from '../../interfaces/IVehicleRepository';
import { ApiError } from '../../middleware/errorHandler';
import { toBookingDTO, toBookingSummaryDTO, dtoBookingStatusToPrisma } from './booking.mappers';
import type { BookingStatusDTO } from '@parkingpal/shared-types';

/**
 * Booking Service
 * Single Responsibility: Business logic for booking operations
 * Depends on IBookingRepository, ISpotRepository, IVehicleRepository (DIP)
 */
export class BookingService {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly spotRepository: ISpotRepository,
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async create(renterId: string, body: CreateBookingRequest) {
    const { spotId, vehicleId, startTime: startTimeStr, endTime: endTimeStr, renterNotes } = body;
    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    // 1. Fetch spot and validate it's active
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || spot.status !== SpotStatus.ACTIVE) {
      throw ApiError.notFound('Spot not found or not available');
    }

    // 2. Can't book your own spot
    if (spot.hostId === renterId) {
      throw ApiError.badRequest('You cannot book your own spot');
    }

    // 3. Fetch vehicle and verify it belongs to the renter
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    if (!vehicle || vehicle.userId !== renterId) {
      throw ApiError.notFound('Vehicle not found');
    }

    // 4. Check vehicle size fits the spot
    if (!spot.vehicleSizes.includes(vehicle.type)) {
      throw ApiError.badRequest('Your vehicle size is not accepted at this spot');
    }

    // 5. Calculate duration in minutes
    const durationMs = endTime.getTime() - startTime.getTime();
    const duration = Math.round(durationMs / (1000 * 60));

    // 6. Validate against min/max booking duration
    if (duration < spot.minBookingMinutes) {
      throw ApiError.badRequest(`Minimum booking duration is ${spot.minBookingMinutes} minutes`);
    }
    if (spot.maxBookingMinutes && duration > spot.maxBookingMinutes) {
      throw ApiError.badRequest(`Maximum booking duration is ${spot.maxBookingMinutes} minutes`);
    }

    // 7. Validate advance notice
    const now = new Date();
    const minStartTime = new Date(now.getTime() + spot.advanceNoticeMinutes * 60 * 1000);
    if (startTime < minStartTime) {
      throw ApiError.badRequest(`Booking requires at least ${spot.advanceNoticeMinutes} minutes advance notice`);
    }

    // 8. Validate booking window
    const maxStartTime = new Date(now.getTime() + spot.bookingWindowDays * 24 * 60 * 60 * 1000);
    if (startTime > maxStartTime) {
      throw ApiError.badRequest(`Bookings can only be made up to ${spot.bookingWindowDays} days in advance`);
    }

    // 9. Check day-of-week availability
    if (spot.availability.length > 0) {
      const bookingDay = startTime.getDay(); // 0 = Sunday
      const daySlots = spot.availability.filter((a) => a.dayOfWeek === bookingDay);
      if (daySlots.length === 0) {
        throw ApiError.badRequest('The spot is not available on the selected day');
      }

      // Check if booking time falls within any availability slot
      const bookingStartMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const bookingEndMinutes = endTime.getHours() * 60 + endTime.getMinutes();

      const fitsSlot = daySlots.some((slot) => {
        if (slot.isAllDay) return true;
        const [slotStartH, slotStartM] = slot.startTime.split(':').map(Number);
        const [slotEndH, slotEndM] = slot.endTime.split(':').map(Number);
        const slotStart = slotStartH * 60 + slotStartM;
        const slotEnd = slotEndH * 60 + slotEndM;
        return bookingStartMinutes >= slotStart && bookingEndMinutes <= slotEnd;
      });

      if (!fitsSlot) {
        throw ApiError.badRequest('The booking time does not fall within the spot availability hours');
      }
    }

    // 10. Check for overlapping bookings
    const hasOverlap = await this.bookingRepository.hasOverlap(spotId, startTime, endTime);
    if (hasOverlap) {
      throw ApiError.badRequest('This time slot is already booked');
    }

    // 11. Calculate total price
    const durationHours = duration / 60;
    const totalPrice = Math.round(durationHours * spot.hourlyRate * 100) / 100;

    // 12. Determine initial status
    const status = spot.instantBook ? BookingStatus.CONFIRMED : BookingStatus.PENDING;

    // 13. Create booking
    const bookingData: CreateBookingData = {
      renterId,
      hostId: spot.hostId,
      spotId,
      vehicleId,
      startTime,
      endTime,
      totalPrice,
      hourlyRate: spot.hourlyRate,
      duration,
      cancellationPolicy: spot.cancellationPolicy,
      status,
      renterNotes,
    };

    const booking = await this.bookingRepository.create(bookingData);
    return toBookingDTO(booking);
  }

  async getById(bookingId: string, userId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Only renter or host can view
    if (booking.renterId !== userId && booking.hostId !== userId) {
      throw ApiError.notFound('Booking not found');
    }

    return toBookingDTO(booking);
  }

  async getMyBookings(userId: string, role?: 'renter' | 'host', status?: BookingStatusDTO) {
    const prismaStatus = status ? dtoBookingStatusToPrisma(status) : undefined;

    let bookings;
    if (role === 'host') {
      bookings = await this.bookingRepository.findByHostId(userId, prismaStatus);
    } else {
      // Default to renter view
      bookings = await this.bookingRepository.findByRenterId(userId, prismaStatus);
    }

    return bookings.map(toBookingSummaryDTO);
  }

  async cancel(bookingId: string, userId: string, reason?: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Only renter or host can cancel
    if (booking.renterId !== userId && booking.hostId !== userId) {
      throw ApiError.notFound('Booking not found');
    }

    // Can only cancel pending or confirmed bookings
    const cancellableStatuses: BookingStatus[] = [BookingStatus.PENDING, BookingStatus.CONFIRMED];
    if (!cancellableStatuses.includes(booking.status)) {
      throw ApiError.badRequest('This booking cannot be cancelled');
    }

    const updated = await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED, {
      cancelledAt: new Date(),
      cancelledBy: userId,
      cancellationReason: reason,
    });

    return toBookingDTO(updated);
  }

  async confirm(bookingId: string, hostId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.hostId !== hostId) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw ApiError.badRequest('Only pending bookings can be confirmed');
    }

    const updated = await this.bookingRepository.updateStatus(bookingId, BookingStatus.CONFIRMED);
    return toBookingDTO(updated);
  }

  async complete(bookingId: string, userId: string) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // Only renter or host can complete
    if (booking.renterId !== userId && booking.hostId !== userId) {
      throw ApiError.notFound('Booking not found');
    }

    // Can only complete confirmed or active bookings
    const completableStatuses: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.ACTIVE];
    if (!completableStatuses.includes(booking.status)) {
      throw ApiError.badRequest('This booking cannot be completed');
    }

    // Booking can only be completed after endTime
    if (new Date() < booking.endTime) {
      throw ApiError.badRequest('Booking can only be completed after the end time');
    }

    const updated = await this.bookingRepository.updateStatus(bookingId, BookingStatus.COMPLETED);
    return toBookingDTO(updated);
  }
}
