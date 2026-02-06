import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:5000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.string().default('587'),
  EMAIL_USER: z.string().email().optional(),
  EMAIL_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default('ParkingPal <noreply@parkingpal.fr>'),

  // File Upload
  MAX_FILE_SIZE: z.string().default('5242880'),
  UPLOAD_DIR: z.string().default('./uploads'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('5'),
});

// Parse and validate environment variables
const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:');
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  return parsed.data;
};

const envVars = parseEnv();

// Export typed environment configuration
export const env = {
  // Server
  nodeEnv: envVars.NODE_ENV,
  port: parseInt(envVars.PORT, 10),
  appUrl: envVars.APP_URL,
  apiUrl: envVars.API_URL,
  isDevelopment: envVars.NODE_ENV === 'development',
  isProduction: envVars.NODE_ENV === 'production',
  isTest: envVars.NODE_ENV === 'test',

  // Database
  databaseUrl: envVars.DATABASE_URL,

  // JWT
  jwt: {
    secret: envVars.JWT_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },

  // Email
  email: {
    host: envVars.EMAIL_HOST,
    port: parseInt(envVars.EMAIL_PORT, 10),
    user: envVars.EMAIL_USER,
    password: envVars.EMAIL_PASSWORD,
    from: envVars.EMAIL_FROM,
  },

  // File Upload
  upload: {
    maxFileSize: parseInt(envVars.MAX_FILE_SIZE, 10),
    uploadDir: envVars.UPLOAD_DIR,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(envVars.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(envVars.RATE_LIMIT_MAX_REQUESTS, 10),
  },
} as const;

export type Env = typeof env;
