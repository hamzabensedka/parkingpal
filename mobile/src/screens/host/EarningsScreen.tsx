import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card } from '../../components/common';
import { format } from 'date-fns';
import { earningsApi } from '../../services/api';
import type {
  EarningsDashboardDTO,
  EarningsTransactionDTO,
  DailyEarningsDTO,
  PeriodType,
} from '@parkingpal/shared-types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EarningsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [dashboard, setDashboard] = useState<EarningsDashboardDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (period: PeriodType) => {
    try {
      setError(null);
      const data = await earningsApi.getDashboard(period);
      setDashboard(data);
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load earnings');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchDashboard(selectedPeriod).finally(() => setIsLoading(false));
  }, [selectedPeriod, fetchDashboard]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDashboard(selectedPeriod);
    setIsRefreshing(false);
  }, [selectedPeriod, fetchDashboard]);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  const periods: { value: PeriodType; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return 'cash-plus';
      case 'payout':
        return 'bank-transfer-out';
      case 'refund':
        return 'cash-minus';
      default:
        return 'cash';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning':
        return '#22c55e';
      case 'payout':
        return colors.primary;
      case 'refund':
        return '#ef4444';
      default:
        return NEUTRAL_COLORS.gray;
    }
  };

  // Calculate period change percentage
  const periodChange = dashboard?.summary
    ? dashboard.summary.previousPeriodEarnings > 0
      ? ((dashboard.summary.periodEarnings - dashboard.summary.previousPeriodEarnings) /
          dashboard.summary.previousPeriodEarnings) *
        100
      : dashboard.summary.periodEarnings > 0
      ? 100
      : 0
    : 0;

  // Normalize chart data for display
  const getChartBarHeight = (chartData: DailyEarningsDTO[]): number[] => {
    if (!chartData || chartData.length === 0) return [];
    const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);
    return chartData.map((d) => Math.max(10, (d.amount / maxAmount) * 100));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchDashboard(selectedPeriod)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const summary = dashboard?.summary;
  const transactions = dashboard?.transactions || [];
  const chartData = dashboard?.chartData || [];
  const chartHeights = getChartBarHeight(chartData);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            €{(summary?.pendingPayout || 0).toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.payoutButton}>
            <Icon name="bank-transfer-out" size={18} color={colors.primary} />
            <Text style={[styles.payoutButtonText, { color: colors.primary }]}>
              Request Payout
            </Text>
          </TouchableOpacity>

          {summary?.lastPayout && summary?.lastPayoutDate && (
            <View style={styles.lastPayoutRow}>
              <Text style={styles.lastPayoutText}>
                Last payout: €{summary.lastPayout.toFixed(2)} on{' '}
                {format(new Date(summary.lastPayoutDate), 'MMM d')}
              </Text>
            </View>
          )}
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && { backgroundColor: colors.primary },
              ]}
              onPress={() => handlePeriodChange(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && { color: NEUTRAL_COLORS.white },
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>This Period</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              €{(summary?.periodEarnings || 0).toFixed(0)}
            </Text>
            <View style={styles.statChange}>
              <Icon
                name={periodChange >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={periodChange >= 0 ? '#22c55e' : '#ef4444'}
              />
              <Text
                style={[
                  styles.statChangeText,
                  { color: periodChange >= 0 ? '#22c55e' : '#ef4444' },
                ]}
              >
                {periodChange >= 0 ? '+' : ''}
                {periodChange.toFixed(1)}%
              </Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              €{(summary?.totalEarnings || 0).toFixed(0)}
            </Text>
            <Text style={styles.statSubtext}>All time</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Bookings</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {summary?.totalBookings || 0}
            </Text>
            <Text style={styles.statSubtext}>Completed</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Booking</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              €{(summary?.averagePerBooking || 0).toFixed(0)}
            </Text>
            <Text style={styles.statSubtext}>Per booking</Text>
          </Card>
        </View>

        {/* Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Earnings Overview</Text>
          <View style={styles.chartPlaceholder}>
            {chartData.length > 0 ? (
              <View style={styles.chartBars}>
                {chartData.slice(-7).map((data, index) => (
                  <View key={data.date} style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: chartHeights[chartHeights.length - 7 + index] || 10,
                          backgroundColor:
                            index === chartData.slice(-7).length - 1
                              ? colors.primary
                              : colors.light,
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{data.label}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noChartData}>
                <Text style={styles.noDataText}>No data for this period</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllLink, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length > 0 ? (
            <Card style={styles.transactionsCard}>
              {transactions.map((transaction: EarningsTransactionDTO, index: number) => (
                <View key={transaction.id}>
                  <TouchableOpacity style={styles.transactionItem}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: `${getTransactionColor(transaction.type)}20` },
                      ]}
                    >
                      <Icon
                        name={getTransactionIcon(transaction.type)}
                        size={20}
                        color={getTransactionColor(transaction.type)}
                      />
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDesc}>{transaction.description}</Text>
                      {transaction.spotTitle && (
                        <Text style={styles.transactionSpot}>
                          {transaction.spotTitle}
                          {transaction.renterName && ` • ${transaction.renterName}`}
                        </Text>
                      )}
                      <Text style={styles.transactionDate}>
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: getTransactionColor(transaction.type) },
                      ]}
                    >
                      {transaction.amount >= 0 ? '+' : ''}€
                      {Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </TouchableOpacity>

                  {index < transactions.length - 1 && (
                    <View style={styles.transactionDivider} />
                  )}
                </View>
              ))}
            </Card>
          ) : (
            <Card style={styles.emptyTransactionsCard}>
              <Icon name="cash-remove" size={40} color={NEUTRAL_COLORS.gray} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Complete bookings to start earning
              </Text>
            </Card>
          )}
        </View>

        {/* Payout Settings */}
        <View style={styles.section}>
          <Card
            style={styles.payoutSettingsCard}
            onPress={() => navigation.navigate('PayoutSettings')}
          >
            <Icon name="bank" size={24} color={colors.primary} />
            <View style={styles.payoutSettingsInfo}>
              <Text style={styles.payoutSettingsTitle}>Payout Settings</Text>
              <Text style={styles.payoutSettingsDesc}>Manage your bank account</Text>
            </View>
            <Icon name="chevron-right" size={24} color={NEUTRAL_COLORS.gray} />
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
  balanceCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.white,
    marginBottom: SPACING.md,
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  payoutButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  lastPayoutRow: {
    marginTop: SPACING.md,
  },
  lastPayoutText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  periodButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    width: (SCREEN_WIDTH - SPACING.md * 3) / 2,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  statChangeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  statSubtext: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  chartCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  chartTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  chartPlaceholder: {
    height: 140,
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  barLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
  },
  noChartData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  seeAllLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  transactionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  emptyTransactionsCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: SPACING.xs,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
  },
  transactionSpot: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
  transactionDivider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginLeft: 56 + SPACING.md,
  },
  payoutSettingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  payoutSettingsInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  payoutSettingsTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  payoutSettingsDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
});

export default EarningsScreen;
