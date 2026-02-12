import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Booking, Vehicle } from '../types';
import { bookingApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CreateBookingData {
  spotId: string;
  startTime: string;
  endTime: string;
  vehicle: Vehicle;
  hasInsurance: boolean;
  specialInstructions?: string;
}

interface BookingContextType {
  activeBookings: Booking[];
  upcomingBookings: Booking[];
  pastBookings: Booking[];
  currentActiveBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (data: CreateBookingData) => Promise<Booking>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  extendBooking: (bookingId: string, newEndTime: string) => Promise<void>;
  endBookingEarly: (bookingId: string) => Promise<void>;
  checkIn: (bookingId: string) => Promise<void>;
  checkOut: (bookingId: string) => Promise<void>;
  getBookingById: (bookingId: string) => Booking | undefined;
  refreshBooking: (bookingId: string) => Promise<Booking | undefined>;
  // Host functions
  hostBookings: Booking[];
  approveBooking: (bookingId: string, hostNotes?: string) => Promise<void>;
  declineBooking: (bookingId: string, reason?: string) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | null>(null);

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: React.ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bookings on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [user?.id]);

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      // Fetch both renter and host bookings
      const [renterBookings, hostBookings] = await Promise.all([
        bookingApi.getMyBookings({ role: 'renter' }),
        bookingApi.getMyBookings({ role: 'host' }),
      ]);

      // Combine and deduplicate bookings
      const allBookings = [...renterBookings, ...hostBookings];
      const uniqueBookings = allBookings.filter(
        (booking, index, self) => self.findIndex((b) => b.id === booking.id) === index
      );

      setBookings(uniqueBookings);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(message);
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Refresh a single booking from API
  const refreshBooking = useCallback(async (bookingId: string): Promise<Booking | undefined> => {
    try {
      const booking = await bookingApi.getById(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? booking : b))
      );
      return booking;
    } catch (err) {
      console.error('Error refreshing booking:', err);
      return undefined;
    }
  }, []);

  // Create booking
  const createBooking = useCallback(async (data: CreateBookingData): Promise<Booking> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);
    try {
      const booking = await bookingApi.create({
        spotId: data.spotId,
        vehicleId: data.vehicle.id,
        startTime: data.startTime,
        endTime: data.endTime,
        renterNotes: data.specialInstructions,
      });

      // Add the new booking to state
      setBookings((prev) => [...prev, booking]);
      return booking;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create booking';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedBooking = await bookingApi.cancel(bookingId, reason);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extend booking (not yet supported by backend - needs endpoint)
  const extendBooking = useCallback(async (_bookingId: string, _newEndTime: string) => {
    // TODO: Backend needs an extend booking endpoint
    // For now, throw an error to indicate this feature is not available
    throw new Error('Extend booking is not yet available');
  }, []);

  // End booking early (uses complete endpoint)
  const endBookingEarly = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedBooking = await bookingApi.complete(bookingId);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end booking';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check in
  const checkIn = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedBooking = await bookingApi.checkIn(bookingId);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check in';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check out
  const checkOut = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedBooking = await bookingApi.checkOut(bookingId);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check out';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get booking by ID from local state
  const getBookingById = useCallback((bookingId: string): Booking | undefined => {
    return bookings.find((b) => b.id === bookingId);
  }, [bookings]);

  // Approve booking (host) - uses confirm endpoint
  const approveBooking = useCallback(async (bookingId: string, hostNotes?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedBooking = await bookingApi.confirm(bookingId, hostNotes);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve booking';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Decline booking (host) - uses cancel endpoint with reason
  const declineBooking = useCallback(async (bookingId: string, reason?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedBooking = await bookingApi.cancel(bookingId, reason ?? 'Declined by host');

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to decline booking';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter bookings by type for renters
  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status === 'active' && b.renterId === user?.id),
    [bookings, user?.id]
  );

  const upcomingBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (b.status === 'pending' || b.status === 'confirmed') &&
          b.renterId === user?.id &&
          new Date(b.startTime) > new Date()
      ),
    [bookings, user?.id]
  );

  const pastBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          (b.status === 'completed' || b.status === 'cancelled') &&
          b.renterId === user?.id
      ),
    [bookings, user?.id]
  );

  const currentActiveBooking = useMemo(
    () => activeBookings.find((b) => b.status === 'active') || null,
    [activeBookings]
  );

  // Filter bookings for hosts
  const hostBookings = useMemo(
    () => bookings.filter((b) => b.hostId === user?.id),
    [bookings, user?.id]
  );

  const contextValue = useMemo<BookingContextType>(
    () => ({
      activeBookings,
      upcomingBookings,
      pastBookings,
      currentActiveBooking,
      isLoading,
      error,
      fetchBookings,
      createBooking,
      cancelBooking,
      extendBooking,
      endBookingEarly,
      checkIn,
      checkOut,
      getBookingById,
      refreshBooking,
      hostBookings,
      approveBooking,
      declineBooking,
    }),
    [
      activeBookings,
      upcomingBookings,
      pastBookings,
      currentActiveBooking,
      isLoading,
      error,
      fetchBookings,
      createBooking,
      cancelBooking,
      extendBooking,
      endBookingEarly,
      checkIn,
      checkOut,
      getBookingById,
      refreshBooking,
      hostBookings,
      approveBooking,
      declineBooking,
    ]
  );

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;
