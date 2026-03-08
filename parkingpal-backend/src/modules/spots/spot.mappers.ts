import { SpotType, SpotStatus, AccessType, CancellationPolicy, LocationType, DocumentType, DocumentStatus, VehicleSize } from '@prisma/client';
import type {
  SpotDTO, SpotSummaryDTO, SpotPhotoDTO, SpotDocumentDTO, SpotAvailabilityDTO,
  SpotTypeDTO, SpotStatusDTO, AccessTypeDTO, CancellationPolicyDTO, LocationTypeDTO,
  DocumentTypeDTO, DocumentStatusDTO, AmenityTypeDTO,
} from '@parkingpal/shared-types';
import { SpotWithRelations } from '../../interfaces/ISpotRepository';

// ==========================================
// Prisma → DTO enum converters
// ==========================================

const PRISMA_TO_DTO_SPOT_TYPE: Record<SpotType, SpotTypeDTO> = {
  DRIVEWAY: 'driveway',
  GARAGE: 'garage',
  COVERED: 'covered',
  LOT: 'lot',
  UNDERGROUND: 'underground',
  STREET: 'street',
};

const DTO_TO_PRISMA_SPOT_TYPE: Record<SpotTypeDTO, SpotType> = {
  driveway: 'DRIVEWAY',
  garage: 'GARAGE',
  covered: 'COVERED',
  lot: 'LOT',
  underground: 'UNDERGROUND',
  street: 'STREET',
};

const PRISMA_TO_DTO_SPOT_STATUS: Record<SpotStatus, SpotStatusDTO> = {
  DRAFT: 'draft',
  PENDING_VERIFICATION: 'pending_verification',
  UNDER_REVIEW: 'under_review',
  ACTIVE: 'active',
  PAUSED: 'paused',
  REJECTED: 'rejected',
  DELETED: 'deleted',
};

const PRISMA_TO_DTO_ACCESS_TYPE: Record<AccessType, AccessTypeDTO> = {
  CODE: 'code',
  KEY: 'key',
  SMART_LOCK: 'smart_lock',
  REMOTE: 'remote',
  BADGE: 'badge',
  OPEN: 'open',
};

const DTO_TO_PRISMA_ACCESS_TYPE: Record<AccessTypeDTO, AccessType> = {
  code: 'CODE',
  key: 'KEY',
  smart_lock: 'SMART_LOCK',
  remote: 'REMOTE',
  badge: 'BADGE',
  open: 'OPEN',
};

const PRISMA_TO_DTO_CANCELLATION: Record<CancellationPolicy, CancellationPolicyDTO> = {
  FLEXIBLE: 'flexible',
  MODERATE: 'moderate',
  STRICT: 'strict',
  NON_REFUNDABLE: 'non_refundable',
};

const DTO_TO_PRISMA_CANCELLATION: Record<CancellationPolicyDTO, CancellationPolicy> = {
  flexible: 'FLEXIBLE',
  moderate: 'MODERATE',
  strict: 'STRICT',
  non_refundable: 'NON_REFUNDABLE',
};

const PRISMA_TO_DTO_LOCATION_TYPE: Record<LocationType, LocationTypeDTO> = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  PUBLIC: 'public',
};

const DTO_TO_PRISMA_LOCATION_TYPE: Record<LocationTypeDTO, LocationType> = {
  residential: 'RESIDENTIAL',
  commercial: 'COMMERCIAL',
  public: 'PUBLIC',
};

const PRISMA_TO_DTO_DOC_TYPE: Record<DocumentType, DocumentTypeDTO> = {
  PROPERTY_TAX: 'property_tax',
  RENTAL_AGREEMENT: 'rental_agreement',
  PARKING_DEED: 'parking_deed',
  MANAGEMENT_AUTH: 'management_auth',
  BUSINESS_LEASE: 'business_lease',
  UTILITY_BILL: 'utility_bill',
  LANDLORD_PERMISSION: 'landlord_permission',
};

const DTO_TO_PRISMA_DOC_TYPE: Record<DocumentTypeDTO, DocumentType> = {
  property_tax: 'PROPERTY_TAX',
  rental_agreement: 'RENTAL_AGREEMENT',
  parking_deed: 'PARKING_DEED',
  management_auth: 'MANAGEMENT_AUTH',
  business_lease: 'BUSINESS_LEASE',
  utility_bill: 'UTILITY_BILL',
  landlord_permission: 'LANDLORD_PERMISSION',
};

const PRISMA_TO_DTO_DOC_STATUS: Record<DocumentStatus, DocumentStatusDTO> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const PRISMA_TO_DTO_VEHICLE_SIZE: Record<VehicleSize, string> = {
  COMPACT: 'compact',
  SEDAN: 'sedan',
  SUV: 'suv',
  VAN: 'van',
  MOTORCYCLE: 'motorcycle',
};

const DTO_TO_PRISMA_VEHICLE_SIZE: Record<string, VehicleSize> = {
  compact: 'COMPACT',
  sedan: 'SEDAN',
  suv: 'SUV',
  van: 'VAN',
  motorcycle: 'MOTORCYCLE',
};

// ==========================================
// Public converter functions
// ==========================================

export function dtoSpotTypeToPrisma(type: SpotTypeDTO): SpotType {
  return DTO_TO_PRISMA_SPOT_TYPE[type];
}

export function dtoAccessTypeToPrisma(type: AccessTypeDTO | string): AccessType {
  // Handle mobile app's "trust" type which maps to "open"
  if (type === 'trust') {
    return 'OPEN';
  }
  return DTO_TO_PRISMA_ACCESS_TYPE[type as AccessTypeDTO] ?? 'OPEN';
}

