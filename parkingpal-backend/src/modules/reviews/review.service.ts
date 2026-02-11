import { IReviewRepository } from '../../interfaces/IReviewRepository';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { ISpotRepository } from '../../interfaces/ISpotRepository';
import { IBookingRepository } from '../../interfaces/IBookingRepository';
import { BookingStatus } from '@prisma/client';

export interface CreateReviewDTO {
  bookingId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  tags?: string[];
  categoryRatings?: Record<string, number>;
}

export interface UpdateReviewResponseDTO {
  reviewId: string;
  response: string;
}

export class ReviewService {
  constructor(
    private reviewRepository: IReviewRepository,
    private userRepository: IUserRepository,
    private spotRepository: ISpotRepository,
    private bookingRepository: IBookingRepository
  ) {}

  async createReview(data: CreateReviewDTO) {
    const { bookingId, reviewerId, rating, comment, tags, categoryRatings } = data;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Get booking details
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if booking is completed
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new Error('Can only review completed bookings');
    }

    // Check if user is part of the booking
    const isRenter = booking.renterId === reviewerId;
    const isHost = booking.hostId === reviewerId;

    if (!isRenter && !isHost) {
      throw new Error('You can only review bookings you participated in');
    }

    // Check if review already exists
    const existingReview = await this.reviewRepository.findByBookingId(bookingId);
    if (existingReview) {
      throw new Error('Review already exists for this booking');
    }

    // Determine reviewee (the person being reviewed)
    const revieweeId = isRenter ? booking.hostId : booking.renterId;
    const spotId = isRenter ? booking.spotId : null; // Only renters review spots

    // Create the review
    const review = await this.reviewRepository.create({
      booking: { connect: { id: bookingId } },
      reviewer: { connect: { id: reviewerId } },
      reviewee: { connect: { id: revieweeId } },
      ...(spotId && { spot: { connect: { id: spotId } } }),
      rating,
      comment: comment || null,
      tags: tags || [],
      categoryRatings: categoryRatings || null,
    });

    // Update reviewee's rating and review count
    await this.updateUserRating(revieweeId);

    // If reviewing a spot, update spot rating
    if (spotId) {
      await this.updateSpotRating(spotId);
    }

    return review;
  }

  async getReviewById(reviewId: string) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    return review;
  }

  async getReviewByBookingId(bookingId: string) {
    return this.reviewRepository.findByBookingId(bookingId);
  }

  async getReviewsForUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const reviews = await this.reviewRepository.findByRevieweeId(userId, {
      skip,
      take: limit,
    });
    const total = await this.reviewRepository.countReviewsForUser(userId);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReviewsByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const reviews = await this.reviewRepository.findByReviewerId(userId, {
      skip,
      take: limit,
    });

    return {
      reviews,
      pagination: {
        page,
        limit,
        total: reviews.length,
      },
    };
  }

  async getReviewsForSpot(spotId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const reviews = await this.reviewRepository.findBySpotId(spotId, {
      skip,
      take: limit,
    });
    const total = await this.reviewRepository.countReviewsForSpot(spotId);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addHostResponse(reviewId: string, hostId: string, response: string) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    // Verify that the user is the host being reviewed
    if (review.revieweeId !== hostId) {
      throw new Error('Only the reviewed host can respond to this review');
    }

    // Check if response already exists
    if (review.response) {
      throw new Error('Response already exists for this review');
    }

    return this.reviewRepository.update(reviewId, {
      response,
      respondedAt: new Date(),
    });
  }

  async canUserReviewBooking(userId: string, bookingId: string): Promise<boolean> {
    return this.reviewRepository.canUserReviewBooking(userId, bookingId);
  }

  private async updateUserRating(userId: string) {
    const averageRating = await this.reviewRepository.getAverageRatingForUser(userId);
    const reviewCount = await this.reviewRepository.countReviewsForUser(userId);

    await this.userRepository.update(userId, {
      rating: averageRating,
      reviewCount,
    });
  }

  private async updateSpotRating(spotId: string) {
    const averageRating = await this.reviewRepository.getAverageRatingForSpot(spotId);
    const reviewCount = await this.reviewRepository.countReviewsForSpot(spotId);

    await this.spotRepository.update(spotId, {
      rating: averageRating,
      reviewCount,
    });
  }
}
