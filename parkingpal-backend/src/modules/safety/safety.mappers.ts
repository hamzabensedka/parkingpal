import { UserReport, UserBlock, ReportReason, ReportStatus } from '@prisma/client';
import {
  UserReportDTO,
  UserBlockDTO,
  ReportReasonDTO,
  ReportStatusDTO,
  ReportRelatedTypeDTO,
  SafetyUserDTO,
} from '@parkingpal/shared-types';

/**
 * Map Prisma ReportReason enum to DTO enum (UPPER_CASE → lowercase_snake_case)
 */
function mapReportReason(reason: ReportReason): ReportReasonDTO {
  const mapping: Record<ReportReason, ReportReasonDTO> = {
    HARASSMENT: 'harassment',
    SPAM: 'spam',
    INAPPROPRIATE_CONTENT: 'inappropriate_content',
    FRAUDULENT_LISTING: 'fraudulent_listing',
    NO_SHOW: 'no_show',
    PROPERTY_DAMAGE: 'property_damage',
    SAFETY_CONCERN: 'safety_concern',
    PAYMENT_ISSUE: 'payment_issue',
    OTHER: 'other',
  };
  return mapping[reason];
}

/**
 * Map Prisma ReportStatus enum to DTO enum (UPPER_CASE → lowercase_snake_case)
 */
function mapReportStatus(status: ReportStatus): ReportStatusDTO {
  const mapping: Record<ReportStatus, ReportStatusDTO> = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    RESOLVED: 'resolved',
    DISMISSED: 'dismissed',
  };
  return mapping[status];
}

/**
 * Map user data to SafetyUserDTO
 */
function mapSafetyUser(user: {
  id: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string | null;
}): SafetyUserDTO {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    ...(user.profilePhoto && { profilePhoto: user.profilePhoto }),
  };
}

/**
 * Map Prisma UserReport to UserReportDTO
 */
export function toUserReportDTO(
  report: UserReport & {
    reporter?: { id: string; firstName: string; lastName: string; profilePhoto?: string | null } | null;
    reported?: { id: string; firstName: string; lastName: string; profilePhoto?: string | null } | null;
  }
): UserReportDTO {
  return {
    id: report.id,
    reporterId: report.reporterId,
    reportedId: report.reportedId,
    reason: mapReportReason(report.reason),
    ...(report.description && { description: report.description }),
    ...(report.relatedId && { relatedId: report.relatedId }),
    ...(report.relatedType && { relatedType: report.relatedType as ReportRelatedTypeDTO }),
    status: mapReportStatus(report.status),
    createdAt: report.createdAt.toISOString(),
    ...(report.reporter && { reporter: mapSafetyUser(report.reporter) }),
    ...(report.reported && { reported: mapSafetyUser(report.reported) }),
  };
}

/**
 * Map Prisma UserBlock to UserBlockDTO
 */
export function toUserBlockDTO(
  block: UserBlock & {
    blocked: { id: string; firstName: string; lastName: string; profilePhoto?: string | null };
  }
): UserBlockDTO {
  return {
    id: block.id,
    blockerId: block.blockerId,
    blockedId: block.blockedId,
    createdAt: block.createdAt.toISOString(),
    blocked: mapSafetyUser(block.blocked),
  };
}
