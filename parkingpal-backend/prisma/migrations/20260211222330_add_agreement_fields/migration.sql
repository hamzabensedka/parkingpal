/*
  Warnings:

  - The values [BOTH] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('RENTER', 'HOST', 'SUPERHOST');
ALTER TABLE "users" ALTER COLUMN "userType" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "userType" TYPE "UserType_new" USING ("userType"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
ALTER TABLE "users" ALTER COLUMN "userType" SET DEFAULT 'RENTER';
COMMIT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "agreedToTermsAt" TIMESTAMP(3),
ADD COLUMN     "agreedToTermsIp" TEXT,
ADD COLUMN     "checkInAt" TIMESTAMP(3),
ADD COLUMN     "checkInPhoto" TEXT,
ADD COLUMN     "checkOutAt" TIMESTAMP(3),
ADD COLUMN     "disputeWindowEnds" TIMESTAMP(3),
ADD COLUMN     "hostPayout" DOUBLE PRECISION,
ADD COLUMN     "payoutAt" TIMESTAMP(3),
ADD COLUMN     "platformFee" DOUBLE PRECISION,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeTransferId" TEXT;

-- AlterTable
ALTER TABLE "spots" ADD COLUMN     "agreedToTermsAt" TIMESTAMP(3),
ADD COLUMN     "agreedToTermsIp" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phoneVerificationCode" TEXT,
ADD COLUMN     "phoneVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "stripeConnectAccountId" TEXT,
ADD COLUMN     "stripeConnectOnboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeCustomerId" TEXT;
