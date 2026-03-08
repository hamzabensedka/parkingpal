import { VehicleSize } from '@prisma/client';

/**
 * Vehicle size hierarchy (smallest to largest)
 * A smaller vehicle can always fit in a spot that accepts larger sizes
 */
const VEHICLE_SIZE_ORDER: VehicleSize[] = [
  VehicleSize.MOTORCYCLE,
  VehicleSize.COMPACT,
  VehicleSize.SEDAN,
  VehicleSize.SUV,
  VehicleSize.VAN,
];

/**
 * Get the numeric rank of a vehicle size (lower = smaller)
 */
export function getVehicleSizeRank(size: VehicleSize): number {
  return VEHICLE_SIZE_ORDER.indexOf(size);
}

/**
 * Check if a vehicle can fit in a spot based on size compatibility
 * A vehicle can fit if the spot accepts its size OR any larger size
 *
 * @param vehicleSize - The size of the vehicle trying to park
 * @param acceptedSizes - Array of sizes the spot accepts
 * @returns true if the vehicle can fit
 */
export function canVehicleFitInSpot(
  vehicleSize: VehicleSize,
  acceptedSizes: VehicleSize[]
): boolean {
  if (acceptedSizes.length === 0) return false;

  const vehicleRank = getVehicleSizeRank(vehicleSize);

  // Vehicle can fit if spot accepts its exact size OR any larger size
  return acceptedSizes.some(acceptedSize => {
    const acceptedRank = getVehicleSizeRank(acceptedSize);
    return vehicleRank <= acceptedRank;
  });
}

/**
 * Get all vehicle sizes that can fit in spots accepting the given sizes
 * Used for filtering search results
 *
 * @param acceptedSizes - Array of sizes the spot accepts
 * @returns Array of vehicle sizes that can fit
 */
export function getCompatibleVehicleSizes(acceptedSizes: VehicleSize[]): VehicleSize[] {
  if (acceptedSizes.length === 0) return [];

  // Find the largest accepted size
  const maxRank = Math.max(...acceptedSizes.map(getVehicleSizeRank));

  // All sizes up to and including the max can fit
  return VEHICLE_SIZE_ORDER.filter((_, index) => index <= maxRank);
}

/**
 * Get all spot sizes that can accommodate a given vehicle size
 * Used for search filtering
 *
 * @param vehicleSize - The size of the vehicle
 * @returns Array of acceptable spot sizes (same size or larger)
 */
export function getAcceptableSpotsForVehicle(vehicleSize: VehicleSize): VehicleSize[] {
  const vehicleRank = getVehicleSizeRank(vehicleSize);
  return VEHICLE_SIZE_ORDER.filter((_, index) => index >= vehicleRank);
}
