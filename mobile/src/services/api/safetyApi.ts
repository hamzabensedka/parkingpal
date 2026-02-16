import type {
  UserReportDTO,
  UserBlockDTO,
  CreateReportRequest,
  BlockUserRequest,
  SafetyListQuery,
  ReportReasonDTO,
} from '@parkingpal/shared-types';
import type { AxiosInstance } from 'axios';

export interface SafetyApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Frontend-friendly report type
 */
export interface UserReport {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: ReportReasonDTO;
  description?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  reported?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

/**
 * Frontend-friendly block type
 */
export interface UserBlock {
  id: string;
  blockedId: string;
  createdAt: string;
  blocked: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

/**
 * Report reason options for UI
 */
export const REPORT_REASONS: { value: ReportReasonDTO; label: string; description: string }[] = [
  { value: 'harassment', label: 'Harassment', description: 'Abusive or threatening behavior' },
  { value: 'spam', label: 'Spam', description: 'Unsolicited promotional content' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', description: 'Offensive or inappropriate material' },
  { value: 'fraudulent_listing', label: 'Fraudulent Listing', description: 'Fake or misleading listing' },
  { value: 'no_show', label: 'No Show', description: 'User did not show up for booking' },
  { value: 'property_damage', label: 'Property Damage', description: 'Damage to parking spot or property' },
  { value: 'safety_concern', label: 'Safety Concern', description: 'Safety-related issues' },
  { value: 'payment_issue', label: 'Payment Issue', description: 'Payment fraud or disputes' },
  { value: 'other', label: 'Other', description: 'Other violations' },
];

/**
 * Map backend DTO to frontend type
 */
function mapReportDTO(dto: UserReportDTO): UserReport {
  return {
    id: dto.id,
    reporterId: dto.reporterId,
    reportedId: dto.reportedId,
    reason: dto.reason,
    description: dto.description,
    status: dto.status,
    createdAt: dto.createdAt,
    reported: dto.reported,
  };
}

function mapBlockDTO(dto: UserBlockDTO): UserBlock {
  return {
    id: dto.id,
    blockedId: dto.blockedId,
    createdAt: dto.createdAt,
    blocked: dto.blocked,
  };
}

/**
 * Safety API - user reporting and blocking
 */
export function createSafetyApi(client: AxiosInstance) {
  return {
    // ==========================================
    // Reports
    // ==========================================

    /**
     * Submit a report against a user
     */
    async submitReport(request: CreateReportRequest): Promise<UserReport> {
      // Convert to uppercase for backend
      const backendRequest = {
        ...request,
        reason: request.reason.toUpperCase(),
      };

      const { data } = await client.post<SafetyApiResponse<{ report: UserReportDTO }>>(
        '/api/safety/reports',
        backendRequest,
        { timeout: 10000 }
      );

      if (!data.success || !data.data?.report) {
        throw new Error(data.error ?? 'Failed to submit report');
      }

      return mapReportDTO(data.data.report);
    },

    /**
     * Get reports submitted by the current user
     */
    async getMySubmittedReports(query?: SafetyListQuery): Promise<{ reports: UserReport[]; pagination: PaginationInfo }> {
      const params = new URLSearchParams();
      if (query?.limit) params.append('limit', String(query.limit));
      if (query?.offset) params.append('offset', String(query.offset));

      const url = params.toString() ? `/api/safety/reports/submitted?${params}` : '/api/safety/reports/submitted';

      const { data } = await client.get<SafetyApiResponse<{ reports: UserReportDTO[]; pagination: PaginationInfo }>>(
        url,
        { timeout: 10000 }
      );

      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to get reports');
      }

      return {
        reports: data.data.reports.map(mapReportDTO),
        pagination: data.data.pagination,
      };
    },

    /**
     * Get reports against the current user
     */
    async getReportsAgainstMe(query?: SafetyListQuery): Promise<{ reports: UserReport[]; pagination: PaginationInfo }> {
      const params = new URLSearchParams();
      if (query?.limit) params.append('limit', String(query.limit));
      if (query?.offset) params.append('offset', String(query.offset));

      const url = params.toString() ? `/api/safety/reports/against?${params}` : '/api/safety/reports/against';

      const { data } = await client.get<SafetyApiResponse<{ reports: UserReportDTO[]; pagination: PaginationInfo }>>(
        url,
        { timeout: 10000 }
      );

      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to get reports');
      }

      return {
        reports: data.data.reports.map(mapReportDTO),
        pagination: data.data.pagination,
      };
    },

    // ==========================================
    // Blocks
    // ==========================================

    /**
     * Block a user
     */
    async blockUser(blockedId: string): Promise<UserBlock> {
      const request: BlockUserRequest = { blockedId };

      const { data } = await client.post<SafetyApiResponse<{ block: UserBlockDTO }>>(
        '/api/safety/blocks',
        request,
        { timeout: 10000 }
      );

      if (!data.success || !data.data?.block) {
        throw new Error(data.error ?? 'Failed to block user');
      }

      return mapBlockDTO(data.data.block);
    },

    /**
     * Unblock a user
     */
    async unblockUser(userId: string): Promise<void> {
      const { data } = await client.delete<SafetyApiResponse<null>>(
        `/api/safety/blocks/${userId}`,
        { timeout: 10000 }
      );

      if (!data.success) {
        throw new Error(data.error ?? 'Failed to unblock user');
      }
    },

    /**
     * Get list of blocked users
     */
    async getBlockedUsers(query?: SafetyListQuery): Promise<{ blocks: UserBlock[]; pagination: PaginationInfo }> {
      const params = new URLSearchParams();
      if (query?.limit) params.append('limit', String(query.limit));
      if (query?.offset) params.append('offset', String(query.offset));

      const url = params.toString() ? `/api/safety/blocks?${params}` : '/api/safety/blocks';

      const { data } = await client.get<SafetyApiResponse<{ blocks: UserBlockDTO[]; pagination: PaginationInfo }>>(
        url,
        { timeout: 10000 }
      );

      if (!data.success || !data.data) {
        throw new Error(data.error ?? 'Failed to get blocked users');
      }

      return {
        blocks: data.data.blocks.map(mapBlockDTO),
        pagination: data.data.pagination,
      };
    },

    /**
     * Check if a user is blocked
     */
    async isUserBlocked(userId: string): Promise<boolean> {
      const { data } = await client.get<SafetyApiResponse<{ isBlocked: boolean }>>(
        `/api/safety/blocks/${userId}/status`,
        { timeout: 10000 }
      );

      if (!data.success || data.data === undefined) {
        throw new Error(data.error ?? 'Failed to check block status');
      }

      return data.data.isBlocked;
    },
  };
}

export type SafetyApi = ReturnType<typeof createSafetyApi>;
