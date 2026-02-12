/**
 * Earnings Types
 * DTOs for host earnings dashboard
 */

export type PeriodType = 'week' | 'month' | 'year' | 'all';

export type TransactionType = 'earning' | 'payout' | 'refund';

/**
 * Individual transaction in earnings history
 */
export interface EarningsTransactionDTO {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  bookingId?: string;
  spotId?: string;
  spotTitle?: string;
  renterName?: string;
}

/**
 * Summary statistics for earnings
 */
export interface EarningsSummaryDTO {
  totalEarnings: number;
  pendingPayout: number;
  lastPayout: number | null;
  lastPayoutDate: string | null;
  periodEarnings: number;
  previousPeriodEarnings: number;
  totalBookings: number;
  averagePerBooking: number;
}

/**
 * Daily earnings for chart
 */
export interface DailyEarningsDTO {
  date: string;
  amount: number;
  label: string;
}

/**
 * Full earnings dashboard response
 */
export interface EarningsDashboardDTO {
  summary: EarningsSummaryDTO;
  transactions: EarningsTransactionDTO[];
  chartData: DailyEarningsDTO[];
}

/**
 * Query params for earnings endpoint
 */
export interface EarningsQueryParams {
  period?: PeriodType;
  limit?: number;
  offset?: number;
}

/**
 * Transactions list response
 */
export interface EarningsTransactionsResponse {
  transactions: EarningsTransactionDTO[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Payout settings
 */
export interface PayoutSettingsDTO {
  stripeConnectAccountId: string | null;
  stripeConnectOnboarded: boolean;
  bankAccountLast4?: string;
  payoutSchedule?: string;
}
