import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes, { userRouter } from './modules/auth/auth.routes';
import spotRoutes from './modules/spots/spot.routes';
import bookingRoutes from './modules/bookings/booking.routes';
import { createReviewRoutes } from './modules/reviews/review.routes';
import paymentRoutes from './modules/payments/payment.routes';
import legalRoutes from './modules/legal/legal.routes';
import messageRoutes from './modules/messaging/message.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import earningsRoutes from './modules/earnings/earnings.routes';
import webhookRoutes from './modules/webhooks/webhook.routes';
import safetyRoutes from './modules/safety/safety.routes';
import { reviewController, authenticate } from './container';

// Create Express application
const app: Application = express();

// ==========================================
// Security Middleware
// ==========================================

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded files
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:8081', // Expo development
      'http://localhost:19006', // Expo web
      env.appUrl,
      'https://parkingpal.app',
      'https://www.parkingpal.app',
      'https://api.parkingpal.fr',
    ];

    if (allowedOrigins.includes(origin) || env.isDevelopment) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ==========================================
// Webhook Routes (BEFORE body parsing!)
// ==========================================

/**
 * CRITICAL: Webhook routes MUST be registered BEFORE express.json()
 * Stripe signature verification requires raw body (Buffer), not parsed JSON
 * The webhook route uses express.raw() internally
 */
app.use('/api/webhooks', webhookRoutes);

// ==========================================
// Body Parsing
// ==========================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// Static Files (Uploads)
// ==========================================

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ==========================================
// Rate Limiting
// ==========================================

app.use(generalLimiter);

// ==========================================
// Health Check
// ==========================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ParkingPal API is running',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
  });
});

// ==========================================
// API Routes
// ==========================================

// Authentication routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRouter);

// Spot routes
app.use('/api/spots', spotRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// Review routes
app.use('/api/reviews', createReviewRoutes(reviewController, authenticate));

// Payment routes
app.use('/api/payments', paymentRoutes);

// Legal documents routes (public, no auth required)
app.use('/api/legal', legalRoutes);

// Messaging routes
app.use('/api', messageRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Earnings routes (host earnings dashboard)
app.use('/api/earnings', earningsRoutes);

// Safety routes (reporting and blocking)
app.use('/api/safety', safetyRoutes);

// ==========================================
// Error Handling
// ==========================================

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
