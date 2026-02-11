import { PrismaClient, Review, Prisma, BookingStatus } from '@prisma/client';
import { IReviewRepository } from '../interfaces/IReviewRepository';

export class PrismaReviewRepository implements IReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prisma.review.create({
      data,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            rating: true,
            reviewCount: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            rating: true,
            reviewCount: true,
          },
        },
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            rating: true,
            reviewCount: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            rating: true,
            reviewCount: true,
          },
        },
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: { bookingId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            rating: true,
            reviewCount: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            rating: true,
            reviewCount: true,
          },
        },
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
    });
  }

  async findByReviewerId(
    reviewerId: string,
    options?: { skip?: number; take?: number }
  ): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { reviewerId },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  }

  async findByRevieweeId(
    revieweeId: string,
    options?: { skip?: number; take?: number }
  ): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { revieweeId },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  }

  async findBySpotId(
    spotId: string,
    options?: { skip?: number; take?: number }
  ): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { spotId },
      skip: options?.skip,
      take: options?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            rating: true,
            reviewCount: true,
          },
        },
        booking: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data,
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
          },
        },
        spot: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<Review> {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  async getAverageRatingForUser(userId: string): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
    });
    return result._avg.rating || 0;
  }

  async getAverageRatingForSpot(spotId: string): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { spotId },
      _avg: { rating: true },
    });
    return result._avg.rating || 0;
  }

  async countReviewsForUser(userId: string): Promise<number> {
    return this.prisma.review.count({
      where: { revieweeId: userId },
    });
  }

  async countReviewsForSpot(spotId: string): Promise<number> {
    return this.prisma.review.count({
      where: { spotId },
    });
  }

  async canUserReviewBooking(userId: string, bookingId: string): Promise<boolean> {
    // Check if booking exists and is completed
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        renterId: true,
        hostId: true,
        status: true,
        endTime: true,
      },
    });

    if (!booking) {
      return false;
    }

    // User must be either the renter or the host
    const isParticipant = booking.renterId === userId || booking.hostId === userId;
    if (!isParticipant) {
      return false;
    }

    // Booking must be completed
    if (booking.status !== BookingStatus.COMPLETED) {
      return false;
    }

    // Check if review already exists
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId },
    });

    return !existingReview;
  }
}
