import { Booking, BookingStatus, PaymentStatus, Vehicle } from '../types';
import { addHours, addDays, subDays, subHours, format } from 'date-fns';

// Sample vehicles
const sampleVehicles: Vehicle[] = [
  {
    id: 'vehicle_1',
    make: 'Renault',
    model: 'Clio',
    licensePlate: 'AB-123-CD',
    color: 'Silver',
    type: 'compact',
    isDefault: true,
  },
  {
    id: 'vehicle_2',
    make: 'Peugeot',
    model: '308',
    licensePlate: 'EF-456-GH',
    color: 'Blue',
    type: 'sedan',
    isDefault: false,
  },
  {
    id: 'vehicle_3',
    make: 'Volkswagen',
    model: 'Golf',
    licensePlate: 'IJ-789-KL',
    color: 'Black',
    type: 'sedan',
    isDefault: false,
  },
];

// Helper to create date strings
const now = new Date();
const today = format(now, 'yyyy-MM-dd');

export const mockBookings: Booking[] = [
  // Active booking
  {
    id: 'booking_1',
    spotId: 'spot_1',
    renterId: 'user_1',
    hostId: 'user_3',
    startTime: subHours(now, 2).toISOString(),
    endTime: addHours(now, 4).toISOString(),
    vehicle: sampleVehicles[0],
    pricing: {
      spotFee: 36,
      serviceFee: 7.2,
      insurance: 2,
      total: 45.2,
    },
    status: 'active',
    paymentStatus: 'paid',
    accessCode: '4523',
    checkIn: subHours(now, 2).toISOString(),
    createdAt: subDays(now, 1).toISOString(),
    hasInsurance: true,
  },
  // Upcoming confirmed booking
  {
    id: 'booking_2',
    spotId: 'spot_2',
    renterId: 'user_1',
    hostId: 'user_2',
    startTime: addDays(now, 1).toISOString(),
    endTime: addHours(addDays(now, 1), 5).toISOString(),
    vehicle: sampleVehicles[1],
    pricing: {
      spotFee: 40,
      serviceFee: 8,
      insurance: 0,
      total: 48,
    },
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: subDays(now, 2).toISOString(),
    specialInstructions: 'I will arrive around 2:15pm',
    hasInsurance: false,
  },
  // Pending booking (awaiting host approval)
  {
    id: 'booking_3',
    spotId: 'spot_5',
    renterId: 'user_1',
    hostId: 'user_6',
    startTime: addDays(now, 3).toISOString(),
    endTime: addHours(addDays(now, 3), 8).toISOString(),
    vehicle: sampleVehicles[0],
    pricing: {
      spotFee: 50,
      serviceFee: 10,
      insurance: 2,
      total: 62,
    },
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: subHours(now, 6).toISOString(),
    hasInsurance: true,
  },
  // Completed booking 1
  {
    id: 'booking_4',
    spotId: 'spot_3',
    renterId: 'user_1',
    hostId: 'user_8',
    startTime: subDays(now, 5).toISOString(),
    endTime: addHours(subDays(now, 5), 5).toISOString(),
    vehicle: sampleVehicles[0],
    pricing: {
      spotFee: 50,
      serviceFee: 10,
      insurance: 2,
      total: 62,
    },
    status: 'completed',
    paymentStatus: 'paid',
    checkIn: subDays(now, 5).toISOString(),
    checkOut: addHours(subDays(now, 5), 5).toISOString(),
    createdAt: subDays(now, 7).toISOString(),
    hasInsurance: true,
  },
  // Completed booking 2
  {
    id: 'booking_5',
    spotId: 'spot_4',
    renterId: 'user_1',
    hostId: 'user_5',
    startTime: subDays(now, 10).toISOString(),
    endTime: addHours(subDays(now, 10), 6).toISOString(),
    vehicle: sampleVehicles[1],
    pricing: {
      spotFee: 30,
      serviceFee: 6,
      insurance: 0,
      total: 36,
    },
    status: 'completed',
    paymentStatus: 'paid',
    checkIn: subDays(now, 10).toISOString(),
    checkOut: addHours(subDays(now, 10), 6).toISOString(),
    createdAt: subDays(now, 12).toISOString(),
    hasInsurance: false,
  },
  // Cancelled booking
  {
    id: 'booking_6',
    spotId: 'spot_6',
    renterId: 'user_1',
    hostId: 'user_3',
    startTime: subDays(now, 3).toISOString(),
    endTime: addHours(subDays(now, 3), 4).toISOString(),
    vehicle: sampleVehicles[0],
    pricing: {
      spotFee: 36,
      serviceFee: 7.2,
      insurance: 0,
      total: 43.2,
    },
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: subDays(now, 5).toISOString(),
    hasInsurance: false,
  },
  // Completed booking 3
  {
    id: 'booking_7',
    spotId: 'spot_1',
    renterId: 'user_1',
    hostId: 'user_3',
    startTime: subDays(now, 15).toISOString(),
    endTime: addHours(subDays(now, 15), 8).toISOString(),
    vehicle: sampleVehicles[0],
    pricing: {
      spotFee: 40,
      serviceFee: 8,
      insurance: 2,
      total: 50,
    },
    status: 'completed',
    paymentStatus: 'paid',
    accessCode: '4523',
    checkIn: subDays(now, 15).toISOString(),
    checkOut: addHours(subDays(now, 15), 8).toISOString(),
    createdAt: subDays(now, 17).toISOString(),
    hasInsurance: true,
  },

  // HOST BOOKINGS (for user_3 as host)
  // Upcoming booking from another renter
  {
    id: 'booking_8',
    spotId: 'spot_1',
    renterId: 'user_4',
    hostId: 'user_3',
    startTime: addDays(now, 2).toISOString(),
    endTime: addHours(addDays(now, 2), 6).toISOString(),
    vehicle: sampleVehicles[2],
    pricing: {
      spotFee: 36,
      serviceFee: 7.2,
      insurance: 2,
      total: 45.2,
    },
    status: 'confirmed',
    paymentStatus: 'paid',
    accessCode: '4523',
    createdAt: subDays(now, 1).toISOString(),
    hasInsurance: true,
  },
  // Pending booking awaiting host_3 approval
  {
    id: 'booking_9',
    spotId: 'spot_6',
    renterId: 'user_7',
    hostId: 'user_3',
    startTime: addDays(now, 4).toISOString(),
    endTime: addHours(addDays(now, 4), 3).toISOString(),
    vehicle: {
      id: 'vehicle_uk',
      make: 'Mini',
      model: 'Cooper',
      licensePlate: 'AB12 CDE',
      color: 'Red',
      type: 'compact',
    },
    pricing: {
      spotFee: 27,
      serviceFee: 5.4,
      insurance: 2,
      total: 34.4,
    },
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: subHours(now, 3).toISOString(),
    specialInstructions: 'First time in Paris, please provide detailed directions!',
    hasInsurance: true,
  },
  // Completed booking as host
  {
    id: 'booking_10',
    spotId: 'spot_1',
    renterId: 'user_2',
    hostId: 'user_3',
    startTime: subDays(now, 7).toISOString(),
    endTime: addHours(subDays(now, 7), 8).toISOString(),
    vehicle: sampleVehicles[1],
    pricing: {
      spotFee: 40,
      serviceFee: 8,
      insurance: 0,
      total: 48,
    },
    status: 'completed',
    paymentStatus: 'paid',
    accessCode: '4523',
    checkIn: subDays(now, 7).toISOString(),
    checkOut: addHours(subDays(now, 7), 8).toISOString(),
    createdAt: subDays(now, 9).toISOString(),
    hasInsurance: false,
  },
];

