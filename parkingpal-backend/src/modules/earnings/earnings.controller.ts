import { Request, Response, NextFunction } from 'express';
import { EarningsService } from './earnings.service';
import { EarningsQueryParams, TransactionsQueryParams } from './earnings.validation';
import { PeriodType } from '@parkingpal/shared-types';

/**
 * Earnings Controller
 * HTTP handlers for host earnings endpoints
 */
export class EarningsController {
  constructor(private readonly earningsService: EarningsService) {}

  /**
   * GET /api/earnings/dashboard
   * Get earnings dashboard data
   */
  getDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { period } = req.query as unknown as EarningsQueryParams;

      const dashboard = await this.earningsService.getDashboard(
        userId,
        period as PeriodType
      );

      res.json(dashboard);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/earnings/summary
   * Get earnings summary only
   */
  getSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { period } = req.query as unknown as EarningsQueryParams;

      const summary = await this.earningsService.getSummary(
        userId,
        period as PeriodType
      );

      res.json(summary);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/earnings/transactions
   * Get paginated transaction history
   */
  getTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { limit, offset } = req.query as unknown as TransactionsQueryParams;

      const result = await this.earningsService.getTransactions(
        userId,
        limit,
        offset
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
