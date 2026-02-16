import { Router } from 'express';
import { safetyController, authenticate } from '../../container';
import { validate, validateQuery } from '../../middleware/validate';
import { reportLimiter, blockLimiter } from '../../middleware/rateLimiter';
import {
  createReportSchema,
  blockUserSchema,
  safetyListQuerySchema,
} from './safety.validation';

const router = Router();

// ==========================================
// Report Routes
// ==========================================

// POST /api/safety/reports - Submit a report
router.post(
  '/reports',
  authenticate,
  reportLimiter,
  validate(createReportSchema),
  safetyController.submitReport.bind(safetyController)
);

// GET /api/safety/reports/submitted - Get reports I've submitted
router.get(
  '/reports/submitted',
  authenticate,
  validateQuery(safetyListQuerySchema),
  safetyController.getMySubmittedReports.bind(safetyController)
);

// GET /api/safety/reports/against - Get reports against me
router.get(
  '/reports/against',
  authenticate,
  validateQuery(safetyListQuerySchema),
  safetyController.getReportsAgainstMe.bind(safetyController)
);

// GET /api/safety/reports/:id - Get a specific report
router.get(
  '/reports/:id',
  authenticate,
  safetyController.getReport.bind(safetyController)
);

// ==========================================
// Block Routes
// ==========================================

// POST /api/safety/blocks - Block a user
router.post(
  '/blocks',
  authenticate,
  blockLimiter,
  validate(blockUserSchema),
  safetyController.blockUser.bind(safetyController)
);

// GET /api/safety/blocks - Get my blocked users
router.get(
  '/blocks',
  authenticate,
  validateQuery(safetyListQuerySchema),
  safetyController.getBlockedUsers.bind(safetyController)
);

// GET /api/safety/blocks/:userId/status - Check if user is blocked
router.get(
  '/blocks/:userId/status',
  authenticate,
  safetyController.checkBlockStatus.bind(safetyController)
);

// DELETE /api/safety/blocks/:userId - Unblock a user
router.delete(
  '/blocks/:userId',
  authenticate,
  safetyController.unblockUser.bind(safetyController)
);

export default router;
