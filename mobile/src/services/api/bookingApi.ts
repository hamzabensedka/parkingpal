import type {
  CreateBookingRequest,
  BookingDTO,
  BookingSummaryDTO,
  ListBookingsQuery,
  CancelBookingRequest,
  BookingStatusDTO,
} from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';
import { Booking, BookingStatus, PaymentStatus, BookingPricing } from '../../types';

export interface BookingApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function withTimeout<T>(
  promiseFactory: () => Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promiseFactory(), timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function toQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];
  const add = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  Object.entries(params).forEach(([key, value]) => {
    add(key, value);
  });

  return parts.join('&');
}

/**
 * Map backend BookingStatusDTO to frontend BookingStatus
 */
function mapBookingStatus(status: BookingStatusDTO): BookingStatus {
  // Backend has 'no_show' which we map to 'cancelled' on frontend
  if (status === 'no_show') return 'cancelled';
  return status as BookingStatus;
}

/**
 * Map backend PaymentStatusDTO to frontend PaymentStatus
 */
function mapPaymentStatus(status: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    pending: 'pending',
    authorized: 'pending',
    captured: 'paid',
    refunded: 'refunded',
    failed: 'pending',
  };
  return statusMap[status] ?? 'pending';
}

/**
 * Convert backend BookingDTO to frontend Booking type
 */
function mapBookingDTOToBooking(dto: BookingDTO): Booking {
  const pricing: BookingPricing = {
    spotFee: dto.totalPrice - (dto.totalPrice * 0.1), // Approximate - backend should return breakdown
    serviceFee: dto.totalPrice * 0.08,
    insurance: dto.totalPrice * 0.02,
    total: dto.totalPrice,
  };

  return {
    id: dto.id,
    spotId: dto.spot.id,
    spot: {
      id: dto.spot.id,
      hostId: dto.host.id,
      title: dto.spot.title,
      description: '',
      address: dto.spot.address,
      latitude: 0,
      longitude: 0,
      spotType: 'driveway',
      hourlyRate: dto.hourlyRate,
      photos: dto.spot.primaryPhoto ? [dto.spot.primaryPhoto] : [],
      amenities: [],
      vehicleSizes: [],
      accessInstructions: '',
      accessType: 'trust',
      availability: {},
      rating: 0,
      reviewCount: 0,
      instantBook: false,
      createdAt: dto.createdAt,
    },
    renterId: dto.renter.id,
    renter: {
      id: dto.renter.id,
      email: '',
      firstName: dto.renter.firstName,
      lastName: dto.renter.lastName,
      phone: '',
      profilePhoto: dto.renter.profilePhoto,
      userType: 'renter',
      verified: { phone: false, id: false },
      rating: 0,
      reviewCount: 0,
      memberSince: '',
    },
    hostId: dto.host.id,
    host: {
      id: dto.host.id,
      email: '',
      firstName: dto.host.firstName,
      lastName: dto.host.lastName,
      phone: '',
      profilePhoto: dto.host.profilePhoto,
      userType: 'host',
      verified: { phone: false, id: false },
      rating: 0,
      reviewCount: 0,
      memberSince: '',
    },
    startTime: dto.startTime,
    endTime: dto.endTime,
    vehicle: {
      id: dto.vehicle.id,
      make: dto.vehicle.make,
      model: dto.vehicle.model,
      licensePlate: dto.vehicle.licensePlate,
      color: dto.vehicle.color,
      type: dto.vehicle.type as any,
    },
    pricing,
    status: mapBookingStatus(dto.status),
    paymentStatus: mapPaymentStatus(dto.paymentStatus),
    createdAt: dto.createdAt,
    specialInstructions: dto.renterNotes,
    hasInsurance: false, // Backend doesn't track this yet
  };
}

/**
 * Convert backend BookingSummaryDTO to frontend Booking type
 */
function mapBookingSummaryToBooking(dto: BookingSummaryDTO): Booking {
  const pricing: BookingPricing = {
    spotFee: dto.totalPrice * 0.9,
    serviceFee: dto.totalPrice * 0.08,
    insurance: dto.totalPrice * 0.02,
    total: dto.totalPrice,
  };

  return {
    id: dto.id,
    spotId: '',
    spot: {
      id: '',
      hostId: '',
      title: dto.spotTitle,
      description: '',
      address: dto.spotAddress,
      latitude: 0,
      longitude: 0,
      spotType: 'driveway',
      hourlyRate: 0,
      photos: dto.spotPrimaryPhoto ? [dto.spotPrimaryPhoto] : [],
      amenities: [],
      vehicleSizes: [],
      accessInstructions: '',
      accessType: 'trust',
      availability: {},
      rating: 0,
      reviewCount: 0,
      instantBook: false,
      createdAt: dto.createdAt,
    },
    renterId: '',
    hostId: '',
    startTime: dto.startTime,
    endTime: dto.endTime,
    vehicle: {
      id: '',
      make: '',
      model: '',
      licensePlate: '',
      color: '',
      type: 'sedan',
    },
    pricing,
    status: mapBookingStatus(dto.status),
    paymentStatus: 'paid',
    createdAt: dto.createdAt,
    hasInsurance: false,
  };
}

/**
 * Booking API - create, list, manage bookings
 */
