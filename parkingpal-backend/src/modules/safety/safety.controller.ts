import { Request, Response, NextFunction } from 'express';
import { ReportReason } from '@prisma/client';
import { SafetyService } from './safety.service';
import { toUserReportDTO, toUserBlockDTO } from './safety.mappers';
import {
  CreateReportInput,
  BlockUserInput,
  SafetyListQueryInput,
} from './safety.validation';
import { UserReportDTO, UserBlockDTO } from '@parkingpal/shared-types';

export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  // ==========================================
  // Report Endpoints
  // ==========================================

  /**
   * POST /api/safety/reports
   * Submit a report against a user
   */
  async submitReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const body = req.body as CreateReportInput;

      const report = await this.safetyService.submitReport({
        reporterId: userId,
        reportedId: body.reportedId,
        reason: body.reason as ReportReason,
        description: body.description,
        relatedId: body.relatedId,
        relatedType: body.relatedType,
      });

      const reportDTO: UserReportDTO = toUserReportDTO(report);

      res.status(201).json({
        success: true,
        data: {
          report: reportDTO,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/safety/reports/submitted
   * Get reports submitted by the current user
   */
  async getMySubmittedReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as SafetyListQueryInput;

      const limit = query.limit ?? 20;
      const offset = query.offset ?? 0;

      const { reports, total } = await this.safetyService.getMySubmittedReports(
        userId,
        limit,
        offset
      );

      const reportDTOs: UserReportDTO[] = reports.map(toUserReportDTO);

      res.json({
        success: true,
        data: {
          reports: reportDTOs,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + reports.length < total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/safety/reports/against
   * Get reports against the current user
   */
  async getReportsAgainstMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as SafetyListQueryInput;

      const limit = query.limit ?? 20;
      const offset = query.offset ?? 0;

      const { reports, total } = await this.safetyService.getReportsAgainstMe(
        userId,
        limit,
        offset
      );

      const reportDTOs: UserReportDTO[] = reports.map(toUserReportDTO);

      res.json({
        success: true,
        data: {
          reports: reportDTOs,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + reports.length < total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/safety/reports/:id
   * Get a single report by ID
   */
  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const report = await this.safetyService.getReport(id, userId);
      const reportDTO: UserReportDTO = toUserReportDTO(report);

      res.json({
        success: true,
        data: {
          report: reportDTO,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // Block Endpoints
  // ==========================================

  /**
   * POST /api/safety/blocks
   * Block a user
   */
  async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { blockedId } = req.body as BlockUserInput;

      const block = await this.safetyService.blockUser(userId, blockedId);
      const blockDTO: UserBlockDTO = toUserBlockDTO(block as any);

      res.status(201).json({
        success: true,
        data: {
          block: blockDTO,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/safety/blocks/:userId
   * Unblock a user
   */
  async unblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blockerId = req.user!.id;
      const { userId: blockedId } = req.params;

      await this.safetyService.unblockUser(blockerId, blockedId);

      res.json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/safety/blocks
   * Get list of blocked users
   */
  async getBlockedUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as SafetyListQueryInput;

      const limit = query.limit ?? 20;
      const offset = query.offset ?? 0;

      const { blocks, total } = await this.safetyService.getBlockedUsers(
        userId,
        limit,
        offset
      );

      const blockDTOs: UserBlockDTO[] = blocks.map((block) => toUserBlockDTO(block as any));

      res.json({
        success: true,
        data: {
          blocks: blockDTOs,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + blocks.length < total,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/safety/blocks/:userId/status
   * Check if a user is blocked
   */
  async checkBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blockerId = req.user!.id;
      const { userId: blockedId } = req.params;

      const isBlocked = await this.safetyService.isUserBlocked(blockerId, blockedId);

      res.json({
        success: true,
        data: {
          isBlocked,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
