import type { CreateSpotRequest, UpdateSpotRequest, SpotDTO, SpotSummaryDTO, SearchSpotsRequest } from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';
import { secureTokenStorage } from '../http/secureTokenStorage';
import { API_BASE_URL } from '../../utils/constants';

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
      // Get auth token directly for FormData upload (more reliable in RN)
      const token = await secureTokenStorage.getAccessToken();
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

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

      // Use fetch directly for FormData uploads (more reliable in React Native)
      const response = await fetch(`${API_BASE_URL}/api/spots`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let fetch set it with boundary for FormData
        },
        body: formData,
      });

      const data: SpotApiResponse<{ spot: SpotDTO }> = await response.json();

      if (!response.ok || !data.success || !data.data?.spot) {
        throw new Error(data.error ?? `Failed to create spot (${response.status})`);
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

    /**
     * Pause a listing (hide from renters).
     * @param id Spot ID
     */
    async pause(id: string): Promise<SpotDTO> {
      const { data } = await client.post<SpotApiResponse<{ spot: SpotDTO }>>(
        `/api/spots/${id}/pause`,
      );

      if (!data.success || !data.data?.spot) {
        throw new Error(data.error ?? 'Failed to pause listing');
      }
      return data.data.spot;
    },

    /**
     * Activate a listing (make visible to renters).
     * @param id Spot ID
     */
    async activate(id: string): Promise<SpotDTO> {
      const { data } = await client.post<SpotApiResponse<{ spot: SpotDTO }>>(
        `/api/spots/${id}/activate`,
      );

      if (!data.success || !data.data?.spot) {
        throw new Error(data.error ?? 'Failed to activate listing');
      }
      return data.data.spot;
    },

    /**
     * Update a listing.
     * @param id Spot ID
     * @param body UpdateSpotRequest payload with fields to update
     */
    async update(id: string, body: UpdateSpotRequest): Promise<SpotDTO> {
      const { data } = await client.put<SpotApiResponse<{ spot: SpotDTO }>>(
        `/api/spots/${id}`,
        body,
        { timeout: 30000 },
      );

      if (!data.success || !data.data?.spot) {
        throw new Error(data.error ?? 'Failed to update listing');
      }
      return data.data.spot;
    },

    /**
     * Delete a listing (soft delete).
     * @param id Spot ID
     */
    async delete(id: string): Promise<void> {
      const { data } = await client.delete<SpotApiResponse<null>>(
        `/api/spots/${id}`,
        { timeout: 10000 },
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to delete listing');
      }
    },
  };
}

export type SpotApi = ReturnType<typeof createSpotApi>;
