import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus, Vehicle, Spot, BookingPricing, User } from '../types';
import { mockBookings } from '../data/mockBookings';
import { mockSpots } from '../data/mockSpots';
import { mockUsers } from '../data/mockUsers';
import { calculateBookingPrice, generateId } from '../utils/helpers';
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
  fetchBookings: () => Promise<void>;
  createBooking: (data: CreateBookingData) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  extendBooking: (bookingId: string, newEndTime: string) => Promise<void>;
  endBookingEarly: (bookingId: string) => Promise<void>;
  checkIn: (bookingId: string) => Promise<void>;
  checkOut: (bookingId: string) => Promise<void>;
  getBookingById: (bookingId: string) => Booking | undefined;
  // Host functions
  hostBookings: Booking[];
  approveBooking: (bookingId: string) => Promise<void>;
  declineBooking: (bookingId: string) => Promise<void>;
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

  // Load bookings on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchBookings();
    } else {
      setBookings([]);
    }
  }, [user?.id]);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter mock bookings for current user
      const userBookings = mockBookings.filter(
        (b) => b.renterId === user?.id || b.hostId === user?.id
      );

      // Populate spot and user data
      const populatedBookings = userBookings.map((booking) => ({
        ...booking,
        spot: mockSpots.find((s) => s.id === booking.spotId),
        renter: mockUsers.find((u) => u.id === booking.renterId),
        host: mockUsers.find((u) => u.id === booking.hostId),
      }));

      setBookings(populatedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Create booking
  const createBooking = useCallback(async (data: CreateBookingData): Promise<Booking> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const spot = mockSpots.find((s) => s.id === data.spotId);
      if (!spot) throw new Error('Spot not found');

      const pricing = calculateBookingPrice(spot, data.startTime, data.endTime, data.hasInsurance);

      const newBooking: Booking = {
        id: generateId(),
        spotId: data.spotId,
        spot,
        renterId: user.id,
        renter: { ...user, phone: user.phone ?? '' } as User,
        hostId: spot.hostId,
        host: mockUsers.find((u) => u.id === spot.hostId),
        startTime: data.startTime,
        endTime: data.endTime,
        vehicle: data.vehicle,
        pricing,
        status: spot.instantBook ? 'confirmed' : 'pending',
        paymentStatus: 'paid',
        accessCode: spot.accessType === 'code' ? '4523' : undefined,
        createdAt: new Date().toISOString(),
        specialInstructions: data.specialInstructions,
        hasInsurance: data.hasInsurance,
      };

      setBookings((prev) => [...prev, newBooking]);

      return newBooking;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cancel booking
  const cancelBooking = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'cancelled' as BookingStatus, paymentStatus: 'refunded' }
            : b
        )
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Extend booking
  const extendBooking = useCallback(async (bookingId: string, newEndTime: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId && b.spot) {
            const newPricing = calculateBookingPrice(
              b.spot,
              b.startTime,
              newEndTime,
              b.hasInsurance
            );
            return {
              ...b,
              endTime: newEndTime,
              pricing: newPricing,
            };
          }
          return b;
        })
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // End booking early
  const endBookingEarly = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: 'completed' as BookingStatus,
                checkOut: new Date().toISOString(),
                endTime: new Date().toISOString(),
              }
            : b
        )
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check in
  const checkIn = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'active' as BookingStatus, checkIn: new Date().toISOString() }
            : b
        )
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check out
  const checkOut = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'completed' as BookingStatus, checkOut: new Date().toISOString() }
            : b
        )
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get booking by ID
  const getBookingById = useCallback((bookingId: string): Booking | undefined => {
    return bookings.find((b) => b.id === bookingId);
  }, [bookings]);

  // Approve booking (host)
  const approveBooking = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b
        )
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Decline booking (host)
  const declineBooking = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'cancelled' as BookingStatus, paymentStatus: 'refunded' }
            : b
        )
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter bookings by type
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
      fetchBookings,
      createBooking,
      cancelBooking,
      extendBooking,
      endBookingEarly,
      checkIn,
      checkOut,
      getBookingById,
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
      fetchBookings,
      createBooking,
      cancelBooking,
      extendBooking,
      endBookingEarly,
      checkIn,
      checkOut,
      getBookingById,
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