export function dtoCancellationToPrisma(policy: CancellationPolicyDTO): CancellationPolicy {
  return DTO_TO_PRISMA_CANCELLATION[policy];
}

export function dtoLocationTypeToPrisma(type: LocationTypeDTO): LocationType {
  return DTO_TO_PRISMA_LOCATION_TYPE[type];
}

export function dtoDocTypeToPrisma(type: DocumentTypeDTO): DocumentType {
  return DTO_TO_PRISMA_DOC_TYPE[type];
}

export function dtoVehicleSizeToPrisma(size: string): VehicleSize {
  return DTO_TO_PRISMA_VEHICLE_SIZE[size] ?? 'SEDAN';
}

export function prismaVehicleSizeToDTO(size: VehicleSize): string {
  return PRISMA_TO_DTO_VEHICLE_SIZE[size] ?? 'sedan';
}

// ==========================================
// Model → DTO mappers
// ==========================================

interface SpotMapperOptions {
  viewerId?: string;  // The user viewing the spot (for calculating canBook)
}

export function toSpotDTO(spot: SpotWithRelations, options?: SpotMapperOptions): SpotDTO {
  const viewerId = options?.viewerId;
  const isOwnSpot = viewerId ? spot.hostId === viewerId : undefined;

  // Calculate canBook and reason
  let canBook: boolean | undefined;
  let canBookReason: string | undefined;

  if (viewerId) {
    if (isOwnSpot) {
      canBook = false;
      canBookReason = 'You cannot book your own spot';
    } else if (spot.status !== 'ACTIVE') {
      canBook = false;
      canBookReason = 'This spot is not currently available';
    } else {
      canBook = true;
    }
  }

  return {
    id: spot.id,
    hostId: spot.hostId,
    title: spot.title,
    description: spot.description,
    address: spot.address,
    city: spot.city,
    postalCode: spot.postalCode,
    country: spot.country,
    latitude: spot.latitude,
    longitude: spot.longitude,
    spotType: PRISMA_TO_DTO_SPOT_TYPE[spot.spotType],
    locationType: PRISMA_TO_DTO_LOCATION_TYPE[spot.locationType],
    capacity: spot.capacity,
    vehicleSizes: spot.vehicleSizes.map((s) => PRISMA_TO_DTO_VEHICLE_SIZE[s] ?? 'sedan'),
    amenities: spot.amenities as AmenityTypeDTO[],
    accessType: PRISMA_TO_DTO_ACCESS_TYPE[spot.accessType],
    accessInstructions: spot.accessInstructions,
    spotLocation: spot.spotLocation ?? undefined,
    hourlyRate: spot.hourlyRate,
    dailyRate: spot.dailyRate ?? undefined,
    weeklyRate: spot.weeklyRate ?? undefined,
    monthlyRate: spot.monthlyRate ?? undefined,
    houseRules: spot.houseRules ?? undefined,
    cancellationPolicy: PRISMA_TO_DTO_CANCELLATION[spot.cancellationPolicy],
    instantBook: spot.instantBook,
    minBookingMinutes: spot.minBookingMinutes,
    maxBookingMinutes: spot.maxBookingMinutes ?? undefined,
    advanceNoticeMinutes: spot.advanceNoticeMinutes,
    bookingWindowDays: spot.bookingWindowDays,
    status: PRISMA_TO_DTO_SPOT_STATUS[spot.status],
    rating: spot.rating,
    reviewCount: spot.reviewCount,
    photos: spot.photos.map(toSpotPhotoDTO),
    availability: spot.availability.map(toSpotAvailabilityDTO),
    createdAt: spot.createdAt.toISOString(),
    updatedAt: spot.updatedAt.toISOString(),
    // User context flags
    isOwnSpot,
    canBook,
    canBookReason,
  };
}

export function toSpotSummaryDTO(spot: SpotWithRelations): SpotSummaryDTO {
  const primaryPhoto = spot.photos.find((p) => p.isPrimary) ?? spot.photos[0];
  return {
    id: spot.id,
    title: spot.title,
    address: spot.address,
    city: spot.city,
    latitude: spot.latitude,
    longitude: spot.longitude,
    spotType: PRISMA_TO_DTO_SPOT_TYPE[spot.spotType],
    hourlyRate: spot.hourlyRate,
    rating: spot.rating,
    reviewCount: spot.reviewCount,
    primaryPhoto: primaryPhoto?.url,
    status: PRISMA_TO_DTO_SPOT_STATUS[spot.status],
    instantBook: spot.instantBook,
  };
}

function toSpotPhotoDTO(photo: SpotWithRelations['photos'][number]): SpotPhotoDTO {
  return {
    id: photo.id,
    url: photo.url,
    caption: photo.caption ?? undefined,
    sortOrder: photo.sortOrder,
    isPrimary: photo.isPrimary,
  };
}

export function toSpotDocumentDTO(doc: SpotWithRelations['documents'][number]): SpotDocumentDTO {
  return {
    id: doc.id,
    type: PRISMA_TO_DTO_DOC_TYPE[doc.type],
    url: doc.url,
    status: PRISMA_TO_DTO_DOC_STATUS[doc.status],
    rejectionReason: doc.rejectionReason ?? undefined,
    createdAt: doc.createdAt.toISOString(),
  };
}

function toSpotAvailabilityDTO(slot: SpotWithRelations['availability'][number]): SpotAvailabilityDTO {
  return {
    id: slot.id,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isAllDay: slot.isAllDay,
  };
}
