import { Router } from 'express';
import { earningsController, authenticate } from '../../container';
import { requireUserType } from '../../middleware/authenticate';
import { validateQuery } from '../../middleware/validate';
import { earningsQuerySchema, transactionsQuerySchema } from './earnings.validation';

const router = Router();

// All earnings routes require authentication and host user type
// Note: SUPERHOST is also allowed since they are elevated hosts

// GET /api/earnings/dashboard - Full earnings dashboard
router.get(
  '/dashboard',
  authenticate,
  requireUserType('host', 'superhost'),
  validateQuery(earningsQuerySchema),
  earningsController.getDashboard.bind(earningsController)
);

// GET /api/earnings/summary - Summary statistics only
router.get(
  '/summary',
  authenticate,
  requireUserType('host', 'superhost'),
  validateQuery(earningsQuerySchema),
  earningsController.getSummary.bind(earningsController)
);

// GET /api/earnings/transactions - Paginated transaction history
router.get(
  '/transactions',
  authenticate,
  requireUserType('host', 'superhost'),
  validateQuery(transactionsQuerySchema),
  earningsController.getTransactions.bind(earningsController)
);

export default router;
