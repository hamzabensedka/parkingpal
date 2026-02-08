-- Enable UUID generation for text IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "UserType" AS ENUM ('RENTER', 'HOST', 'BOTH');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "password" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "profilePhoto" TEXT,
  "userType" "UserType" NOT NULL DEFAULT 'RENTER',

  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "emailVerifiedAt" TIMESTAMP(3),
  "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
  "phoneVerifiedAt" TIMESTAMP(3),
  "idVerified" BOOLEAN NOT NULL DEFAULT false,
  "idVerifiedAt" TIMESTAMP(3),
  "idDocument" TEXT,

  "emailVerificationToken" TEXT,
  "emailVerificationExpires" TIMESTAMP(3),
  "passwordResetToken" TEXT,
  "passwordResetExpires" TIMESTAMP(3),
  "refreshToken" TEXT,

  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isSuspended" BOOLEAN NOT NULL DEFAULT false,
  "suspendedReason" TEXT,

  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "isSuperhost" BOOLEAN NOT NULL DEFAULT false,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastLoginAt" TIMESTAMP(3),

  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_email_key" UNIQUE ("email"),
  CONSTRAINT "users_phone_key" UNIQUE ("phone")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users"("phone");
CREATE INDEX IF NOT EXISTS "users_emailVerificationToken_idx" ON "users"("emailVerificationToken");
CREATE INDEX IF NOT EXISTS "users_passwordResetToken_idx" ON "users"("passwordResetToken");
CREATE INDEX IF NOT EXISTS "users_refreshToken_idx" ON "users"("refreshToken");
