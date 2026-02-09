import { Router } from 'express';
import { bookingController, authenticate } from '../../container';
import { requireUserType } from '../../middleware/authenticate';
import { validate, validateQuery } from '../../middleware/validate';
import { createBookingSchema, cancelBookingSchema, listBookingsSchema } from './booking.validation';

const router = Router();

// POST /api/bookings - Create a booking (renters only)
router.post(
  '/',
  authenticate,
  requireUserType('renter'),
  validate(createBookingSchema),
  bookingController.create.bind(bookingController)
);

// GET /api/bookings - List my bookings (auth required)
router.get(
  '/',
  authenticate,
  validateQuery(listBookingsSchema),
  bookingController.getMyBookings.bind(bookingController)
);

// GET /api/bookings/:id - Get booking detail (auth required)
router.get(
  '/:id',
  authenticate,
  bookingController.getById.bind(bookingController)
);

// POST /api/bookings/:id/cancel - Cancel a booking
router.post(
  '/:id/cancel',
  authenticate,
  validate(cancelBookingSchema),
  bookingController.cancel.bind(bookingController)
);

// POST /api/bookings/:id/confirm - Host confirms a pending booking
router.post(
  '/:id/confirm',
  authenticate,
  requireUserType('host'),
  bookingController.confirm.bind(bookingController)
);

// POST /api/bookings/:id/complete - Mark booking as completed
router.post(
  '/:id/complete',
  authenticate,
  bookingController.complete.bind(bookingController)
);

export default router;