export function createBookingApi(client: AxiosInstance) {
  return {
    /**
     * Create a new booking
     */
    async create(body: Omit<CreateBookingRequest, 'agreedToTerms'>): Promise<Booking> {
      // Always agree to terms when creating a booking via the app
      const requestBody: CreateBookingRequest = {
        ...body,
        agreedToTerms: true,
      };

      const { data } = await withTimeout(
        () =>
          client.post<BookingApiResponse<{ booking: BookingDTO }>>(
            '/api/bookings',
            requestBody,
            { timeout: 15000 },
          ),
        16000,
        'Create booking request timed out',
      );

      if (!data.success || !data.data?.booking) {
        throw new Error(data.error ?? 'Failed to create booking');
      }
      return mapBookingDTOToBooking(data.data.booking);
    },

    /**
     * Get list of bookings for the current user
     */
    async getMyBookings(query?: ListBookingsQuery): Promise<Booking[]> {
      const queryString = query ? toQueryString({
        status: query.status,
        role: query.role,
        page: query.page,
        limit: query.limit,
      }) : '';

      const url = queryString ? `/api/bookings?${queryString}` : '/api/bookings';

      const { data } = await withTimeout(
        () =>
          client.get<BookingApiResponse<{ bookings: BookingSummaryDTO[] }>>(url, {
            timeout: 12000,
          }),
        13000,
        'Get bookings request timed out',
      );

      if (!data.success || !data.data?.bookings) {
        throw new Error(data.error ?? 'Failed to fetch bookings');
      }
      return data.data.bookings.map(mapBookingSummaryToBooking);
    },

    /**
     * Get a single booking by ID
     */
    async getById(bookingId: string): Promise<Booking> {
      const { data } = await withTimeout(
        () =>
          client.get<BookingApiResponse<{ booking: BookingDTO }>>(
            `/api/bookings/${bookingId}`,
            { timeout: 12000 },
          ),
        13000,
        'Get booking request timed out',
      );

      if (!data.success || !data.data?.booking) {
        throw new Error(data.error ?? 'Failed to fetch booking');
      }
      return mapBookingDTOToBooking(data.data.booking);
    },

    /**
     * Cancel a booking
     */
    async cancel(bookingId: string, reason?: string): Promise<Booking> {
      const body: CancelBookingRequest = reason ? { reason } : {};

      const { data } = await withTimeout(
        () =>
          client.post<BookingApiResponse<{ booking: BookingDTO }>>(
            `/api/bookings/${bookingId}/cancel`,
            body,
            { timeout: 12000 },
          ),
        13000,
        'Cancel booking request timed out',
      );

      if (!data.success || !data.data?.booking) {
        throw new Error(data.error ?? 'Failed to cancel booking');
      }
      return mapBookingDTOToBooking(data.data.booking);
    },

    /**
     * Host confirms a pending booking
     */
    async confirm(bookingId: string, hostNotes?: string): Promise<Booking> {
      const body = hostNotes ? { hostNotes } : {};

      const { data } = await withTimeout(
        () =>
          client.post<BookingApiResponse<{ booking: BookingDTO }>>(
            `/api/bookings/${bookingId}/confirm`,
            body,
            { timeout: 12000 },
          ),
        13000,
        'Confirm booking request timed out',
      );

      if (!data.success || !data.data?.booking) {
        throw new Error(data.error ?? 'Failed to confirm booking');
      }
      return mapBookingDTOToBooking(data.data.booking);
    },

    /**
     * Complete a booking
     */
    async complete(bookingId: string): Promise<Booking> {
      const { data } = await withTimeout(
        () =>
          client.post<BookingApiResponse<{ booking: BookingDTO }>>(
            `/api/bookings/${bookingId}/complete`,
            {},
            { timeout: 12000 },
          ),
        13000,
        'Complete booking request timed out',
      );

      if (!data.success || !data.data?.booking) {
        throw new Error(data.error ?? 'Failed to complete booking');
      }
      return mapBookingDTOToBooking(data.data.booking);
    },

    /**
     * Check in to a booking
     */
    async checkIn(bookingId: string, photoUrl?: string): Promise<Booking> {
      const body = photoUrl ? { photoUrl } : {};

      const { data } = await withTimeout(
        () =>
          client.post<BookingApiResponse<{ booking: BookingDTO }>>(
            `/api/bookings/${bookingId}/check-in`,
            body,
            { timeout: 12000 },
          ),
        13000,
        'Check-in request timed out',
      );

      if (!data.success || !data.data?.booking) {
        throw new Error(data.error ?? 'Failed to check in');
      }
      return mapBookingDTOToBooking(data.data.booking);
    },

    /**
     * Check out from a booking
     */
    async checkOut(bookingId: string): Promise<Booking> {
      const { data } = await withTimeout(
        () =>
          client.post<BookingApiResponse<{ booking: BookingDTO }>>(
            `/api/bookings/${bookingId}/check-out`,
            {},
            { timeout: 12000 },
          ),
        13000,
        'Check-out request timed out',
      );

      if (!data.success || !data.data?.booking) {
        throw new Error(data.error ?? 'Failed to check out');
      }
      return mapBookingDTOToBooking(data.data.booking);
    },
  };
}

export type BookingApi = ReturnType<typeof createBookingApi>;
