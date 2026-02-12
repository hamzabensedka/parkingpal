import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';
import { HTTP_STATUS } from '../../config/constants';
import type { CreateBookingSchemaType, CancelBookingSchemaType, ListBookingsSchemaType, CheckInSchemaType } from './booking.validation';

export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract client IP for agreement tracking
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.socket.remoteAddress
        || 'unknown';

      const booking = await this.bookingService.create(req.user!.id, req.body as CreateBookingSchemaType, clientIp);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Booking created successfully',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await this.bookingService.getById(req.params.id, req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Booking retrieved',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListBookingsSchemaType;
      const bookings = await this.bookingService.getMyBookings(req.user!.id, query.role, query.status);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Bookings retrieved',
        data: { bookings },
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CancelBookingSchemaType;
      const booking = await this.bookingService.cancel(req.params.id, req.user!.id, body.reason);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Booking cancelled',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await this.bookingService.confirm(req.params.id, req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Booking confirmed',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  async complete(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await this.bookingService.complete(req.params.id, req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Booking completed',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CheckInSchemaType;
      const booking = await this.bookingService.checkIn(req.params.id, req.user!.id, body.photoUrl);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Checked in successfully',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await this.bookingService.checkOut(req.params.id, req.user!.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Checked out successfully',
        data: { booking },
      });
    } catch (error) {
      next(error);
    }
  }
}
