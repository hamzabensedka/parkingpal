import { Linking, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_AGENT = 'ParkingPal/1.0 (contact@parkingpal.fr)';
const GEOCODE_CACHE_PREFIX = 'osm_geocode_';
const REVERSE_CACHE_PREFIX = 'osm_reverse_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  name: string;
  description: string;
  coordinates: Coordinates;
}

interface AddressDetails {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  displayName: string;
}

interface CachedResult<T> {
  data: T;
  timestamp: number;
}

// --- Caching helpers ---

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const cached: CachedResult<T> = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_EXPIRY_MS) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return cached.data;
  } catch {
    return null;
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CachedResult<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Silently fail on cache write errors
  }
}

// --- Rate limiter for Nominatim (1 req/sec) ---

let lastNominatimRequest = 0;

async function nominatimThrottle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastNominatimRequest;
  if (elapsed < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
  }
  lastNominatimRequest = Date.now();
}

// --- Geocoding (Address -> Coordinates) ---

export async function geocode(address: string): Promise<Coordinates | null> {
  const cacheKey = `${GEOCODE_CACHE_PREFIX}${address.toLowerCase().trim()}`;
  const cached = await getCached<Coordinates>(cacheKey);
  if (cached) return cached;

  await nominatimThrottle();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=fr&limit=1`,
      { headers: { 'User-Agent': USER_AGENT } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.length === 0) return null;

    const result: Coordinates = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };

    await setCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

// --- Reverse Geocoding (Coordinates -> Address) ---

export async function reverseGeocode(coordinates: Coordinates): Promise<AddressDetails | null> {
  const cacheKey = `${REVERSE_CACHE_PREFIX}${coordinates.latitude.toFixed(5)}_${coordinates.longitude.toFixed(5)}`;
  const cached = await getCached<AddressDetails>(cacheKey);
  if (cached) return cached;

  await nominatimThrottle();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&addressdetails=1`,
      { headers: { 'User-Agent': USER_AGENT } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.error) return null;

    const addr = data.address || {};
    const result: AddressDetails = {
      street: [addr.house_number, addr.road].filter(Boolean).join(' ') || '',
      city: addr.city || addr.town || addr.village || addr.municipality || '',
      postalCode: addr.postcode || '',
      country: addr.country || 'France',
      displayName: data.display_name || '',
    };

    await setCache(cacheKey, result);
    return result;
  } catch {
    return null;
  }
}

// --- Search / Autocomplete (Photon) ---

export async function searchPlaces(query: string, userLocation?: Coordinates): Promise<Place[]> {
  if (query.length < 3) return [];

  try {
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
    if (userLocation) {
      url += `&lat=${userLocation.latitude}&lon=${userLocation.longitude}`;
    }

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data?.features) return [];

    return data.features.map((f: any) => {
      const props = f.properties || {};
      const nameParts = [props.name, props.city || props.state, props.country].filter(Boolean);
      return {
        name: props.name || props.street || 'Unknown',
        description: nameParts.slice(1).join(', '),
        coordinates: {
          latitude: f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
        },
      };
    });
  } catch {
    return [];
  }
}

// --- Distance Calculation (Haversine) ---

export function getDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371e3;
  const phi1 = (from.latitude * Math.PI) / 180;
  const phi2 = (to.latitude * Math.PI) / 180;
  const deltaPhi = ((to.latitude - from.latitude) * Math.PI) / 180;
  const deltaLambda = ((to.longitude - from.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// --- Navigation (Deep links to external apps) ---

export function openNavigation(destination: Coordinates, label: string): void {
  const { latitude, longitude } = destination;
  const encodedLabel = encodeURIComponent(label);

  Alert.alert(
    'Open Navigation',
    'Choose your preferred navigation app',
    [
      {
        text: 'Default Maps',
        onPress: () => {
          const url = Platform.select({
            ios: `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}(${encodedLabel})`,
          });
          if (url) Linking.openURL(url);
        },
      },
      {
        text: 'Google Maps',
        onPress: () => {
          Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
          );
        },
      },
      {
        text: 'Waze',
        onPress: () => {
          Linking.openURL(
            `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
}
