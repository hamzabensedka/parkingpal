import { UserReport, UserBlock, ReportReason } from '@prisma/client';
import { IUserReportRepository } from '../../interfaces/IUserReportRepository';
import { IUserBlockRepository } from '../../interfaces/IUserBlockRepository';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { ApiError } from '../../middleware/errorHandler';

export interface CreateReportData {
  reporterId: string;
  reportedId: string;
  reason: ReportReason;
  description?: string;
  relatedId?: string;
  relatedType?: string;
}

export class SafetyService {
  constructor(
    private readonly userReportRepository: IUserReportRepository,
    private readonly userBlockRepository: IUserBlockRepository,
    private readonly userRepository: IUserRepository
  ) {}

  // ==========================================
  // Report Methods
  // ==========================================

  /**
   * Submit a report against a user
   */
  async submitReport(data: CreateReportData): Promise<UserReport> {
    // Prevent self-reporting
    if (data.reporterId === data.reportedId) {
      throw ApiError.badRequest('You cannot report yourself');
    }

    // Verify reported user exists
    const reportedUser = await this.userRepository.findById(data.reportedId);
    if (!reportedUser) {
      throw ApiError.notFound('Reported user not found');
    }

    // Check for duplicate reports
    const hasDuplicate = await this.userReportRepository.hasDuplicateReport(
      data.reporterId,
      data.reportedId,
      data.relatedId
    );
    if (hasDuplicate) {
      throw ApiError.conflict('You have already reported this user for this issue');
    }

    // Create the report
    return this.userReportRepository.create({
      reporterId: data.reporterId,
      reportedId: data.reportedId,
      reason: data.reason,
      description: data.description,
      relatedId: data.relatedId,
      relatedType: data.relatedType,
    });
  }

  /**
   * Get reports submitted by the current user
   */
  async getMySubmittedReports(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ reports: UserReport[]; total: number }> {
    return this.userReportRepository.findByReporterId(userId, limit, offset);
  }

  /**
   * Get reports against the current user
   */
  async getReportsAgainstMe(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ reports: UserReport[]; total: number }> {
    return this.userReportRepository.findByReportedId(userId, limit, offset);
  }

  /**
   * Get a single report by ID (for viewing own reports)
   */
  async getReport(reportId: string, userId: string): Promise<UserReport> {
    const report = await this.userReportRepository.findById(reportId);
    if (!report) {
      throw ApiError.notFound('Report not found');
    }

    // User can only view reports they submitted or reports against them
    if (report.reporterId !== userId && report.reportedId !== userId) {
      throw ApiError.forbidden('You are not authorized to view this report');
    }

    return report;
  }

  // ==========================================
  // Block Methods
  // ==========================================

  /**
   * Block a user
   */
  async blockUser(blockerId: string, blockedId: string): Promise<UserBlock> {
    // Prevent self-blocking
    if (blockerId === blockedId) {
      throw ApiError.badRequest('You cannot block yourself');
    }

    // Verify blocked user exists
    const blockedUser = await this.userRepository.findById(blockedId);
    if (!blockedUser) {
      throw ApiError.notFound('User not found');
    }

    // Check if already blocked
    const isAlreadyBlocked = await this.userBlockRepository.isBlocked(blockerId, blockedId);
    if (isAlreadyBlocked) {
      throw ApiError.conflict('You have already blocked this user');
    }

    return this.userBlockRepository.create(blockerId, blockedId);
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    // Check if the block exists
    const isBlocked = await this.userBlockRepository.isBlocked(blockerId, blockedId);
    if (!isBlocked) {
      throw ApiError.notFound('Block relationship not found');
    }

    await this.userBlockRepository.delete(blockerId, blockedId);
  }

  /**
   * Get list of users blocked by the current user
   */
  async getBlockedUsers(
    blockerId: string,
    limit: number,
    offset: number
  ): Promise<{ blocks: UserBlock[]; total: number }> {
    return this.userBlockRepository.findBlockedByUser(blockerId, limit, offset);
  }

  /**
   * Check if there's a block relationship between two users (bidirectional)
   * Used by middleware to prevent blocked users from interacting
   */
  async hasBlockRelationship(userId1: string, userId2: string): Promise<boolean> {
    return this.userBlockRepository.hasBlockRelationship(userId1, userId2);
  }

  /**
   * Check if user A has blocked user B (unidirectional)
   */
  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    return this.userBlockRepository.isBlocked(blockerId, blockedId);
  }
}
