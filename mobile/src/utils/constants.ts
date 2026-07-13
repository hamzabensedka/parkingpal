import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ParkingPal Design System – Black, White & #19e664 (Airbnb-style)

const ACCENT = '#ff0a54';

// Renter Theme (black, white, accent)
export const RENTER_COLORS = {
  lightest: '#F7F7F7',
  lighter: '#EBEBEB',
  light: '#DDDDDD',
  lightMedium: '#B0B0B0',
  medium: '#717171',
  primary: ACCENT,
  dark: '#222222',
  darker: '#111111',
  darkest: '#000000',
} as const;

// Host Theme (same palette)
export const HOST_COLORS = {
  lightest: '#F7F7F7',
  lighter: '#EBEBEB',
  light: '#DDDDDD',
  lightMedium: '#B0B0B0',
  medium: '#717171',
  primary: ACCENT,
  dark: '#222222',
  darker: '#111111',
  darkest: '#000000',
} as const;

// Neutral Colors (black, white, grays)
export const NEUTRAL_COLORS = {
  black: '#000000',
  darkGray: '#222222',
  gray: '#717171',
  lightGray: '#EBEBEB',
  background: '#FFFFFF',
  white: '#FFFFFF',
  success: ACCENT,
  warning: '#717171',
  error: '#000000',
  info: '#222222',
} as const;

// Thin borders (Airbnb-style)
export const BORDER_WIDTH = {
  thin: 1,
  medium: 1.5,
} as const;

// Typography (Airbnb-style: clean, simple)
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// Border Radius (Airbnb-style: moderate, classy)
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// Shadows (subtle, Airbnb-style)
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Animation Spring Presets (for react-native-reanimated)
export const ANIMATION_SPRING = {
  gentle: { damping: 15, stiffness: 150 },
  snappy: { damping: 12, stiffness: 200 },
  bouncy: { damping: 8, stiffness: 120 },
  default: { damping: 10, stiffness: 100 },
} as const;

// Font Weight Map
export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Text Style Presets (Airbnb-style)
export const TEXT_STYLES = {
  heroTitle: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38 },
  screenTitle: { fontSize: 28, fontWeight: '800' as const, lineHeight: 34 },
  sectionTitle: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  captionBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  price: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  menuItem: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
} as const;

// Map Constants (Toulouse)
export const MAP_DEFAULTS = {
  center: [1.4442, 43.6047] as [number, number], // [lng, lat] GeoJSON order
  zoomLevel: 13,
  minZoomLevel: 10,
  maxZoomLevel: 20,
} as const;

// MapLibre style JSON – CartoDB Dark Matter raster tiles
export const MAPLIBRE_STYLE = JSON.stringify({
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [{ id: 'carto-dark-layer', type: 'raster', source: 'carto-dark' }],
});

// Booking Constants
export const BOOKING = {
  minDurationHours: 1,
  maxDurationHours: 24,
  bufferMinutes: 15,
  maxAdvanceBookingDays: 90,
  serviceFeePercentage: 0.20,
  insuranceFee: 2,
} as const;

// Vehicle Types
export const VEHICLE_TYPES = [
  { id: 'compact', label: 'Compact', icon: 'car-compact' },
  { id: 'sedan', label: 'Sedan', icon: 'car-side' },
  { id: 'suv', label: 'SUV', icon: 'car-estate' },
  { id: 'van', label: 'Van/Truck', icon: 'truck' },
  { id: 'motorcycle', label: 'Motorcycle', icon: 'motorbike' },
] as const;

// Vehicle Sizes
export const VEHICLE_SIZES = VEHICLE_TYPES;

// Spot Types
export const SPOT_TYPES = [
  { id: 'driveway', label: 'Driveway', icon: 'home-outline' },
  { id: 'garage', label: 'Garage', icon: 'garage' },
  { id: 'covered', label: 'Covered Parking', icon: 'car-select' },
  { id: 'street', label: 'Street Parking', icon: 'road' },
  { id: 'lot', label: 'Parking Lot', icon: 'parking' },
  { id: 'underground', label: 'Underground', icon: 'car-3-plus' },
] as const;

// Amenities
export const AMENITIES = [
  { id: 'covered', label: 'Covered/Indoor', icon: 'shield-home-outline' },
  { id: 'lit', label: 'Well-lit', icon: 'lightbulb-on-outline' },
  { id: 'camera', label: 'Security Camera', icon: 'cctv' },
  { id: 'ev_charging', label: 'EV Charging', icon: 'ev-station' },
  { id: 'gated', label: 'Gated Access', icon: 'gate' },
  { id: 'handicap', label: 'Handicap Accessible', icon: 'wheelchair-accessibility' },
] as const;

