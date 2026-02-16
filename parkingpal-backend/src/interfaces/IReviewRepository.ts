import { Review, Prisma } from '@prisma/client';

export interface IReviewRepository {
  // Create a review
  create(data: Prisma.ReviewCreateInput): Promise<Review>;

  // Find review by ID
  findById(id: string): Promise<Review | null>;

  // Find review by booking ID
  findByBookingId(bookingId: string): Promise<Review | null>;

  // Find reviews by reviewer (user who left the review)
  findByReviewerId(reviewerId: string, options?: {
    skip?: number;
    take?: number;
  }): Promise<Review[]>;

  // Find reviews by reviewee (user being reviewed)
  findByRevieweeId(revieweeId: string, options?: {
    skip?: number;
    take?: number;
  }): Promise<{ reviews: Review[]; total: number }>;

  // Find reviews for a spot
  findBySpotId(spotId: string, options?: {
    skip?: number;
    take?: number;
  }): Promise<{ reviews: Review[]; total: number }>;

  // Update a review
  update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review>;

  // Delete a review
  delete(id: string): Promise<Review>;

  // Get average rating for a user
  getAverageRatingForUser(userId: string): Promise<number>;

  // Get average rating for a spot
  getAverageRatingForSpot(spotId: string): Promise<number>;

  // Count reviews for a user
  countReviewsForUser(userId: string): Promise<number>;

  // Count reviews for a spot
  countReviewsForSpot(spotId: string): Promise<number>;

  // Check if user can review a booking
  canUserReviewBooking(userId: string, bookingId: string): Promise<boolean>;
}
