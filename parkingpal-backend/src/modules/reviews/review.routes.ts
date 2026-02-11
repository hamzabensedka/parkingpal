import { Router } from 'express';
import { ReviewController } from './review.controller';
import { validate } from '../../middleware/validate';
import {
  createReviewSchema,
  addResponseSchema,
  getReviewByIdSchema,
  getReviewByBookingIdSchema,
  getUserReviewsSchema,
  getSpotReviewsSchema,
  canReviewBookingSchema,
  getReviewsQuerySchema,
} from './review.validation';

export function createReviewRoutes(
  reviewController: ReviewController,
  authenticate: any
): Router {
  const router = Router();

  // Create a review (authenticated)
  router.post(
    '/',
    authenticate,
    validate(createReviewSchema),
    reviewController.createReview
  );

  // Get review by ID
  router.get(
    '/:reviewId',
    validate(getReviewByIdSchema),
    reviewController.getReviewById
  );

  // Get review by booking ID
  router.get(
    '/booking/:bookingId',
    validate(getReviewByBookingIdSchema),
    reviewController.getReviewByBookingId
  );

  // Get reviews for a user (reviews they received)
  router.get(
    '/user/:userId',
    validate(getUserReviewsSchema),
    reviewController.getReviewsForUser
  );

  // Get reviews by current user (reviews they gave)
  router.get(
    '/my-reviews',
    authenticate,
    validate(getReviewsQuerySchema),
    reviewController.getReviewsByUser
  );

  // Get reviews for a spot
  router.get(
    '/spot/:spotId',
    validate(getSpotReviewsSchema),
    reviewController.getReviewsForSpot
  );

  // Add host response to a review (authenticated)
  router.post(
    '/:reviewId/response',
    authenticate,
    validate(addResponseSchema),
    reviewController.addHostResponse
  );

  // Check if user can review a booking (authenticated)
  router.get(
    '/can-review/:bookingId',
    authenticate,
    validate(canReviewBookingSchema),
    reviewController.canReviewBooking
  );

  return router;
}
