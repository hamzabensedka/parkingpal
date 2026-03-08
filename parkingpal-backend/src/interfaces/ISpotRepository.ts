/**
 * Spot Repository Interface
 * Single Responsibility: Database access for Spot entity and related models
 */
import { Spot, SpotPhoto, SpotDocument, SpotAvailability, SpotStatus, SpotType, VehicleSize, AccessType, CancellationPolicy, LocationType, DocumentType, DocumentStatus } from '@prisma/client';

// Spot with all relations eagerly loaded
export type SpotWithRelations = Spot & {
  photos: SpotPhoto[];
  documents: SpotDocument[];
  availability: SpotAvailability[];
};

export interface CreateSpotData {
  hostId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  country?: string;
  latitude: number;
  longitude: number;
  spotType: SpotType;
  locationType: LocationType;
  capacity?: number;
  vehicleSizes: VehicleSize[];
  amenities: string[];
  accessType: AccessType;
  accessInstructions: string;
  accessCode?: string;
  spotLocation?: string;
  hourlyRate: number;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  houseRules?: string;
  cancellationPolicy: CancellationPolicy;
  instantBook?: boolean;
  minBookingMinutes?: number;
  maxBookingMinutes?: number;
  advanceNoticeMinutes?: number;
  bookingWindowDays?: number;
  status?: SpotStatus;
  // Host agreement tracking
  agreedToTermsAt?: Date;
  agreedToTermsIp?: string;
}

export interface UpdateSpotData {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  spotType?: SpotType;
  locationType?: LocationType;
  capacity?: number;
  vehicleSizes?: VehicleSize[];
  amenities?: string[];
  accessType?: AccessType;
  accessInstructions?: string;
  accessCode?: string;
  spotLocation?: string;
  hourlyRate?: number;
  dailyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  houseRules?: string;
  cancellationPolicy?: CancellationPolicy;
  instantBook?: boolean;
  minBookingMinutes?: number;
  maxBookingMinutes?: number;
  advanceNoticeMinutes?: number;
  bookingWindowDays?: number;
  status?: SpotStatus;
  rating?: number;
  reviewCount?: number;
}

export interface PhotoData {
  url: string;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface DocumentData {
  type: DocumentType;
  url: string;
}

export interface UpdateDocumentStatusData {
  status: DocumentStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface AvailabilityData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number; // in km
  spotType?: SpotType;
  vehicleSize?: VehicleSize;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  instantBook?: boolean;
}

export interface ISpotRepository {
  create(data: CreateSpotData): Promise<SpotWithRelations>;
  findById(id: string): Promise<SpotWithRelations | null>;
  findByHostId(hostId: string): Promise<SpotWithRelations[]>;
  countByHostId(hostId: string): Promise<number>;
  update(id: string, hostId: string, data: UpdateSpotData): Promise<SpotWithRelations>;
  updateById(id: string, data: UpdateSpotData): Promise<SpotWithRelations>;
  delete(id: string, hostId: string): Promise<void>;
  updateStatus(id: string, status: SpotStatus): Promise<SpotWithRelations>;

  // Photos
  addPhotos(spotId: string, photos: PhotoData[]): Promise<void>;
  removePhoto(spotId: string, photoId: string): Promise<void>;
  reorderPhotos(spotId: string, photoIds: string[]): Promise<void>;

  // Documents
  addDocument(spotId: string, doc: DocumentData): Promise<SpotDocument>;
  findDocumentById(id: string): Promise<SpotDocument | null>;
  updateDocumentStatus(id: string, data: UpdateDocumentStatusData): Promise<SpotDocument>;
  findPendingDocuments(limit: number, offset: number): Promise<{ documents: SpotDocument[]; total: number }>;

  // Availability
  setAvailability(spotId: string, slots: AvailabilityData[]): Promise<void>;

  // Search
  search(params: SearchParams): Promise<{ spots: SpotWithRelations[]; total: number }>;
}
