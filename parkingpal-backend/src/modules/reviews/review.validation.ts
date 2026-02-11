import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid('Invalid booking ID'),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    comment: z.string().max(500, 'Comment must be at most 500 characters').optional(),
    tags: z.array(z.string()).optional(),
    categoryRatings: z.record(z.string(), z.number().int().min(1).max(5)).optional(),
  }),
});

export const addResponseSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    response: z.string().min(1, 'Response cannot be empty').max(500, 'Response must be at most 500 characters'),
  }),
});

export const getReviewsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  }),
  params: z.object({}).optional(),
});

export const getReviewByIdSchema = z.object({
  params: z.object({
    reviewId: z.string().uuid('Invalid review ID'),
  }),
});

export const getReviewByBookingIdSchema = z.object({
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID'),
  }),
});

export const getUserReviewsSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  }),
});

export const getSpotReviewsSchema = z.object({
  params: z.object({
    spotId: z.string().uuid('Invalid spot ID'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
  }),
});

export const canReviewBookingSchema = z.object({
  params: z.object({
    bookingId: z.string().uuid('Invalid booking ID'),
  }),
});
