import { SpotStatus, UserType } from '@prisma/client';
import type { CreateSpotRequest, UpdateSpotRequest, SearchSpotsRequest } from '@parkingpal/shared-types';
import { ISpotRepository, CreateSpotData, UpdateSpotData } from '../../interfaces/ISpotRepository';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { ApiError } from '../../middleware/errorHandler';
import { getFileUrl } from '../../middleware/upload';
import {
  toSpotDTO, toSpotSummaryDTO,
  dtoSpotTypeToPrisma, dtoAccessTypeToPrisma, dtoCancellationToPrisma,
  dtoLocationTypeToPrisma, dtoVehicleSizeToPrisma, dtoDocTypeToPrisma,
} from './spot.mappers';
import type { DocumentTypeDTO } from '@parkingpal/shared-types';

/**
 * Spot Service
 * Single Responsibility: Business logic for parking spot operations
 * Depends on ISpotRepository + IUserRepository (DIP)
 */
export class SpotService {
  constructor(
    private readonly spotRepository: ISpotRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async create(
    hostId: string,
    body: CreateSpotRequest,
    photoFiles?: Express.Multer.File[],
    documentFile?: Express.Multer.File
  ) {
    // One-listing guard: block creation if host already has a non-deleted listing
    const existingCount = await this.spotRepository.countByHostId(hostId);
    if (existingCount > 0) {
      throw ApiError.badRequest('Only one listing is allowed');
    }

    const data: CreateSpotData = {
      hostId,
      title: body.title,
      description: body.description,
      address: body.address,
      city: body.city,
      postalCode: body.postalCode,
      latitude: body.latitude,
      longitude: body.longitude,
      spotType: dtoSpotTypeToPrisma(body.spotType),
      locationType: dtoLocationTypeToPrisma(body.locationType),
      capacity: body.capacity,
      vehicleSizes: body.vehicleSizes.map(dtoVehicleSizeToPrisma),
      amenities: body.amenities ?? [],
      accessType: dtoAccessTypeToPrisma(body.accessType),
      accessInstructions: body.accessInstructions,
      spotLocation: body.spotLocation,
      hourlyRate: body.hourlyRate,
      dailyRate: body.dailyRate,
      weeklyRate: body.weeklyRate,
      monthlyRate: body.monthlyRate,
      houseRules: body.houseRules,
      cancellationPolicy: dtoCancellationToPrisma(body.cancellationPolicy),
      instantBook: body.instantBook,
      minBookingMinutes: body.minBookingMinutes,
      maxBookingMinutes: body.maxBookingMinutes,
      advanceNoticeMinutes: body.advanceNoticeMinutes,
      bookingWindowDays: body.bookingWindowDays,
      status: SpotStatus.PENDING_VERIFICATION,
    };

    const spot = await this.spotRepository.create(data);

    // Upload photos if provided
    if (photoFiles && photoFiles.length > 0) {
      const photos = photoFiles.map((file, index) => ({
        url: getFileUrl(file.filename),
        sortOrder: index,
        isPrimary: index === 0,
      }));
      await this.spotRepository.addPhotos(spot.id, photos);
    }

    // Upload ownership document if provided
    if (documentFile) {
      await this.spotRepository.addDocument(spot.id, {
        type: 'PROPERTY_TAX',
        url: getFileUrl(documentFile.filename),
      });
    }

    // Set availability
    if (body.availability && body.availability.length > 0) {
      await this.spotRepository.setAvailability(spot.id, body.availability);
    }

    // Upgrade renter → host after successful first listing
    const user = await this.userRepository.findById(hostId);
    if (user && user.userType === UserType.RENTER) {
      await this.userRepository.update(hostId, { userType: UserType.HOST });
    }

    // Re-fetch to get all relations
    const fullSpot = await this.spotRepository.findById(spot.id);
    return toSpotDTO(fullSpot!);
  }

  async getById(spotId: string, requesterId?: string) {
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || spot.status === SpotStatus.DELETED) {
      throw ApiError.notFound('Spot not found');
    }

    // Non-owners can only see ACTIVE spots
    if (spot.hostId !== requesterId && spot.status !== SpotStatus.ACTIVE) {
      throw ApiError.notFound('Spot not found');
    }

    return toSpotDTO(spot);
  }

