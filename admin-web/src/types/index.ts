export type AdminRole = 'SUPER_ADMIN' | 'MODERATOR' | 'SUPPORT';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  adminRole: AdminRole;
}

export interface AdminPermissions {
  canCreateAdmins: boolean;
  canManageAdmins: boolean;
  canVerifyDocuments: boolean;
  canModerateReports: boolean;
  canManageUsers: boolean;
  canCreateUsers: boolean;
  canSuspendUsers: boolean;
  canViewAuditLogs: boolean;
  canEditAllEntities: boolean;
  canViewDashboard: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalSpots: number;
  totalBookings: number;
  pendingDocuments: number;
  pendingReports: number;
  pendingIdVerifications: number;
  recentSignups: number;
  activeBookings: number;
}

// Entity types
export interface User {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  bio: string | null;
  userType: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  idDocument: string | null;
  isActive: boolean;
  isSuspended: boolean;
  suspendedReason: string | null;
  rating: number;
  reviewCount: number;
  isAdmin: boolean;
  adminRole: AdminRole | null;
  createdAt: string;
  updatedAt: string;
}

export interface Spot {
  id: string;
  hostId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  status: string;
  hourlyRate: number;
  dailyRate: number | null;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface SpotDocument {
  id: string;
  spotId: string;
  type: string;
  url: string;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  spot?: {
    id: string;
    title: string;
    address: string;
    hostId: string;
    host: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  description: string | null;
  status: string;
  reviewedBy: string | null;
  resolution: string | null;
  actionTaken: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  renterId: string;
  hostId: string;
  spotId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  admin?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