// Get booking by ID
export const getBookingById = (id: string): Booking | undefined => {
  return mockBookings.find((booking) => booking.id === id);
};

// Get bookings by renter
export const getBookingsByRenter = (renterId: string): Booking[] => {
  return mockBookings.filter((booking) => booking.renterId === renterId);
};

// Get bookings by host
export const getBookingsByHost = (hostId: string): Booking[] => {
  return mockBookings.filter((booking) => booking.hostId === hostId);
};

// Get active bookings
export const getActiveBookings = (userId: string): Booking[] => {
  return mockBookings.filter(
    (booking) =>
      (booking.renterId === userId || booking.hostId === userId) &&
      booking.status === 'active'
  );
};

// Get upcoming bookings
export const getUpcomingBookings = (userId: string): Booking[] => {
  const now = new Date();
  return mockBookings.filter(
    (booking) =>
      (booking.renterId === userId || booking.hostId === userId) &&
      (booking.status === 'pending' || booking.status === 'confirmed') &&
      new Date(booking.startTime) > now
  );
};

// Get past bookings
export const getPastBookings = (userId: string): Booking[] => {
  return mockBookings.filter(
    (booking) =>
      (booking.renterId === userId || booking.hostId === userId) &&
      (booking.status === 'completed' || booking.status === 'cancelled')
  );
};