  async getMyListings(hostId: string) {
    const spots = await this.spotRepository.findByHostId(hostId);
    return spots.map(toSpotSummaryDTO);
  }

  async update(hostId: string, spotId: string, body: UpdateSpotRequest) {
    try {
      const data: UpdateSpotData = {};

      if (body.title !== undefined) data.title = body.title;
      if (body.description !== undefined) data.description = body.description;
      if (body.address !== undefined) data.address = body.address;
      if (body.city !== undefined) data.city = body.city;
      if (body.postalCode !== undefined) data.postalCode = body.postalCode;
      if (body.latitude !== undefined) data.latitude = body.latitude;
      if (body.longitude !== undefined) data.longitude = body.longitude;
      if (body.spotType !== undefined) data.spotType = dtoSpotTypeToPrisma(body.spotType);
      if (body.locationType !== undefined) data.locationType = dtoLocationTypeToPrisma(body.locationType);
      if (body.capacity !== undefined) data.capacity = body.capacity;
      if (body.vehicleSizes !== undefined) data.vehicleSizes = body.vehicleSizes.map(dtoVehicleSizeToPrisma);
      if (body.amenities !== undefined) data.amenities = body.amenities;
      if (body.accessType !== undefined) data.accessType = dtoAccessTypeToPrisma(body.accessType);
      if (body.accessInstructions !== undefined) data.accessInstructions = body.accessInstructions;
      if (body.spotLocation !== undefined) data.spotLocation = body.spotLocation;
      if (body.hourlyRate !== undefined) data.hourlyRate = body.hourlyRate;
      if (body.dailyRate !== undefined) data.dailyRate = body.dailyRate;
      if (body.weeklyRate !== undefined) data.weeklyRate = body.weeklyRate;
      if (body.monthlyRate !== undefined) data.monthlyRate = body.monthlyRate;
      if (body.houseRules !== undefined) data.houseRules = body.houseRules;
      if (body.cancellationPolicy !== undefined) data.cancellationPolicy = dtoCancellationToPrisma(body.cancellationPolicy);
      if (body.instantBook !== undefined) data.instantBook = body.instantBook;
      if (body.minBookingMinutes !== undefined) data.minBookingMinutes = body.minBookingMinutes;
      if (body.maxBookingMinutes !== undefined) data.maxBookingMinutes = body.maxBookingMinutes;
      if (body.advanceNoticeMinutes !== undefined) data.advanceNoticeMinutes = body.advanceNoticeMinutes;
      if (body.bookingWindowDays !== undefined) data.bookingWindowDays = body.bookingWindowDays;

      // Re-trigger verification if address changes
      if (body.address !== undefined || body.city !== undefined || body.postalCode !== undefined) {
        data.status = SpotStatus.PENDING_VERIFICATION;
      }

      const spot = await this.spotRepository.update(spotId, hostId, data);

      // Update availability if provided
      if (body.availability) {
        await this.spotRepository.setAvailability(spotId, body.availability);
      }

      // Re-fetch to get updated availability
      const fullSpot = await this.spotRepository.findById(spotId);
      return toSpotDTO(fullSpot!);
    } catch (e) {
      if (e instanceof Error && e.message === 'SPOT_NOT_FOUND') {
        throw ApiError.notFound('Spot not found');
      }
      throw e;
    }
  }

