/**
 * Spot (Parking Listing) Request/Response Types
 * Contract between frontend & backend for the "List Your Spot" feature
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';

// ==========================================
// Enum Types (lowercase union types for API)
// ==========================================

export type SpotTypeDTO = 'driveway' | 'garage' | 'covered' | 'lot' | 'underground' | 'street';
export type SpotStatusDTO = 'draft' | 'pending_verification' | 'under_review' | 'active' | 'paused' | 'rejected' | 'deleted';
export type AccessTypeDTO = 'code' | 'key' | 'smart_lock' | 'remote' | 'badge' | 'open';
export type CancellationPolicyDTO = 'flexible' | 'moderate' | 'strict' | 'non_refundable';
export type LocationTypeDTO = 'residential' | 'commercial' | 'public';
export type DocumentTypeDTO = 'property_tax' | 'rental_agreement' | 'parking_deed' | 'management_auth' | 'business_lease' | 'utility_bill' | 'landlord_permission';
export type DocumentStatusDTO = 'pending' | 'approved' | 'rejected';
export type AmenityTypeDTO = 'covered' | 'lit' | 'camera' | 'ev_charging' | 'gated' | 'handicap' | 'elevator' | 'wide_entry' | 'direct_access' | 'security_guard';

// ==========================================
// DTOs
// ==========================================

export interface SpotPhotoDTO {
  id: string;
  url: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface SpotDocumentDTO {
  id: string;
  type: DocumentTypeDTO;
  url: string;
  status: DocumentStatusDTO;
  rejectionReason?: string;
  createdAt: string;
}

export interface SpotAvailabilityDTO {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}

export interface SpotDTO {
  id: string;
  hostId: string;
  title: string;
  description: string;

  // Location
  address: string;
  city: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;

  // Details
  spotType: SpotTypeDTO;
  locationType: LocationTypeDTO;
  capacity: number;
  vehicleSizes: string[];
  amenities: AmenityTypeDTO[];
  accessType: AccessTypeDTO;
  accessInstructions: string;
  spotLocation?: string;

  // Pricing
  hourlyRate: number;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;

  // Rules
  houseRules?: string;
  cancellationPolicy: CancellationPolicyDTO;
  instantBook: boolean;

  // Booking constraints
  minBookingMinutes: number;
  maxBookingMinutes?: number;
  advanceNoticeMinutes: number;
  bookingWindowDays: number;

  // Status
  status: SpotStatusDTO;
  rating: number;
  reviewCount: number;

  // Relations
  photos: SpotPhotoDTO[];
  availability: SpotAvailabilityDTO[];

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // User context flags (set when user is authenticated)
  isOwnSpot?: boolean;        // True if the current user is the host
  canBook?: boolean;          // False if own spot or not bookable for other reasons
  canBookReason?: string;     // Reason why canBook is false (for UI messaging)
}

export interface SpotSummaryDTO {
  id: string;
  title: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  spotType: SpotTypeDTO;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  primaryPhoto?: string;
  status: SpotStatusDTO;
  instantBook: boolean;
}

// ==========================================
// Request Types
// ==========================================

export interface SpotAvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
}

export interface CreateSpotRequest {
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  spotType: SpotTypeDTO;
  locationType: LocationTypeDTO;
  capacity?: number;
  vehicleSizes: string[];
  amenities: AmenityTypeDTO[];
  accessType: AccessTypeDTO;
  accessInstructions: string;
  spotLocation?: string;
  hourlyRate: number;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  houseRules?: string;
  cancellationPolicy: CancellationPolicyDTO;
  instantBook?: boolean;
  minBookingMinutes?: number;
  maxBookingMinutes?: number;
  advanceNoticeMinutes?: number;
  bookingWindowDays?: number;
  availability: SpotAvailabilityInput[];
}

export interface UpdateSpotRequest {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  spotType?: SpotTypeDTO;
  locationType?: LocationTypeDTO;
  capacity?: number;
  vehicleSizes?: string[];
  amenities?: AmenityTypeDTO[];
  accessType?: AccessTypeDTO;
  accessInstructions?: string;
  spotLocation?: string;
  hourlyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  houseRules?: string;
  cancellationPolicy?: CancellationPolicyDTO;
  instantBook?: boolean;
  minBookingMinutes?: number;
  maxBookingMinutes?: number;
  advanceNoticeMinutes?: number;
  bookingWindowDays?: number;
  availability?: SpotAvailabilityInput[];
}

export interface SearchSpotsRequest {
  latitude: number;
  longitude: number;
  radius?: number;
  spotType?: SpotTypeDTO;
  vehicleSize?: string;
  minPrice?: number;
  maxPrice?: number;
  amenities?: AmenityTypeDTO[];
  instantBook?: boolean;
}

// ==========================================
// Response Types
// ==========================================

export type CreateSpotResponse = ApiSuccessResponse<{ spot: SpotDTO }> | ApiErrorResponse;
export type GetSpotResponse = ApiSuccessResponse<{ spot: SpotDTO }> | ApiErrorResponse;
export type UpdateSpotResponse = ApiSuccessResponse<{ spot: SpotDTO }> | ApiErrorResponse;
export type ListSpotsResponse = ApiSuccessResponse<{ spots: SpotSummaryDTO[] }> | ApiErrorResponse;
export type DeleteSpotResponse = ApiSuccessResponse<null> | ApiErrorResponse;
export type SpotSearchResponse = ApiSuccessResponse<{ spots: SpotSummaryDTO[]; total: number }> | ApiErrorResponse;

// ==========================================
// Spot Availability (Booked Slots)
// ==========================================

/**
 * Represents a time slot that is already booked
 * Used by mobile to show unavailable times in the booking calendar
 */
export interface BookedSlotDTO {
  startTime: string;  // ISO 8601
  endTime: string;    // ISO 8601
}

export interface GetSpotAvailabilityRequest {
  startDate: string;  // ISO 8601 date (e.g., "2026-02-20")
  endDate: string;    // ISO 8601 date (e.g., "2026-02-27")
}

export type GetSpotAvailabilityResponse = ApiSuccessResponse<{
  bookedSlots: BookedSlotDTO[];
  // Spot's weekly availability schedule (when the spot is open)
  schedule: SpotAvailabilityDTO[];
  // Booking constraints for UI validation
  constraints: {
    minBookingMinutes: number;
    maxBookingMinutes?: number;
    advanceNoticeMinutes: number;
    bookingWindowDays: number;
  };
}> | ApiErrorResponse;
