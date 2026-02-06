import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Declare global type for prisma client (for hot reloading in development)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with logging in development
const createPrismaClient = () => {
  return new PrismaClient({
    log: env.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });
};

// Use global prisma instance in development to prevent too many connections
export const prisma = global.prisma ?? createPrismaClient();

if (env.isDevelopment) {
  global.prisma = prisma;
}

// Graceful shutdown
export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

// Connect to database
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
