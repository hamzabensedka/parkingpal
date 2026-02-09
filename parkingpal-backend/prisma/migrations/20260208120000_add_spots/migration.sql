-- CreateEnum
CREATE TYPE "SpotType" AS ENUM ('DRIVEWAY', 'GARAGE', 'COVERED', 'LOT', 'UNDERGROUND');

-- CreateEnum
CREATE TYPE "SpotStatus" AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'UNDER_REVIEW', 'ACTIVE', 'PAUSED', 'REJECTED', 'DELETED');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('CODE', 'KEY', 'SMART_LOCK', 'REMOTE', 'BADGE', 'OPEN');

-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('FLEXIBLE', 'MODERATE', 'STRICT', 'NON_REFUNDABLE');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'PUBLIC');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('PROPERTY_TAX', 'RENTAL_AGREEMENT', 'PARKING_DEED', 'MANAGEMENT_AUTH', 'BUSINESS_LEASE', 'UTILITY_BILL', 'LANDLORD_PERMISSION');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "spots" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'France',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "spotType" "SpotType" NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "vehicleSizes" "VehicleSize"[],
    "amenities" TEXT[],
    "accessType" "AccessType" NOT NULL,
    "accessInstructions" TEXT NOT NULL,
    "accessCode" TEXT,
    "spotLocation" TEXT,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "dailyRate" DOUBLE PRECISION,
    "weeklyRate" DOUBLE PRECISION,
    "monthlyRate" DOUBLE PRECISION,
    "houseRules" TEXT,
    "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'FLEXIBLE',
    "instantBook" BOOLEAN NOT NULL DEFAULT false,
    "minBookingMinutes" INTEGER NOT NULL DEFAULT 60,
    "maxBookingMinutes" INTEGER,
    "advanceNoticeMinutes" INTEGER NOT NULL DEFAULT 120,
    "bookingWindowDays" INTEGER NOT NULL DEFAULT 30,
    "status" "SpotStatus" NOT NULL DEFAULT 'DRAFT',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spot_photos" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spot_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spot_documents" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "url" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "spot_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spot_availability" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "spot_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spots_hostId_idx" ON "spots"("hostId");

-- CreateIndex
CREATE INDEX "spots_status_idx" ON "spots"("status");

-- CreateIndex
CREATE INDEX "spots_latitude_longitude_idx" ON "spots"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "spots_city_status_idx" ON "spots"("city", "status");

-- CreateIndex
CREATE INDEX "spot_photos_spotId_idx" ON "spot_photos"("spotId");

-- CreateIndex
CREATE INDEX "spot_documents_spotId_idx" ON "spot_documents"("spotId");

-- CreateIndex
CREATE INDEX "spot_availability_spotId_idx" ON "spot_availability"("spotId");

-- AddForeignKey
ALTER TABLE "spots" ADD CONSTRAINT "spots_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spot_photos" ADD CONSTRAINT "spot_photos_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "spots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spot_documents" ADD CONSTRAINT "spot_documents_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "spots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spot_availability" ADD CONSTRAINT "spot_availability_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "spots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
