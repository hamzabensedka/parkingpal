import { Dimensions, Platform, PixelRatio } from 'react-native';
import { BOOKING, CANCELLATION_POLICIES } from './constants';
import { BookingPricing, SearchFilters, Spot } from '../types';
import { parseISO, differenceInHours, isAfter, isBefore, addHours } from 'date-fns';

// Screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export { SCREEN_WIDTH, SCREEN_HEIGHT };

// Responsive scaling
const scale = SCREEN_WIDTH / 375; // Based on iPhone X width

export const normalize = (size: number): number => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Check if device is iPhone X or newer (with notch)
export const hasNotch = (): boolean => {
  return Platform.OS === 'ios' && (SCREEN_HEIGHT >= 812 || SCREEN_WIDTH >= 812);
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Calculate booking price
export const calculateBookingPrice = (
  spot: Spot,
  startTime: string,
  endTime: string,
  includeInsurance: boolean = false
): BookingPricing => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  const hours = differenceInHours(end, start);

  // Use daily rate if booking is 8+ hours and daily rate is available
  let spotFee: number;
  if (hours >= 8 && spot.dailyRate) {
    const days = Math.ceil(hours / 24);
    spotFee = days * spot.dailyRate;
  } else {
    spotFee = hours * spot.hourlyRate;
  }

  const serviceFee = spotFee * BOOKING.serviceFeePercentage;
  const insurance = includeInsurance ? BOOKING.insuranceFee : 0;
  const total = spotFee + serviceFee + insurance;

  return {
    spotFee: Math.round(spotFee * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    insurance,
    total: Math.round(total * 100) / 100,
  };
};

// Calculate refund amount based on cancellation policy
export const calculateRefund = (
  total: number,
  startTime: string,
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' = 'flexible'
): { refundAmount: number; refundPercentage: number } => {
  const now = new Date();
  const start = parseISO(startTime);
  const hoursUntilStart = differenceInHours(start, now);

  const policy = CANCELLATION_POLICIES.find((p) => p.id === cancellationPolicy);
  if (!policy) {
    return { refundAmount: 0, refundPercentage: 0 };
  }

  // Find applicable rule (highest matching threshold)
  let refundPercentage = 0;
  for (const rule of policy.rules) {
    if (hoursUntilStart >= rule.hoursBeforeStart) {
      refundPercentage = rule.refundPercentage;
      break;
    }
  }

  const refundAmount = (total * refundPercentage) / 100;

  return {
    refundAmount: Math.round(refundAmount * 100) / 100,
    refundPercentage,
  };
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Filter spots based on search criteria
export const filterSpots = (spots: Spot[], filters: SearchFilters): Spot[] => {
  return spots.filter((spot) => {
    // Price filter
    if (filters.priceRange) {
      if (
        spot.hourlyRate < filters.priceRange.min ||
        spot.hourlyRate > filters.priceRange.max
      ) {
        return false;
      }
    }

    // Distance filter
    if (filters.distance && filters.location) {
      const distance = calculateDistance(
        filters.location.latitude,
        filters.location.longitude,
        spot.latitude,
        spot.longitude
      );
      if (distance > filters.distance) {
        return false;
      }
    }

    // Spot type filter
    if (filters.spotTypes && filters.spotTypes.length > 0) {
      if (!filters.spotTypes.includes(spot.spotType)) {
        return false;
      }
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((amenity) =>
        spot.amenities.includes(amenity)
      );
      if (!hasAllAmenities) {
        return false;
      }
    }

    // Vehicle size filter
    if (filters.vehicleSize) {
      if (!spot.vehicleSizes.includes(filters.vehicleSize)) {
        return false;
      }
    }

    // Instant book filter
    if (filters.instantBookOnly && !spot.instantBook) {
      return false;
    }

    return true;
  });
};

// Sort spots by distance
export const sortSpotsByDistance = (
  spots: Spot[],
  userLat: number,
  userLon: number
): Spot[] => {
  return [...spots].sort((a, b) => {
    const distanceA = calculateDistance(userLat, userLon, a.latitude, a.longitude);
    const distanceB = calculateDistance(userLat, userLon, b.latitude, b.longitude);
    return distanceA - distanceB;
  });
};

// Sort spots by price
export const sortSpotsByPrice = (spots: Spot[], ascending: boolean = true): Spot[] => {
  return [...spots].sort((a, b) => {
    return ascending ? a.hourlyRate - b.hourlyRate : b.hourlyRate - a.hourlyRate;
  });
};

// Sort spots by rating
export const sortSpotsByRating = (spots: Spot[]): Spot[] => {
  return [...spots].sort((a, b) => b.rating - a.rating);
};

// Check if spot is available for given time
export const isSpotAvailable = (
  spot: Spot,
  startTime: string,
  endTime: string
): boolean => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  const dateKey = startTime.split('T')[0];

  const dayAvailability = spot.availability[dateKey];
  if (!dayAvailability || !dayAvailability.available) {
    return false;
  }

  // If no specific time slots, assume entire day is available
  if (!dayAvailability.timeSlots || dayAvailability.timeSlots.length === 0) {
    return true;
  }

  // Check if booking time fits within available time slots
  const startTimeStr = startTime.split('T')[1].slice(0, 5);
  const endTimeStr = endTime.split('T')[1].slice(0, 5);

  return dayAvailability.timeSlots.some((slot) => {
    const [slotStart, slotEnd] = slot.split('-');
    return startTimeStr >= slotStart && endTimeStr <= slotEnd;
  });
};

// Get star rating array for display
export const getStarArray = (rating: number): ('full' | 'half' | 'empty')[] => {
  const stars: ('full' | 'half' | 'empty')[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push('full');
    } else if (i === fullStars && hasHalfStar) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }

  return stars;
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

// Sleep function (for testing/debugging)
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Group array by key
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// Get random item from array
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Shuffle array
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Clamp number between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Get ordinal suffix (1st, 2nd, 3rd, etc.)
export const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return 'er';
  }
  return 'e';
};

// Validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Extract error message from any error type
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};
