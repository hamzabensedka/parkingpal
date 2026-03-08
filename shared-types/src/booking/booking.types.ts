/**
 * Booking Request/Response Types
 * Contract between frontend & backend for the booking feature
 */

import { ApiSuccessResponse, ApiErrorResponse } from '../common/api.types';
import { CancellationPolicyDTO } from '../spot/spot.types';

// ==========================================
// Enum Types (lowercase union types for API)
// ==========================================

export type BookingStatusDTO = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatusDTO = 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';

// ==========================================
// Nested DTOs (embedded in BookingDTO)
// ==========================================

export interface BookingSpotSummary {
  id: string;
  title: string;
  address: string;
  city: string;
  primaryPhoto?: string;
}

export interface BookingUserSummary {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
}

export interface BookingVehicleSummary {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  type: string;
}

/**
 * Available actions for a booking based on its current state
 * Mobile app should use these flags to show/hide action buttons
 */
export interface BookingActionsDTO {
  canCancel: boolean;
  canConfirm: boolean;       // Host only - for pending bookings
  canCheckIn: boolean;       // Renter only
  canCheckOut: boolean;      // Renter only
  canComplete: boolean;      // After end time
  canReview: boolean;        // After completion
  // Timing info for check-in button
  checkInAvailableAt?: string;  // ISO timestamp when check-in becomes available (30 min before start)
  checkInExpiresAt?: string;    // ISO timestamp when check-in expires (at end time)
}

// ==========================================
// DTOs
// ==========================================

export interface BookingDTO {
  id: string;
  spot: BookingSpotSummary;
  renter: BookingUserSummary;
  host: BookingUserSummary;
  vehicle: BookingVehicleSummary;
  startTime: string;
  endTime: string;
  status: BookingStatusDTO;
  totalPrice: number;
  hourlyRate: number;
  duration: number;
  paymentStatus: PaymentStatusDTO;
  cancellationPolicy: CancellationPolicyDTO;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  hostNotes?: string;
  renterNotes?: string;
  checkInAt?: string;
  checkOutAt?: string;
  createdAt: string;
  updatedAt: string;
  // Available actions based on booking state and user role
  actions?: BookingActionsDTO;
}

export interface BookingSummaryDTO {
  id: string;
  spotTitle: string;
  spotAddress: string;
  spotCity: string;
  spotPrimaryPhoto?: string;
  startTime: string;
  endTime: string;
  status: BookingStatusDTO;
  totalPrice: number;
  createdAt: string;
}

// ==========================================
// Request Types
// ==========================================

export interface CreateBookingRequest {
  spotId: string;
  vehicleId: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  renterNotes?: string;
  agreedToTerms: true; // Must explicitly agree to terms
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface ListBookingsQuery {
  status?: BookingStatusDTO;
  role?: 'renter' | 'host';
  page?: number;
  limit?: number;
}

// ==========================================
// Response Types
// ==========================================

export type CreateBookingResponse = ApiSuccessResponse<{ booking: BookingDTO }> | ApiErrorResponse;
export type GetBookingResponse = ApiSuccessResponse<{ booking: BookingDTO }> | ApiErrorResponse;
export type ListBookingsResponse = ApiSuccessResponse<{ bookings: BookingSummaryDTO[] }> | ApiErrorResponse;
export type CancelBookingResponse = ApiSuccessResponse<{ booking: BookingDTO }> | ApiErrorResponse;
export type ConfirmBookingResponse = ApiSuccessResponse<{ booking: BookingDTO }> | ApiErrorResponse;
export type CompleteBookingResponse = ApiSuccessResponse<{ booking: BookingDTO }> | ApiErrorResponse;