// Access Types
export const ACCESS_TYPES = [
  { id: 'code', label: 'Gate/Door Code', icon: 'dialpad' },
  { id: 'key', label: 'Meet in Person', icon: 'key' },
  { id: 'smart_lock', label: 'Smart Lock', icon: 'lock-smart' },
  { id: 'trust', label: 'Leave Unlocked', icon: 'door-open' },
] as const;

// Cancellation Policies
export const CANCELLATION_POLICIES = [
  {
    id: 'flexible',
    label: 'Flexible',
    description: 'Full refund if cancelled 2+ hours before start',
    rules: [
      { hoursBeforeStart: 2, refundPercentage: 100 },
      { hoursBeforeStart: 0, refundPercentage: 50 },
    ],
  },
  {
    id: 'moderate',
    label: 'Moderate',
    description: 'Full refund if cancelled 24+ hours before start',
    rules: [
      { hoursBeforeStart: 24, refundPercentage: 100 },
      { hoursBeforeStart: 2, refundPercentage: 50 },
      { hoursBeforeStart: 0, refundPercentage: 0 },
    ],
  },
  {
    id: 'strict',
    label: 'Strict',
    description: 'Full refund only if cancelled 72+ hours before start',
    rules: [
      { hoursBeforeStart: 72, refundPercentage: 100 },
      { hoursBeforeStart: 24, refundPercentage: 50 },
      { hoursBeforeStart: 0, refundPercentage: 0 },
    ],
  },
] as const;

// Review Tags
export const REVIEW_TAGS = {
  renter: [
    { id: 'easy_access', label: 'Easy Access' },
    { id: 'great_value', label: 'Great Value' },
    { id: 'clean', label: 'Clean' },
    { id: 'accurate', label: 'Accurate Description' },
    { id: 'good_location', label: 'Good Location' },
    { id: 'safe', label: 'Safe Area' },
  ],
  host: [
    { id: 'respectful', label: 'Respectful' },
    { id: 'on_time', label: 'On Time' },
    { id: 'good_communication', label: 'Good Communication' },
    { id: 'left_clean', label: 'Left Spot Clean' },
    { id: 'would_host_again', label: 'Would Host Again' },
  ],
} as const;

// Booking Statuses (black & white)
export const BOOKING_STATUS = {
  pending: { label: 'Pending', color: '#5C5C5C' },
  confirmed: { label: 'Confirmed', color: '#4A4A4A' },
  active: { label: 'Active', color: '#2D2D2D' },
  completed: { label: 'Completed', color: '#6B7280' },
  cancelled: { label: 'Cancelled', color: '#1A1A1A' },
} as const;

// Payment Status (black & white)
export const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: '#5C5C5C' },
  paid: { label: 'Paid', color: '#2D2D2D' },
  refunded: { label: 'Refunded', color: '#6B7280' },
} as const;

// API Base URL (backend routes are /api/... with no /v1 prefix)
// In dev, derive your machine IP from Expo so physical devices can reach it.

function getDevHost(): string | null {
  // Most reliable in Expo: debuggerHost like "192.168.x.x:19000"
  const debuggerHost =
    (Constants as any)?.manifest?.debuggerHost ??
    (Constants as any)?.expoConfig?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (typeof debuggerHost !== 'string' || debuggerHost.length === 0) return null;
  return debuggerHost.split(':')[0] ?? null;
}

const DEV_API_HOST =
  getDevHost() ??
  // If Expo host detection fails, prefer emulator loopback on Android.
  // For physical devices, set EXPO_PUBLIC_API_URL to your machine LAN IP.
  (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');

const ENV_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const API_BASE_URL =
  ENV_API_BASE_URL ??
  (__DEV__ ? `http://${DEV_API_HOST}:5000` : 'https://api.parkingpal.fr');

// Storage Keys
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  user: 'user_data',
  userType: 'user_type',
  activeUserMode: 'active_user_mode',
  onboardingComplete: 'onboarding_complete',
  recentSearches: 'recent_searches',
  savedSpots: 'saved_spots',
} as const;

// Stripe Configuration
// In production, use environment variable: EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
  (__DEV__ ? 'pk_test_placeholder' : 'pk_live_placeholder');

// Merchant name shown in Apple Pay / Google Pay sheets
export const STRIPE_MERCHANT_NAME = 'ParkingPal';
