import { AdminRole, DocumentStatus, SpotStatus, User, Spot, SpotDocument, UserReport, Booking, AdminAuditLog } from '@prisma/client';
import { IUserRepository } from '../../interfaces/IUserRepository';
import { ISpotRepository } from '../../interfaces/ISpotRepository';
import { IBookingRepository } from '../../interfaces/IBookingRepository';
import { IUserReportRepository } from '../../interfaces/IUserReportRepository';
import { IAdminAuditRepository } from '../../interfaces/IAdminAuditRepository';
import { IPasswordUtil } from '../../interfaces/IPasswordUtil';
import { ITokenUtil } from '../../interfaces/ITokenUtil';
import { ApiError } from '../../middleware/errorHandler';
import {
  CreateUserInput,
  UpdateUserInput,
  VerifyDocumentInput,
  VerifyUserIdInput,
  ResolveReportInput,
  CreateAdminInput,
  UpdateAdminRoleInput,
  SuspendUserInput,
  UpdateSpotStatusInput,
  PaginationQuery,
} from './admin.validation';

// Action types for audit logging
export const ADMIN_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  APPROVE_DOCUMENT: 'APPROVE_DOCUMENT',
  REJECT_DOCUMENT: 'REJECT_DOCUMENT',
  APPROVE_USER_ID: 'APPROVE_USER_ID',
  REJECT_USER_ID: 'REJECT_USER_ID',
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  SUSPEND_USER: 'SUSPEND_USER',
  UNSUSPEND_USER: 'UNSUSPEND_USER',
  APPROVE_SPOT: 'APPROVE_SPOT',
  REJECT_SPOT: 'REJECT_SPOT',
  UPDATE_SPOT: 'UPDATE_SPOT',
  RESOLVE_REPORT: 'RESOLVE_REPORT',
  DISMISS_REPORT: 'DISMISS_REPORT',
  CREATE_ADMIN: 'CREATE_ADMIN',
  UPDATE_ADMIN_ROLE: 'UPDATE_ADMIN_ROLE',
  REMOVE_ADMIN: 'REMOVE_ADMIN',
} as const;

export interface AdminServiceDependencies {
  userRepository: IUserRepository;
  spotRepository: ISpotRepository;
  bookingRepository: IBookingRepository;
  userReportRepository: IUserReportRepository;
  auditRepository: IAdminAuditRepository;
  passwordUtil: IPasswordUtil;
  tokenUtil: ITokenUtil;
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

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class AdminService {
  private userRepository: IUserRepository;
  private spotRepository: ISpotRepository;
  private bookingRepository: IBookingRepository;
  private userReportRepository: IUserReportRepository;
  private auditRepository: IAdminAuditRepository;
  private passwordUtil: IPasswordUtil;
  private tokenUtil: ITokenUtil;

  constructor(deps: AdminServiceDependencies) {
    this.userRepository = deps.userRepository;
    this.spotRepository = deps.spotRepository;
    this.bookingRepository = deps.bookingRepository;
    this.userReportRepository = deps.userReportRepository;
    this.auditRepository = deps.auditRepository;
    this.passwordUtil = deps.passwordUtil;
    this.tokenUtil = deps.tokenUtil;
  }

  // ==========================================
  // Authentication
  // ==========================================

  async login(email: string, password: string): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.isAdmin || !user.adminRole) {
      throw ApiError.forbidden('Admin access required');
    }

    const isValidPassword = await this.passwordUtil.compare(password, user.password);

    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    if (user.isSuspended) {
      throw ApiError.forbidden('Account is suspended');
    }

    const tokens = this.tokenUtil.generateTokens({
      id: user.id,
      email: user.email,
      userType: user.userType,
    });

    await this.userRepository.updateRefreshToken(user.id, tokens.refreshToken);
    await this.userRepository.updateLastLogin(user.id);

