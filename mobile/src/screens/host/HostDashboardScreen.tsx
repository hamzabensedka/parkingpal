import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, Avatar, Badge, AnimatedPressable } from '../../components/common';
import { format } from 'date-fns';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  trend?: { value: number; isPositive: boolean };
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, onPress }) => {
  const { colors } = useTheme();

  return (
    <Card style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: colors.lightest }]}>
        <Icon name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Icon
            name={trend.isPositive ? 'trending-up' : 'trending-down'}
            size={14}
            color={trend.isPositive ? '#22c55e' : '#ef4444'}
          />
          <Text style={[
            styles.trendText,
            { color: trend.isPositive ? '#22c55e' : '#ef4444' }
          ]}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </Text>
        </View>
      )}
    </Card>
  );
};

interface BookingItemProps {
  booking: {
    id: string;
    spotTitle: string;
    renterName: string;
    renterAvatar?: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'active' | 'completed';
    total: number;
  };
  onPress: () => void;
}

const BookingItem: React.FC<BookingItemProps> = ({ booking, onPress }) => {
  const { colors } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'active': return 'success';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  return (
    <AnimatedPressable style={styles.bookingItem} onPress={onPress} haptic>
      <Avatar name={booking.renterName} imageUrl={booking.renterAvatar} size={40} />
      <View style={styles.bookingInfo}>
        <Text style={styles.bookingRenter}>{booking.renterName}</Text>
        <Text style={styles.bookingSpot}>{booking.spotTitle}</Text>
        <Text style={styles.bookingTime}>
          {format(new Date(booking.startTime), 'MMM d, HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
        </Text>
      </View>
      <View style={styles.bookingRight}>
        <Badge text={booking.status} variant={getStatusColor(booking.status)} size="small" />
        <Text style={[styles.bookingTotal, { color: colors.primary }]}>
          €{booking.total.toFixed(2)}
        </Text>
      </View>
    </AnimatedPressable>
  );
};

const HostDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  // Mock data for dashboard
  const stats = {
    todayEarnings: 85.50,
    monthEarnings: 1250.00,
    activeBookings: 2,
    pendingBookings: 3,
    totalListings: 3,
    occupancyRate: 72,
  };

  const recentBookings = [
    {
      id: '1',
      spotTitle: 'City Center Garage',
      renterName: 'Jean Dupont',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000 * 2).toISOString(),
      status: 'active' as const,
      total: 12.00,
    },
    {
      id: '2',
      spotTitle: 'Opera Parking',
      renterName: 'Marie Martin',
      startTime: new Date(Date.now() + 3600000 * 4).toISOString(),
      endTime: new Date(Date.now() + 3600000 * 8).toISOString(),
      status: 'confirmed' as const,
      total: 24.00,
    },
    {
      id: '3',
      spotTitle: 'City Center Garage',
      renterName: 'Pierre Bernard',
      startTime: new Date(Date.now() + 3600000 * 6).toISOString(),
      endTime: new Date(Date.now() + 3600000 * 10).toISOString(),
      status: 'pending' as const,
      total: 20.00,
    },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleAddListing = () => {
    navigation.navigate('AddListingLocation');
  };

  const handleViewEarnings = () => {
    navigation.navigate('Earnings');
  };

  const handleViewBooking = (bookingId: string) => {
    navigation.navigate('HostActiveBooking', { bookingId });
  };

  const handleManageListings = () => {
    navigation.navigate('ListingManagement');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()} style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back,
            </Text>
            <Text style={styles.userName}>{user?.firstName}!</Text>
          </View>
          <AnimatedPressable onPress={() => navigation.navigate('HostProfile')} haptic>
            <Avatar name={user?.firstName} imageUrl={user?.avatar} size={48} />
          </AnimatedPressable>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.statsGrid}>
          <StatCard
            icon="cash"
            label="Today"
            value={`€${stats.todayEarnings.toFixed(2)}`}
            onPress={handleViewEarnings}
          />
          <StatCard
            icon="calendar-month"
            label="This Month"
            value={`€${stats.monthEarnings.toFixed(0)}`}
            trend={{ value: 12, isPositive: true }}
            onPress={handleViewEarnings}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.statsGrid}>
          <StatCard
            icon="car-clock"
            label="Active"
            value={stats.activeBookings.toString()}
          />
          <StatCard
            icon="clock-alert"
            label="Pending"
            value={stats.pendingBookings.toString()}
          />
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Card style={styles.actionCard} onPress={handleAddListing}>
              <View style={[styles.actionIcon, { backgroundColor: colors.lightest }]}>
                <Icon name="plus" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Add Listing</Text>
            </Card>

            <Card style={styles.actionCard} onPress={handleManageListings}>
              <View style={[styles.actionIcon, { backgroundColor: colors.lightest }]}>
                <Icon name="home-edit" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Manage Spots</Text>
            </Card>

            <Card style={styles.actionCard} onPress={handleViewEarnings}>
              <View style={[styles.actionIcon, { backgroundColor: colors.lightest }]}>
                <Icon name="chart-line" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Earnings</Text>
            </Card>

            <Card style={styles.actionCard} onPress={() => navigation.navigate('Messages')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.lightest }]}>
                <Icon name="message-text" size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Messages</Text>
            </Card>
          </View>
        </View>

        {/* Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <Card style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Total Listings</Text>
              <Text style={[styles.performanceValue, { color: colors.primary }]}>
                {stats.totalListings}
              </Text>
            </View>
            <View style={styles.performanceDivider} />
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Occupancy Rate</Text>
              <Text style={[styles.performanceValue, { color: colors.primary }]}>
                {stats.occupancyRate}%
              </Text>
            </View>
          </Card>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <AnimatedPressable onPress={() => navigation.navigate('Bookings')} haptic>
              <Text style={[styles.seeAllLink, { color: colors.primary }]}>See All</Text>
            </AnimatedPressable>
          </View>

          <Card style={styles.bookingsCard}>
            {recentBookings.map((booking, index) => (
              <React.Fragment key={booking.id}>
                <BookingItem
                  booking={booking}
                  onPress={() => handleViewBooking(booking.id)}
                />
                {index < recentBookings.length - 1 && (
                  <View style={styles.bookingDivider} />
                )}
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Tips Card */}
        <View style={styles.section}>
          <Card style={[styles.tipsCard, { backgroundColor: colors.lightest }]}>
            <Icon name="lightbulb" size={24} color={colors.primary} />
            <View style={styles.tipsContent}>
              <Text style={[styles.tipsTitle, { color: colors.dark }]}>
                Optimize Your Listings
              </Text>
              <Text style={styles.tipsText}>
                Spots with photos get 2x more bookings. Add photos to your listings today!
              </Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  trendText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  section: {
    padding: SPACING.md,
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
    marginBottom: SPACING.sm,
  },
  seeAllLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
    color: NEUTRAL_COLORS.darkGray,
    textAlign: 'center',
  },
  performanceCard: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
  },
  performanceDivider: {
    width: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginHorizontal: SPACING.md,
  },
  bookingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  bookingInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  bookingRenter: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  bookingSpot: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  bookingTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    marginTop: 2,
  },
  bookingRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  bookingTotal: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
  },
  bookingDivider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginLeft: 56 + SPACING.md,
  },
  tipsCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
});

export default HostDashboardScreen;
