/**
 * Mappers to convert backend DTOs to mobile Spot types
 */
import type { SpotDTO, SpotSummaryDTO } from '@parkingpal/shared-types';
import type { Spot } from '../types';

/**
 * Convert SpotSummaryDTO from backend to mobile Spot type (summary version)
 */
export function mapSpotSummaryToSpot(dto: SpotSummaryDTO): Spot {
  return {
    id: dto.id,
    hostId: '', // Not included in summary
    title: dto.title,
    description: '', // Not included in summary
    address: dto.address,
    latitude: dto.latitude,
    longitude: dto.longitude,
    spotType: dto.spotType as any, // Type should be compatible
    hourlyRate: dto.hourlyRate,
    photos: dto.primaryPhoto ? [dto.primaryPhoto] : [],
    amenities: [], // Not included in summary
    vehicleSizes: [], // Not included in summary
    accessInstructions: '', // Not included in summary
    accessType: 'code' as any, // Not included in summary
    availability: {}, // Not included in summary
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    instantBook: dto.instantBook,
    createdAt: '', // Not included in summary
  };
}

/**
 * Convert full SpotDTO from backend to mobile Spot type
 */
export function mapSpotDTOToSpot(dto: SpotDTO): Spot {
  // Map photos
  const photos = dto.photos
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(p => p.url);

  // Convert availability from SpotAvailabilityDTO[] to mobile format
  const availability: Record<string, { available: boolean; timeSlots?: string[] }> = {};
  
  // For now, just mark all days according to the weekly schedule
  // Later we'll add date-specific availability checks
  dto.availability.forEach(slot => {
    // This is a simplified conversion - the real implementation would need
    // to generate actual dates based on the weekly schedule
    // For now, we'll leave this empty and add it when we implement booking flow
  });

  return {
    id: dto.id,
    hostId: dto.hostId,
    title: dto.title,
    description: dto.description,
    address: dto.address,
    latitude: dto.latitude,
    longitude: dto.longitude,
    spotType: dto.spotType as any,
    hourlyRate: dto.hourlyRate,
    dailyRate: dto.dailyRate,
    photos,
    amenities: dto.amenities as any[],
    vehicleSizes: dto.vehicleSizes as any[],
    accessInstructions: dto.accessInstructions,
    accessType: dto.accessType as any,
    accessCode: undefined, // Hide access code until booked
    houseRules: dto.houseRules,
    availability,
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    instantBook: dto.instantBook,
    createdAt: dto.createdAt,
    cancellationPolicy: dto.cancellationPolicy as any,
  };
}
