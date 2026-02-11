import { Request, Response, NextFunction } from 'express';
import { ReviewService } from './review.service';

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { bookingId, rating, comment, tags, categoryRatings } = req.body;

      const review = await this.reviewService.createReview({
        bookingId,
        reviewerId: userId,
        rating,
        comment,
        tags,
        categoryRatings,
      });

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      const review = await this.reviewService.getReviewById(reviewId);

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewByBookingId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bookingId } = req.params;
      const review = await this.reviewService.getReviewByBookingId(bookingId);

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewsForUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;

      const result = await this.reviewService.getReviewsForUser(
        userId,
        Number(page) || 1,
        Number(limit) || 10
      );

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewsByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { page, limit } = req.query;

      const result = await this.reviewService.getReviewsByUser(
        userId,
        Number(page) || 1,
        Number(limit) || 10
      );

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  getReviewsForSpot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { spotId } = req.params;
      const { page, limit } = req.query;

      const result = await this.reviewService.getReviewsForSpot(
        spotId,
        Number(page) || 1,
        Number(limit) || 10
      );

      res.status(200).json({
        success: true,
        data: result.reviews,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  addHostResponse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { reviewId } = req.params;
      const { response } = req.body;

      const review = await this.reviewService.addHostResponse(reviewId, userId, response);

      res.status(200).json({
        success: true,
        message: 'Response added successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  };

  canReviewBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { bookingId } = req.params;

      const canReview = await this.reviewService.canUserReviewBooking(userId, bookingId);

      res.status(200).json({
        success: true,
        data: { canReview },
      });
    } catch (error) {
      next(error);
    }
  };
}
