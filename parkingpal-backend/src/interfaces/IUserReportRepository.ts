import { UserReport, ReportReason, ReportStatus } from '@prisma/client';

export interface CreateUserReportData {
  reporterId: string;
  reportedId: string;
  reason: ReportReason;
  description?: string;
  relatedId?: string;
  relatedType?: string;
}

export interface UpdateReportStatusData {
  status: ReportStatus;
  reviewedBy: string;
  resolution?: string;
  actionTaken?: string;
}

export interface IUserReportRepository {
  /**
   * Create a new user report
   */
  create(data: CreateUserReportData): Promise<UserReport>;

  /**
   * Find report by ID
   */
  findById(id: string): Promise<UserReport | null>;

  /**
   * Find all reports submitted by a user
   */
  findByReporterId(reporterId: string, limit?: number, offset?: number): Promise<{
    reports: UserReport[];
    total: number;
  }>;

  /**
   * Find all reports against a user
   */
  findByReportedId(reportedId: string, limit?: number, offset?: number): Promise<{
    reports: UserReport[];
    total: number;
  }>;

  /**
   * Find all pending reports (for admin review)
   */
  findPending(limit?: number, offset?: number): Promise<{
    reports: UserReport[];
    total: number;
  }>;

  /**
   * Update report status (admin action)
   */
  updateStatus(id: string, data: UpdateReportStatusData): Promise<UserReport>;

  /**
   * Check if user has already reported another user for the same issue
   */
  hasDuplicateReport(reporterId: string, reportedId: string, relatedId?: string): Promise<boolean>;

  /**
   * Count reports against a user
   */
  countReportsAgainstUser(userId: string): Promise<number>;
}
