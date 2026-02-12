import type { AxiosInstance } from 'axios';
import type {
  EarningsDashboardDTO,
  EarningsSummaryDTO,
  EarningsTransactionsResponse,
  PeriodType,
} from '@parkingpal/shared-types';

export interface EarningsApi {
  getDashboard(period?: PeriodType): Promise<EarningsDashboardDTO>;
  getSummary(period?: PeriodType): Promise<EarningsSummaryDTO>;
  getTransactions(limit?: number, offset?: number): Promise<EarningsTransactionsResponse>;
}

export const createEarningsApi = (client: AxiosInstance): EarningsApi => ({
  /**
   * Get full earnings dashboard data
   */
  async getDashboard(period: PeriodType = 'month'): Promise<EarningsDashboardDTO> {
    const response = await client.get<EarningsDashboardDTO>('/earnings/dashboard', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get earnings summary only
   */
  async getSummary(period: PeriodType = 'month'): Promise<EarningsSummaryDTO> {
    const response = await client.get<EarningsSummaryDTO>('/earnings/summary', {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get paginated transaction history
   */
  async getTransactions(
    limit: number = 20,
    offset: number = 0
  ): Promise<EarningsTransactionsResponse> {
    const response = await client.get<EarningsTransactionsResponse>('/earnings/transactions', {
      params: { limit, offset },
    });
    return response.data;
  },
});
