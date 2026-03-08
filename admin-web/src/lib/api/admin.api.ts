import { apiClient } from './client';
import type {
  ApiResponse,
  AdminUser,
  AdminPermissions,
  AuthTokens,
  DashboardStats,
  User,
  SpotDocument,
  UserReport,
  AuditLog,
  Spot,
} from '@/types';

// ==========================================
// Authentication
// ==========================================

export const adminApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post<ApiResponse<{
      user: AdminUser;
      tokens: AuthTokens;
    }>>('/auth/login', { email, password });
    return data.data!;
  },

  getProfile: async () => {
    const { data } = await apiClient.get<ApiResponse<{
      user: AdminUser;
      permissions: AdminPermissions;
    }>>('/auth/me');
    return data.data!;
  },

  // ==========================================
  // Dashboard
  // ==========================================

  getDashboardStats: async () => {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return data.data!;
  },

  // ==========================================
  // Document Verification
  // ==========================================

  verifyDocument: async (id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    const { data } = await apiClient.post<ApiResponse<{ document: SpotDocument }>>(
      `/documents/${id}/verify`,
      { status, rejectionReason }
    );
    return data.data!;
  },

  // ==========================================
  // User ID Verification
  // ==========================================

  verifyUserId: async (id: string, approved: boolean, rejectionReason?: string) => {
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
      `/users/${id}/verify-id`,
      { approved, rejectionReason }
    );
    return data.data!;
  },

  // ==========================================
  // User Management
  // ==========================================

  createUser: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    userType?: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>('/users', userData);
    return data.data!;
  },

  updateUser: async (id: string, updates: Partial<User>) => {
    const { data } = await apiClient.patch<ApiResponse<{ user: User }>>(`/users/${id}`, updates);
    return data.data!;
  },

  suspendUser: async (id: string, reason: string) => {
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>(`/users/${id}/suspend`, { reason });
    return data.data!;
  },

  unsuspendUser: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>(`/users/${id}/unsuspend`);
    return data.data!;
  },

  // ==========================================
  // Report Moderation
  // ==========================================

  resolveReport: async (id: string, input: {
    resolution: string;
    actionTaken: string;
    suspendUser?: boolean;
    suspensionReason?: string;
  }) => {
    const { data } = await apiClient.post<ApiResponse<{ report: UserReport }>>(`/reports/${id}/resolve`, input);
    return data.data!;
  },

  dismissReport: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<{ report: UserReport }>>(`/reports/${id}/dismiss`);
    return data.data!;
  },

  // ==========================================
  // Spot Management
  // ==========================================

  updateSpotStatus: async (id: string, status: string, rejectionReason?: string) => {
    const { data } = await apiClient.patch<ApiResponse<{ spot: Spot }>>(`/spots/${id}/status`, { status, rejectionReason });
    return data.data!;
  },

  // ==========================================
  // Admin Management
  // ==========================================

  createAdmin: async (userId: string, role: string) => {
    const { data } = await apiClient.post<ApiResponse<{ user: User }>>('/admins', { userId, role });
    return data.data!;
  },

  updateAdminRole: async (id: string, role: string) => {
    const { data } = await apiClient.patch<ApiResponse<{ user: User }>>(`/admins/${id}/role`, { role });
    return data.data!;
  },

  removeAdmin: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<{ user: User }>>(`/admins/${id}`);
    return data.data!;
  },

  // ==========================================
  // Audit Logs
  // ==========================================

  getAuditLogs: async (params: {
    limit?: number;
    offset?: number;
    adminId?: string;
    action?: string;
    entityType?: string;
  }) => {
    const { data } = await apiClient.get<{
      success: boolean;
      data: AuditLog[];
      pagination: { total: number; limit: number; offset: number; hasMore: boolean };
    }>('/audit-logs', { params });
    return data;
  },
};
