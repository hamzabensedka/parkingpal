// ParkingPal Type Definitions

export type UserType = 'renter' | 'host' | 'superhost';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePhoto?: string;
  avatar?: string;
  userType: UserType;
  verified: {
    phone: boolean;
    id: boolean;
  };
  rating: number;
  reviewCount: number;
  memberSince: string;
  isSuperhost?: boolean;
  bio?: string;
  stats?: {
    totalListings?: number;
    totalBookings?: number;
    totalReviews?: number;
    totalEarnings?: number;
  };
  paymentMethods?: PaymentMethod[];
}

export type SpotType = 'driveway' | 'garage' | 'covered' | 'street' | 'lot' | 'underground';
export type AccessType = 'code' | 'key' | 'smart_lock' | 'trust';
export type VehicleSize = 'compact' | 'sedan' | 'suv' | 'van' | 'motorcycle';
export type AmenityType = 'covered' | 'lit' | 'camera' | 'ev_charging' | 'gated' | 'handicap';

export interface SpotAvailability {
  available: boolean;
  timeSlots?: string[];
}

export interface Spot {
  id: string;
  hostId: string;
  host?: User;
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  spotType: SpotType;
  hourlyRate: number;
  dailyRate?: number;
  photos: string[];
  amenities: AmenityType[];
  vehicleSizes: VehicleSize[];
  accessInstructions: string;
  accessType: AccessType;
  accessCode?: string;
  houseRules?: string;
  availability: Record<string, SpotAvailability>;
  rating: number;
  reviewCount: number;
  instantBook: boolean;
  createdAt: string;
  distance?: number;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict';
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  color: string;
  type: VehicleSize;
  isDefault?: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface BookingPricing {
  spotFee: number;
  serviceFee: number;
  insurance: number;
  total: number;
}

export interface Booking {
  id: string;
  spotId: string;
  spot?: Spot;
  renterId: string;
  renter?: User;
  hostId: string;
  host?: User;
  startTime: string;
  endTime: string;
  vehicle: Vehicle;
  pricing: BookingPricing;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  accessCode?: string;
  checkIn?: string;
  checkOut?: string;
  createdAt: string;
  specialInstructions?: string;
  hasInsurance: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewer?: User;
  revieweeId: string;
  reviewee?: User;
  spotId?: string;
  spot?: Spot;
  rating: number;
  comment: string;
  tags?: string[];
  createdAt: string;
  response?: {
    text: string;
    createdAt: string;
  };
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  bookingId: string;
  booking?: Booking;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'message' | 'payment' | 'review' | 'system';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  last4: string;
  isDefault: boolean;
}

export interface Earnings {
  total: number;
  available: number;
  pending: number;
  thisWeek: number;
  thisMonth: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  bookingId: string;
  type: 'payout' | 'refund' | 'fee';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface SearchFilters {
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dateTime?: {
    date: string;
    startTime: string;
    endTime: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  distance?: number;
  spotTypes?: SpotType[];
  amenities?: AmenityType[];
  vehicleSize?: VehicleSize;
  instantBookOnly?: boolean;
  superhostOnly?: boolean;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  UserType: undefined;
  IDVerification: undefined;
  OnboardingComplete: undefined;
  MainApp: undefined;
  RenterTabs: undefined;
  HostTabs: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  UserType: undefined;
  IDVerification: undefined;
  OnboardingComplete: undefined;
};

export type RenterTabParamList = {
  Map: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type HostTabParamList = {
  Dashboard: undefined;
  Listings: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RenterStackParamList = {
  MapMain: undefined;
  Search: undefined;
  Filters: undefined;
  SearchResults: { filters: SearchFilters };
  SpotDetail: { spotId: string };
  BookingDateTime: { spotId: string; spotTitle?: string; hourlyRate?: number };
  VehicleSelection: { spotId: string; startTime: string; endTime: string; spotTitle?: string; hourlyRate?: number; duration?: number; total?: number };
  PaymentReview: {
    spotId: string;
    vehicleId: string;
    startTime: string;
    endTime: string;
    hasInsurance?: boolean;
    spotTitle?: string;
    hourlyRate?: number;
    duration?: number;
    total?: number;
    vehicleName?: string;
    vehiclePlate?: string;
  };
  BookingConfirmation: {
    bookingId: string;
    spotTitle?: string;
    startTime?: string;
    endTime?: string;
    total?: number;
    vehiclePlate?: string;
  };
  ActiveBooking: { bookingId: string };
  BookingHistory: undefined;
  CancelBooking: { bookingId: string };
  SavedSpots: undefined;
};

export type HostStackParamList = {
  DashboardMain: undefined;
  AddListingLocation: undefined;
  AddListingPhotos: { address: string; latitude: number; longitude: number };
  AddListingDetails: {
    location: { address: string; latitude: number; longitude: number };
    photos: string[];
  };
  AddListingAccess: {
    location: { address: string; latitude: number; longitude: number };
    photos: string[];
    spotType: SpotType;
    amenities: AmenityType[];
    vehicleSizes: VehicleSize[];
    numberOfSpots: number;
  };
  AddListingPricing: {
    location: { address: string; latitude: number; longitude: number };
    photos: string[];
    spotType: SpotType;
    amenities: AmenityType[];
    vehicleSizes: VehicleSize[];
    accessInstructions: string;
    accessType: AccessType;
    numberOfSpots: number;
  };
  AddListingAvailability: {
    location: { address: string; latitude: number; longitude: number };
    photos: string[];
    spotType: SpotType;
    amenities: AmenityType[];
    vehicleSizes: VehicleSize[];
    accessInstructions: string;
    accessType: AccessType;
    hourlyRate: number;
    dailyRate?: number;
    numberOfSpots: number;
  };
  AddListingDescription: {
    location: { address: string; latitude: number; longitude: number };
    photos: string[];
    spotType: SpotType;
    amenities: AmenityType[];
    vehicleSizes: VehicleSize[];
    accessInstructions: string;
    accessType: AccessType;
    hourlyRate: number;
    dailyRate?: number;
    availability: Record<string, SpotAvailability>;
    numberOfSpots: number;
  };
  AddListingPreview: {
    location: { address: string; latitude: number; longitude: number };
    photos: string[];
    spotType: SpotType;
    amenities: AmenityType[];
    vehicleSizes: VehicleSize[];
    accessInstructions: string;
    accessType: AccessType;
    hourlyRate: number;
    dailyRate?: number;
    availability: Record<string, SpotAvailability>;
    title: string;
    description: string;
    houseRules?: string;
    numberOfSpots: number;
  };
  ListingManagement: undefined;
  EditListing: { spotId: string };
  HostActiveBooking: { bookingId: string };
  Earnings: undefined;
  WithdrawFunds: undefined;
};

export type SharedStackParamList = {
  MessagesMain: undefined;
  Chat: { conversationId: string };
  Notifications: undefined;
  Settings: undefined;
  PaymentMethods: undefined;
  AddPaymentCard: undefined;
  Vehicles: undefined;
  AddVehicle: undefined;
  Review: { bookingId: string };
  ReportIssue: { bookingId?: string };
  Help: undefined;
  EditProfile: undefined;
  Legal: { initialSection?: 'terms' | 'privacy' } | undefined;
};
