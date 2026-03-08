/**
 * Admin Audit Repository Interface
 * Single Responsibility: Database access for AdminAuditLog entity
 */
import { AdminAuditLog } from '@prisma/client';

export interface CreateAuditLogData {
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedAuditLogs {
  logs: AdminAuditLog[];
  total: number;
}

export interface IAdminAuditRepository {
  /**
   * Create a new audit log entry
   */
  create(data: CreateAuditLogData): Promise<AdminAuditLog>;

  /**
   * Find audit logs by admin ID
   */
  findByAdmin(adminId: string, limit: number, offset: number): Promise<PaginatedAuditLogs>;

  /**
   * Find audit logs for a specific entity
   */
  findByEntity(entityType: string, entityId: string): Promise<AdminAuditLog[]>;

  /**
   * Find all audit logs with filters and pagination
   */
  findAll(limit: number, offset: number, filters?: AuditLogFilters): Promise<PaginatedAuditLogs>;

  /**
   * Find audit log by ID
   */
  findById(id: string): Promise<AdminAuditLog | null>;
}
