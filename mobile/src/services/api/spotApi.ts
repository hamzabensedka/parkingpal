import type { CreateSpotRequest, SpotDTO, SpotSummaryDTO, SearchSpotsRequest } from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';

export interface SpotApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function withTimeout<T>(
  promiseFactory: () => Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promiseFactory(), timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function toQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];
  const add = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  };

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => add(key, v));
    } else {
      add(key, value);
    }
  });

  return parts.join('&');
}

/**
 * Spot API – create listing, manage listings, search spots, view spot details
 * POST /api/spots expects:
 *   - field "data" : JSON-stringified CreateSpotRequest
 *   - field "photos[]" : image files (optional)
 */
export function createSpotApi(client: AxiosInstance) {
  return {
    /**
     * Create a new parking spot listing.
     * @param body  CreateSpotRequest payload
     * @param photoUris  local file:// URIs for photos
     */
    async create(body: CreateSpotRequest, photoUris: string[] = []): Promise<SpotDTO> {
      const formData = new FormData();
      formData.append('data', JSON.stringify(body));

      photoUris.forEach((uri, index) => {
        const filename = uri.split('/').pop() ?? `photo_${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('photos', {
          uri,
          name: filename,
          type,
        } as any);
      });

      const { data } = await client.post<SpotApiResponse<{ spot: SpotDTO }>>(
        '/api/spots',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000, // longer timeout for file uploads
        },
      );

      if (!data.success || !data.data?.spot) {
        throw new Error(data.error ?? 'Failed to create spot');
      }
      return data.data.spot;
    },

    /**
     * Fetch the authenticated host's listings.
     */
    async getMyListings(): Promise<SpotSummaryDTO[]> {
      const { data } = await client.get<SpotApiResponse<{ spots: SpotSummaryDTO[] }>>(
        '/api/spots/my-listings',
      );

      if (!data.success || !data.data?.spots) {
        throw new Error(data.error ?? 'Failed to fetch listings');
      }
      return data.data.spots;
    },

    /**
     * Search for parking spots near a location (for renters).
     * @param params Search parameters including lat/lng, radius, filters
     */
    async search(params: SearchSpotsRequest): Promise<{ spots: SpotSummaryDTO[]; total: number }> {
      const queryString = toQueryString({
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius,
        spotType: params.spotType,
        vehicleSize: params.vehicleSize,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        instantBook: params.instantBook,
        amenities: params.amenities,
      });

      const { data } = await withTimeout(
        () =>
          client.get<SpotApiResponse<{ spots: SpotSummaryDTO[]; total: number }>>(
            `/api/spots/search?${queryString}`,
            { timeout: 12000 },
          ),
        13000,
        'Search request timed out',
      );

      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to search spots');
      }
      return data.data;
    },

    /**
     * Get detailed information about a specific spot.
     * @param id Spot ID
     */
    async getById(id: string): Promise<SpotDTO> {
      const { data } = await withTimeout(
        () =>
          client.get<SpotApiResponse<{ spot: SpotDTO }>>(`/api/spots/${id}`, {
            timeout: 12000,
          }),
        13000,
        'Spot request timed out',
      );

      if (!data.success || !data.data?.spot) {
        throw new Error(data.error ?? 'Failed to fetch spot details');
      }
      return data.data.spot;
    },
  };
}

export type SpotApi = ReturnType<typeof createSpotApi>;
