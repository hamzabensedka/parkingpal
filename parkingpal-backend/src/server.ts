import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

// Server instance
let server: ReturnType<typeof app.listen>;

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    // Bind to 0.0.0.0 so physical devices on LAN can reach it
    server = app.listen(env.port, '0.0.0.0', () => {
      console.log('========================================');
      console.log('  ParkingPal Authentication API');
      console.log('========================================');
      console.log(`  Environment: ${env.nodeEnv}`);
      console.log(`  Server:      http://localhost:${env.port}`);
      console.log(`  Health:      http://localhost:${env.port}/health`);
      console.log('========================================');
      console.log('');
      console.log('Available endpoints:');
      console.log('  POST   /api/auth/register');
      console.log('  POST   /api/auth/login');
      console.log('  POST   /api/auth/logout');
      console.log('  POST   /api/auth/refresh');
      console.log('  POST   /api/auth/verify-email');
      console.log('  POST   /api/auth/forgot-password');
      console.log('  POST   /api/auth/reset-password');
      console.log('  GET    /api/auth/me');
      console.log('  GET    /api/users/profile');
      console.log('  PUT    /api/users/profile');
      console.log('  POST   /api/users/verify-id');
      console.log('  GET    /api/users/vehicles');
      console.log('  POST   /api/users/vehicles');
      console.log('  PUT    /api/users/vehicles/:id');
      console.log('  DELETE /api/users/vehicles/:id');
      console.log('  POST   /api/users/vehicles/:id/default');
      console.log('  GET    /api/users/payment-methods');
      console.log('  POST   /api/users/payment-methods');
      console.log('  DELETE /api/users/payment-methods/:id');
      console.log('  POST   /api/users/payment-methods/:id/default');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed');

      // Disconnect from database
      await disconnectDatabase();
      console.log('Database connection closed');

      process.exit(0);
    });

    // Force close after timeout
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();