    return { user, tokens };
  }

  async getAdminProfile(adminId: string): Promise<User> {
    const user = await this.userRepository.findById(adminId);

    if (!user || !user.isAdmin) {
      throw ApiError.notFound('Admin not found');
    }

    return user;
  }

  // ==========================================
  // Dashboard
  // ==========================================

  async getDashboardStats(): Promise<DashboardStats> {
    // These would need additional repository methods
    // For now, returning placeholder structure
    return {
      totalUsers: 0,
      totalSpots: 0,
      totalBookings: 0,
      pendingDocuments: 0,
      pendingReports: 0,
      pendingIdVerifications: 0,
      recentSignups: 0,
      activeBookings: 0,
    };
  }

  // ==========================================
  // Document Verification
  // ==========================================

  async verifyDocument(
    adminId: string,
    documentId: string,
    input: VerifyDocumentInput,
    metadata?: Record<string, unknown>
  ): Promise<SpotDocument> {
    const document = await this.spotRepository.findDocumentById(documentId);

    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    const oldValue = { status: document.status };
    const newStatus = input.status as DocumentStatus;

    const updated = await this.spotRepository.updateDocumentStatus(documentId, {
      status: newStatus,
      rejectionReason: input.rejectionReason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    });

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: newStatus === 'APPROVED' ? ADMIN_ACTIONS.APPROVE_DOCUMENT : ADMIN_ACTIONS.REJECT_DOCUMENT,
      entityType: 'SpotDocument',
      entityId: documentId,
      oldValue,
      newValue: { status: newStatus, rejectionReason: input.rejectionReason },
      metadata,
    });

    return updated;
  }

  // ==========================================
  // User ID Verification
  // ==========================================

  async verifyUserId(
    adminId: string,
    userId: string,
    input: VerifyUserIdInput,
    metadata?: Record<string, unknown>
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.idDocument) {
      throw ApiError.badRequest('User has no ID document uploaded');
    }

    const oldValue = { idVerified: user.idVerified };

    // Update user verification status
    const updated = await this.userRepository.update(userId, {
      // @ts-expect-error - These fields exist but aren't in UpdateUserData type
      idVerified: input.approved,
      idVerifiedAt: input.approved ? new Date() : null,
      idRejectionReason: input.approved ? null : input.rejectionReason,
    });

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: input.approved ? ADMIN_ACTIONS.APPROVE_USER_ID : ADMIN_ACTIONS.REJECT_USER_ID,
      entityType: 'User',
      entityId: userId,
      oldValue,
      newValue: { idVerified: input.approved },
      metadata,
    });

    return updated;
  }

  // ==========================================
  // User Management
  // ==========================================

  async createUser(
    adminId: string,
    input: CreateUserInput,
    metadata?: Record<string, unknown>
  ): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict('Email already in use');
    }

    const hashedPassword = await this.passwordUtil.hash(input.password);

    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone || null,
      userType: input.userType as 'RENTER' | 'HOST' | 'SUPERHOST',
      emailVerificationToken: '', // Admin-created users don't need verification
      emailVerificationExpires: new Date(),
    });

    // Mark email as verified since admin created the account
    await this.userRepository.verifyEmail(user.id);

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.CREATE_USER,
      entityType: 'User',
      entityId: user.id,
      newValue: { email: input.email, userType: input.userType },
      metadata,
    });

    return user;
  }

  async updateUser(
    adminId: string,
    userId: string,
    input: UpdateUserInput,
    metadata?: Record<string, unknown>
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Build old value for audit
    const oldValue: Record<string, unknown> = {};
    const updateData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        oldValue[key] = (user as Record<string, unknown>)[key];
        updateData[key] = value;
      }
    }

    const updated = await this.userRepository.update(userId, updateData as Parameters<typeof this.userRepository.update>[1]);

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.UPDATE_USER,
      entityType: 'User',
      entityId: userId,
      oldValue,
      newValue: updateData,
      metadata,
    });

    return updated;
  }

  async suspendUser(
    adminId: string,
    userId: string,
    input: SuspendUserInput,
    metadata?: Record<string, unknown>
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.isAdmin) {
      throw ApiError.forbidden('Cannot suspend an admin user');
    }

    const updated = await this.userRepository.update(userId, {
      // @ts-expect-error - These fields exist but aren't in UpdateUserData type
      isSuspended: true,
      suspendedReason: input.reason,
    });

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.SUSPEND_USER,
      entityType: 'User',
      entityId: userId,
      oldValue: { isSuspended: false },
      newValue: { isSuspended: true, suspendedReason: input.reason },
      metadata,
    });

    return updated;
  }

  async unsuspendUser(
    adminId: string,
    userId: string,
    metadata?: Record<string, unknown>
  ): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updated = await this.userRepository.update(userId, {
      // @ts-expect-error - These fields exist but aren't in UpdateUserData type
      isSuspended: false,
      suspendedReason: null,
    });

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.UNSUSPEND_USER,
      entityType: 'User',
      entityId: userId,
      oldValue: { isSuspended: true, suspendedReason: user.suspendedReason },
      newValue: { isSuspended: false },
      metadata,
    });

    return updated;
  }

  // ==========================================
  // Report Moderation
  // ==========================================

  async resolveReport(
    adminId: string,
    reportId: string,
    input: ResolveReportInput,
    metadata?: Record<string, unknown>
  ): Promise<UserReport> {
    const report = await this.userReportRepository.findById(reportId);

    if (!report) {
      throw ApiError.notFound('Report not found');
    }

    const oldValue = { status: report.status };

    const updated = await this.userReportRepository.updateStatus(reportId, {
      status: 'RESOLVED',
      reviewedBy: adminId,
      resolution: input.resolution,
      actionTaken: input.actionTaken,
    });

    // Suspend user if requested
    if (input.suspendUser && input.suspensionReason) {
      await this.suspendUser(adminId, report.reportedId, { reason: input.suspensionReason }, metadata);
    }

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.RESOLVE_REPORT,
      entityType: 'UserReport',
      entityId: reportId,
      oldValue,
      newValue: { status: 'RESOLVED', actionTaken: input.actionTaken },
      metadata,
    });

    return updated;
  }

  async dismissReport(
    adminId: string,
    reportId: string,
    metadata?: Record<string, unknown>
  ): Promise<UserReport> {
    const report = await this.userReportRepository.findById(reportId);

    if (!report) {
      throw ApiError.notFound('Report not found');
    }

    const updated = await this.userReportRepository.updateStatus(reportId, {
      status: 'DISMISSED',
      reviewedBy: adminId,
    });

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.DISMISS_REPORT,
      entityType: 'UserReport',
      entityId: reportId,
      oldValue: { status: report.status },
      newValue: { status: 'DISMISSED' },
      metadata,
    });

    return updated;
  }

  // ==========================================
  // Spot Management
  // ==========================================

  async updateSpotStatus(
    adminId: string,
    spotId: string,
    input: UpdateSpotStatusInput,
    metadata?: Record<string, unknown>
  ): Promise<Spot> {
    const spot = await this.spotRepository.findById(spotId);

    if (!spot) {
      throw ApiError.notFound('Spot not found');
    }

    const oldValue = { status: spot.status };

    const updated = await this.spotRepository.update(spotId, spot.hostId, {
      status: input.status as SpotStatus,
    });

    // Log audit
    const action = input.status === 'ACTIVE' ? ADMIN_ACTIONS.APPROVE_SPOT :
                   input.status === 'REJECTED' ? ADMIN_ACTIONS.REJECT_SPOT :
                   ADMIN_ACTIONS.UPDATE_SPOT;

    await this.auditRepository.create({
      adminId,
      action,
      entityType: 'Spot',
      entityId: spotId,
      oldValue,
      newValue: { status: input.status, rejectionReason: input.rejectionReason },
      metadata,
    });

    return updated;
  }

  // ==========================================
  // Admin Management
  // ==========================================

  async createAdmin(
    adminId: string,
    input: CreateAdminInput,
    metadata?: Record<string, unknown>
  ): Promise<User> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.isAdmin) {
      throw ApiError.conflict('User is already an admin');
    }

    const updated = await this.userRepository.update(input.userId, {
      // @ts-expect-error - These fields exist but aren't in UpdateUserData type
      isAdmin: true,
      adminRole: input.role,
    });

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.CREATE_ADMIN,
      entityType: 'User',
      entityId: input.userId,
      oldValue: { isAdmin: false },
      newValue: { isAdmin: true, adminRole: input.role },
      metadata,
    });

    return updated;
  }

  async updateAdminRole(
    adminId: string,
    targetAdminId: string,
    input: UpdateAdminRoleInput,
    metadata?: Record<string, unknown>
  ): Promise<User> {
    const user = await this.userRepository.findById(targetAdminId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.isAdmin) {
      throw ApiError.badRequest('User is not an admin');
    }

    const oldValue = { adminRole: user.adminRole };

    const updated = await this.userRepository.update(targetAdminId, {
      // @ts-expect-error - These fields exist but aren't in UpdateUserData type
      adminRole: input.role,
    });

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.UPDATE_ADMIN_ROLE,
      entityType: 'User',
      entityId: targetAdminId,
      oldValue,
      newValue: { adminRole: input.role },
      metadata,
    });

    return updated;
  }

  async removeAdmin(
    adminId: string,
    targetAdminId: string,
    metadata?: Record<string, unknown>
  ): Promise<User> {
    const user = await this.userRepository.findById(targetAdminId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!user.isAdmin) {
      throw ApiError.badRequest('User is not an admin');
    }

    if (adminId === targetAdminId) {
      throw ApiError.badRequest('Cannot remove your own admin privileges');
    }

    const oldValue = { isAdmin: true, adminRole: user.adminRole };

    const updated = await this.userRepository.update(targetAdminId, {
      // @ts-expect-error - These fields exist but aren't in UpdateUserData type
      isAdmin: false,
      adminRole: null,
    });

    // Log audit
    await this.auditRepository.create({
      adminId,
      action: ADMIN_ACTIONS.REMOVE_ADMIN,
      entityType: 'User',
      entityId: targetAdminId,
      oldValue,
      newValue: { isAdmin: false },
      metadata,
    });

    return updated;
  }

  // ==========================================
  // Audit Logs
  // ==========================================

  async getAuditLogs(
    pagination: PaginationQuery,
    filters?: {
      adminId?: string;
      action?: string;
      entityType?: string;
    }
  ): Promise<PaginatedResult<AdminAuditLog>> {
    const result = await this.auditRepository.findAll(
      pagination.limit,
      pagination.offset,
      filters
    );

    return {
      data: result.logs,
      pagination: {
        total: result.total,
        limit: pagination.limit,
        offset: pagination.offset,
        hasMore: pagination.offset + result.logs.length < result.total,
      },
    };
  }
}
