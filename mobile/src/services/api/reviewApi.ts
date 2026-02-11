import apiClient from '../http/apiClient';
import { Review } from '../../types';

export interface CreateReviewRequest {
  bookingId: string;
  rating: number;
  comment?: string;
  tags?: string[];
  categoryRatings?: Record<string, number>;
}

export interface AddResponseRequest {
  response: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReviewResponse {
  success: boolean;
  data: Review;
  message?: string;
}

export interface CanReviewResponse {
  success: boolean;
  data: {
    canReview: boolean;
  };
}

/**
 * Create a new review for a booking
 */
export const createReview = async (data: CreateReviewRequest): Promise<Review> => {
  const response = await apiClient.post<ReviewResponse>('/reviews', data);
  return response.data.data;
};

/**
 * Get a review by ID
 */
export const getReviewById = async (reviewId: string): Promise<Review> => {
  const response = await apiClient.get<ReviewResponse>(`/reviews/${reviewId}`);
  return response.data.data;
};

/**
 * Get review for a specific booking
 */
export const getReviewByBookingId = async (bookingId: string): Promise<Review | null> => {
  try {
    const response = await apiClient.get<ReviewResponse>(`/reviews/booking/${bookingId}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get reviews for a user (reviews they received)
 */
export const getReviewsForUser = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ reviews: Review[]; pagination: any }> => {
  const response = await apiClient.get<ReviewsResponse>(`/reviews/user/${userId}`, {
    params: { page, limit },
  });
  return {
    reviews: response.data.data,
    pagination: response.data.pagination,
  };
};

/**
 * Get reviews by current user (reviews they gave)
 */
export const getMyReviews = async (
  page: number = 1,
  limit: number = 10
): Promise<{ reviews: Review[]; pagination: any }> => {
  const response = await apiClient.get<ReviewsResponse>('/reviews/my-reviews', {
    params: { page, limit },
  });
  return {
    reviews: response.data.data,
    pagination: response.data.pagination,
  };
};

/**
 * Get reviews for a spot
 */
export const getReviewsForSpot = async (
  spotId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ reviews: Review[]; pagination: any }> => {
  const response = await apiClient.get<ReviewsResponse>(`/reviews/spot/${spotId}`, {
    params: { page, limit },
  });
  return {
    reviews: response.data.data,
    pagination: response.data.pagination,
  };
};

/**
 * Add host response to a review
 */
export const addHostResponse = async (
  reviewId: string,
  response: string
): Promise<Review> => {
  const result = await apiClient.post<ReviewResponse>(
    `/reviews/${reviewId}/response`,
    { response }
  );
  return result.data.data;
};

/**
 * Check if user can review a booking
 */
export const canReviewBooking = async (bookingId: string): Promise<boolean> => {
  const response = await apiClient.get<CanReviewResponse>(
    `/reviews/can-review/${bookingId}`
  );
  return response.data.data.canReview;
};
