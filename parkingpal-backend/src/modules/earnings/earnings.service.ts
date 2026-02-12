import { PrismaClient, BookingStatus, PaymentStatus } from '@prisma/client';
import {
  EarningsDashboardDTO,
  EarningsSummaryDTO,
  EarningsTransactionDTO,
  DailyEarningsDTO,
  EarningsTransactionsResponse,
  PeriodType,
} from '@parkingpal/shared-types';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  subDays,
  format,
  eachDayOfInterval,
} from 'date-fns';

/**
 * Earnings Service
 * Calculates and aggregates host earnings data
 */
export class EarningsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Get earnings dashboard data for a host
   */
  async getDashboard(hostId: string, period: PeriodType = 'month'): Promise<EarningsDashboardDTO> {
    const [summary, transactions, chartData] = await Promise.all([
      this.getSummary(hostId, period),
      this.getRecentTransactions(hostId, 10),
      this.getChartData(hostId, period),
    ]);

    return {
      summary,
      transactions,
      chartData,
    };
  }

  /**
   * Get earnings summary for a host
   */
  async getSummary(hostId: string, period: PeriodType = 'month'): Promise<EarningsSummaryDTO> {
    const { startDate, endDate, prevStartDate, prevEndDate } = this.getPeriodDates(period);

    // Get all completed bookings for this host
    const allCompletedBookings = await this.prisma.booking.findMany({
      where: {
        hostId,
        status: BookingStatus.COMPLETED,
        paymentStatus: { in: [PaymentStatus.CAPTURED, PaymentStatus.REFUNDED] },
      },
      select: {
        hostPayout: true,
        payoutAt: true,
        totalPrice: true,
        createdAt: true,
      },
    });

    // Calculate totals
    const totalEarnings = allCompletedBookings.reduce(
      (sum, b) => sum + (b.hostPayout || 0),
      0
    );

    // Pending payout (completed but not yet paid out)
    const pendingPayoutBookings = await this.prisma.booking.findMany({
      where: {
        hostId,
        status: BookingStatus.COMPLETED,
        paymentStatus: PaymentStatus.CAPTURED,
        payoutAt: null,
      },
      select: { hostPayout: true },
    });
    const pendingPayout = pendingPayoutBookings.reduce(
      (sum, b) => sum + (b.hostPayout || 0),
      0
    );

    // Last payout
    const lastPaidBooking = await this.prisma.booking.findFirst({
      where: {
        hostId,
        payoutAt: { not: null },
      },
      orderBy: { payoutAt: 'desc' },
      select: { hostPayout: true, payoutAt: true },
    });

    // Period earnings
    const periodBookings = await this.prisma.booking.findMany({
      where: {
        hostId,
        status: BookingStatus.COMPLETED,
        paymentStatus: { in: [PaymentStatus.CAPTURED, PaymentStatus.REFUNDED] },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { hostPayout: true },
    });
    const periodEarnings = periodBookings.reduce(
      (sum, b) => sum + (b.hostPayout || 0),
      0
    );

    // Previous period earnings
    const prevPeriodBookings = await this.prisma.booking.findMany({
      where: {
        hostId,
        status: BookingStatus.COMPLETED,
        paymentStatus: { in: [PaymentStatus.CAPTURED, PaymentStatus.REFUNDED] },
        createdAt: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
      select: { hostPayout: true },
    });
    const previousPeriodEarnings = prevPeriodBookings.reduce(
      (sum, b) => sum + (b.hostPayout || 0),
      0
    );

    // Total completed bookings
    const totalBookings = allCompletedBookings.length;
    const averagePerBooking = totalBookings > 0 ? totalEarnings / totalBookings : 0;

    return {
      totalEarnings,
      pendingPayout,
      lastPayout: lastPaidBooking?.hostPayout || null,
      lastPayoutDate: lastPaidBooking?.payoutAt?.toISOString() || null,
      periodEarnings,
      previousPeriodEarnings,
      totalBookings,
      averagePerBooking,
    };
  }

  /**
   * Get transactions list with pagination
   */
  async getTransactions(
    hostId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<EarningsTransactionsResponse> {
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          hostId,
          status: { in: [BookingStatus.COMPLETED, BookingStatus.CANCELLED] },
          paymentStatus: { in: [PaymentStatus.CAPTURED, PaymentStatus.REFUNDED] },
        },
        include: {
          spot: { select: { title: true } },
          renter: { select: { firstName: true, lastName: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.booking.count({
        where: {
          hostId,
          status: { in: [BookingStatus.COMPLETED, BookingStatus.CANCELLED] },
          paymentStatus: { in: [PaymentStatus.CAPTURED, PaymentStatus.REFUNDED] },
        },
      }),
    ]);

    const transactions: EarningsTransactionDTO[] = [];

    for (const booking of bookings) {
      // Add earning transaction
      if (booking.status === BookingStatus.COMPLETED && booking.hostPayout) {
        transactions.push({
          id: `${booking.id}-earning`,
          type: 'earning',
          amount: booking.hostPayout,
          date: booking.updatedAt.toISOString(),
          description: 'Booking completed',
          bookingId: booking.id,
          spotId: booking.spotId,
          spotTitle: booking.spot?.title,
          renterName: booking.renter
            ? `${booking.renter.firstName} ${booking.renter.lastName}`
            : undefined,
        });
      }

      // Add payout transaction if paid out
      if (booking.payoutAt && booking.hostPayout) {
        transactions.push({
          id: `${booking.id}-payout`,
          type: 'payout',
          amount: booking.hostPayout,
          date: booking.payoutAt.toISOString(),
          description: 'Payout processed',
          bookingId: booking.id,
        });
      }

      // Add refund transaction
      if (booking.paymentStatus === PaymentStatus.REFUNDED && booking.hostPayout) {
        transactions.push({
          id: `${booking.id}-refund`,
          type: 'refund',
          amount: -booking.hostPayout,
          date: (booking.cancelledAt || booking.updatedAt).toISOString(),
          description: 'Booking refunded',
          bookingId: booking.id,
          spotId: booking.spotId,
          spotTitle: booking.spot?.title,
        });
      }
    }

    // Sort by date descending
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get recent transactions (for dashboard)
   */
  private async getRecentTransactions(
    hostId: string,
    limit: number
  ): Promise<EarningsTransactionDTO[]> {
    const result = await this.getTransactions(hostId, limit, 0);
    return result.transactions.slice(0, limit);
  }

  /**
   * Get chart data for earnings visualization
   */
  private async getChartData(
    hostId: string,
    period: PeriodType
  ): Promise<DailyEarningsDTO[]> {
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;

    switch (period) {
      case 'week':
        startDate = subDays(now, 6);
        dateFormat = 'EEE';
        break;
      case 'month':
        startDate = subDays(now, 29);
        dateFormat = 'd';
        break;
      case 'year':
        startDate = subMonths(now, 11);
        dateFormat = 'MMM';
        break;
      case 'all':
      default:
        startDate = subMonths(now, 11);
        dateFormat = 'MMM';
        break;
    }

    // Get bookings in date range
    const bookings = await this.prisma.booking.findMany({
      where: {
        hostId,
        status: BookingStatus.COMPLETED,
        paymentStatus: PaymentStatus.CAPTURED,
        updatedAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        hostPayout: true,
        updatedAt: true,
      },
    });

    // Group by day/month
    const earningsByDate = new Map<string, number>();

    if (period === 'year' || period === 'all') {
      // Group by month
      for (const booking of bookings) {
        const key = format(booking.updatedAt, 'yyyy-MM');
        earningsByDate.set(
          key,
          (earningsByDate.get(key) || 0) + (booking.hostPayout || 0)
        );
      }

      // Generate monthly data
      const chartData: DailyEarningsDTO[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(now, i);
        const key = format(date, 'yyyy-MM');
        chartData.push({
          date: key,
          amount: earningsByDate.get(key) || 0,
          label: format(date, dateFormat),
        });
      }
      return chartData;
    } else {
      // Group by day
      for (const booking of bookings) {
        const key = format(booking.updatedAt, 'yyyy-MM-dd');
        earningsByDate.set(
          key,
          (earningsByDate.get(key) || 0) + (booking.hostPayout || 0)
        );
      }

      // Generate daily data
      const days = eachDayOfInterval({ start: startDate, end: now });
      return days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        return {
          date: key,
          amount: earningsByDate.get(key) || 0,
          label: format(day, dateFormat),
        };
      });
    }
  }

  /**
   * Get period date ranges
   */
  private getPeriodDates(period: PeriodType): {
    startDate: Date;
    endDate: Date;
    prevStartDate: Date;
    prevEndDate: Date;
  } {
    const now = new Date();

    switch (period) {
      case 'week': {
        const startDate = startOfWeek(now, { weekStartsOn: 1 });
        const endDate = endOfWeek(now, { weekStartsOn: 1 });
        const prevStartDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const prevEndDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        return { startDate, endDate, prevStartDate, prevEndDate };
      }
      case 'month': {
        const startDate = startOfMonth(now);
        const endDate = endOfMonth(now);
        const prevStartDate = startOfMonth(subMonths(now, 1));
        const prevEndDate = endOfMonth(subMonths(now, 1));
        return { startDate, endDate, prevStartDate, prevEndDate };
      }
      case 'year': {
        const startDate = startOfYear(now);
        const endDate = endOfYear(now);
        const prevStartDate = startOfYear(subYears(now, 1));
        const prevEndDate = endOfYear(subYears(now, 1));
        return { startDate, endDate, prevStartDate, prevEndDate };
      }
      case 'all':
      default: {
        const startDate = new Date(0);
        const endDate = now;
        const prevStartDate = new Date(0);
        const prevEndDate = new Date(0);
        return { startDate, endDate, prevStartDate, prevEndDate };
      }
    }
  }
}