  async delete(hostId: string, spotId: string) {
    try {
      await this.spotRepository.delete(spotId, hostId);
      
      // Check if host has any remaining listings
      const remainingCount = await this.spotRepository.countByHostId(hostId);
      if (remainingCount === 0) {
        // Revert host → renter when all listings are deleted
        const user = await this.userRepository.findById(hostId);
        if (user && user.userType === UserType.HOST && !user.isSuperhost) {
          await this.userRepository.update(hostId, { userType: UserType.RENTER });
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message === 'SPOT_NOT_FOUND') {
        throw ApiError.notFound('Spot not found');
      }
      throw e;
    }
  }

  async pause(hostId: string, spotId: string) {
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || spot.status === SpotStatus.DELETED || spot.hostId !== hostId) {
      throw ApiError.notFound('Spot not found');
    }
    if (spot.status !== SpotStatus.ACTIVE) {
      throw ApiError.badRequest('Only active spots can be paused');
    }

    const updated = await this.spotRepository.updateStatus(spotId, SpotStatus.PAUSED);
    return toSpotDTO(updated);
  }

  async activate(hostId: string, spotId: string) {
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || spot.status === SpotStatus.DELETED || spot.hostId !== hostId) {
      throw ApiError.notFound('Spot not found');
    }
    // In production this should be gated by verification/review.
    // For MVP/dev UX, allow the host to activate their listing from common non-active states.
    if (spot.status === SpotStatus.REJECTED) {
      throw ApiError.badRequest('Rejected spots cannot be activated');
    }
    if (spot.status === SpotStatus.ACTIVE) {
      return toSpotDTO(spot);
    }

    const updated = await this.spotRepository.updateStatus(spotId, SpotStatus.ACTIVE);
    return toSpotDTO(updated);
  }

  async addPhotos(hostId: string, spotId: string, files: Express.Multer.File[]) {
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || spot.status === SpotStatus.DELETED || spot.hostId !== hostId) {
      throw ApiError.notFound('Spot not found');
    }

    const existingCount = spot.photos.length;
    if (existingCount + files.length > 10) {
      throw ApiError.badRequest('Maximum 10 photos allowed per spot');
    }

    const photos = files.map((file, index) => ({
      url: getFileUrl(file.filename),
      sortOrder: existingCount + index,
      isPrimary: existingCount === 0 && index === 0,
    }));

    await this.spotRepository.addPhotos(spotId, photos);

    const updated = await this.spotRepository.findById(spotId);
    return toSpotDTO(updated!);
  }

  async removePhoto(hostId: string, spotId: string, photoId: string) {
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || spot.status === SpotStatus.DELETED || spot.hostId !== hostId) {
      throw ApiError.notFound('Spot not found');
    }

    try {
      await this.spotRepository.removePhoto(spotId, photoId);
    } catch (e) {
      if (e instanceof Error && e.message === 'PHOTO_NOT_FOUND') {
        throw ApiError.notFound('Photo not found');
      }
      throw e;
    }

    const updated = await this.spotRepository.findById(spotId);
    return toSpotDTO(updated!);
  }

  async uploadDocument(hostId: string, spotId: string, file: Express.Multer.File, type: DocumentTypeDTO) {
    const spot = await this.spotRepository.findById(spotId);
    if (!spot || spot.status === SpotStatus.DELETED || spot.hostId !== hostId) {
      throw ApiError.notFound('Spot not found');
    }

    const doc = await this.spotRepository.addDocument(spotId, {
      type: dtoDocTypeToPrisma(type),
      url: getFileUrl(file.filename),
    });

    const updated = await this.spotRepository.findById(spotId);
    return toSpotDTO(updated!);
  }

  async search(params: SearchSpotsRequest) {
    const searchParams = {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius ?? 5,
      spotType: params.spotType ? dtoSpotTypeToPrisma(params.spotType) : undefined,
      vehicleSize: params.vehicleSize ? dtoVehicleSizeToPrisma(params.vehicleSize) : undefined,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      amenities: params.amenities,
      instantBook: params.instantBook,
    };

    const result = await this.spotRepository.search(searchParams);
    return {
      spots: result.spots.map(toSpotSummaryDTO),
      total: result.total,
    };
  }
}
