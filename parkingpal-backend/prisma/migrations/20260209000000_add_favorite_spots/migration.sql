-- CreateTable
CREATE TABLE "favorite_spots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_spots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_spots_userId_idx" ON "favorite_spots"("userId");

-- CreateIndex
CREATE INDEX "favorite_spots_spotId_idx" ON "favorite_spots"("spotId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_spots_userId_spotId_key" ON "favorite_spots"("userId", "spotId");
