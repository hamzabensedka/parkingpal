import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, Badge } from '../../components/common';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type PeriodType = 'week' | 'month' | 'year' | 'all';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EarningTransaction {
  id: string;
  type: 'earning' | 'payout' | 'refund';
  amount: number;
  date: string;
  description: string;
  spotTitle?: string;
  renterName?: string;
}

const EarningsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');

  // Mock earnings data
  const earningsData = {
    totalEarnings: 4850.00,
    pendingPayout: 320.50,
    lastPayout: 1250.00,
    lastPayoutDate: subDays(new Date(), 7),
    thisMonth: 1580.00,
    lastMonth: 1420.00,
    totalBookings: 145,
    averagePerBooking: 33.45,
  };

  // Mock transactions
  const transactions: EarningTransaction[] = [
    {
      id: '1',
      type: 'earning',
      amount: 24.00,
      date: new Date().toISOString(),
      description: 'Booking completed',
      spotTitle: 'City Center Garage',
      renterName: 'Jean Dupont',
    },
    {
      id: '2',
      type: 'earning',
      amount: 18.50,
      date: subDays(new Date(), 1).toISOString(),
      description: 'Booking completed',
      spotTitle: 'Opera Parking',
      renterName: 'Marie Martin',
    },
    {
      id: '3',
      type: 'payout',
      amount: 1250.00,
      date: subDays(new Date(), 7).toISOString(),
      description: 'Payout to •••• 4242',
    },
    {
      id: '4',
      type: 'earning',
      amount: 35.00,
      date: subDays(new Date(), 8).toISOString(),
      description: 'Booking completed',
      spotTitle: 'City Center Garage',
      renterName: 'Pierre Bernard',
    },
    {
      id: '5',
      type: 'refund',
      amount: -12.00,
      date: subDays(new Date(), 10).toISOString(),
      description: 'Cancellation refund',
      spotTitle: 'Opera Parking',
    },
  ];

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

  const monthChange = ((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>€{earningsData.pendingPayout.toFixed(2)}</Text>
          <TouchableOpacity style={styles.payoutButton}>
            <Icon name="bank-transfer-out" size={18} color={colors.primary} />
            <Text style={[styles.payoutButtonText, { color: colors.primary }]}>
              Request Payout
            </Text>
          </TouchableOpacity>

          <View style={styles.lastPayoutRow}>
            <Text style={styles.lastPayoutText}>
              Last payout: €{earningsData.lastPayout.toFixed(2)} on {format(earningsData.lastPayoutDate, 'MMM d')}
            </Text>
          </View>
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
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.value && { color: NEUTRAL_COLORS.white },
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              €{earningsData.thisMonth.toFixed(0)}
            </Text>
            <View style={styles.statChange}>
              <Icon
                name={monthChange >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={monthChange >= 0 ? '#22c55e' : '#ef4444'}
              />
              <Text style={[
                styles.statChangeText,
                { color: monthChange >= 0 ? '#22c55e' : '#ef4444' },
              ]}>
                {monthChange >= 0 ? '+' : ''}{monthChange.toFixed(1)}%
              </Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              €{earningsData.totalEarnings.toFixed(0)}
            </Text>
            <Text style={styles.statSubtext}>All time</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Bookings</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {earningsData.totalBookings}
            </Text>
            <Text style={styles.statSubtext}>Completed</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Avg. Booking</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              €{earningsData.averagePerBooking.toFixed(0)}
            </Text>
            <Text style={styles.statSubtext}>Per booking</Text>
          </Card>
        </View>

        {/* Chart Placeholder */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Earnings Overview</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBars}>
              {[40, 65, 45, 80, 55, 70, 90].map((height, index) => (
                <View key={index} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: height,
                        backgroundColor: index === 6 ? colors.primary : colors.light,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </Text>
                </View>
              ))}
            </View>
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

          <Card style={styles.transactionsCard}>
            {transactions.map((transaction, index) => (
              <View key={transaction.id}>
                <TouchableOpacity style={styles.transactionItem}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: `${getTransactionColor(transaction.type)}20` },
                  ]}>
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

                  <Text style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction.type) },
                  ]}>
                    {transaction.amount >= 0 ? '+' : ''}€{Math.abs(transaction.amount).toFixed(2)}
                  </Text>
                </TouchableOpacity>

                {index < transactions.length - 1 && (
                  <View style={styles.transactionDivider} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Payout Settings */}
        <View style={styles.section}>
          <Card style={styles.payoutSettingsCard} onPress={() => navigation.navigate('PayoutSettings')}>
            <Icon name="bank" size={24} color={colors.primary} />
            <View style={styles.payoutSettingsInfo}>
              <Text style={styles.payoutSettingsTitle}>Payout Settings</Text>
              <Text style={styles.payoutSettingsDesc}>Bank Account •••• 4242</Text>
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
