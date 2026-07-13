import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useBooking } from '../../contexts/BookingContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, BOOKING_STATUS } from '../../utils/constants';
import { formatBookingDateRange, formatCurrency } from '../../utils/formatting';
import { Booking } from '../../types';
import { Card, Badge, EmptyState, AnimatedPressable } from '../../components/common';

type TabType = 'upcoming' | 'active' | 'past';

const BookingHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { upcomingBookings, activeBookings, pastBookings, isLoading } = useBooking();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }, []);

  const getTabData = (): Booking[] => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBookings;
      case 'active':
        return activeBookings;
      case 'past':
        return pastBookings;
      default:
        return [];
    }
  };

  const handleBookingPress = useCallback((booking: Booking) => {
    if (booking.status === 'active') {
      navigation.navigate('ActiveBooking', { bookingId: booking.id });
    } else {
      navigation.navigate('SpotDetail', { spotId: booking.spotId });
    }
  }, [navigation]);

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusInfo = BOOKING_STATUS[item.status];

    return (
      <Card
        style={styles.bookingCard}
        onPress={() => handleBookingPress(item)}
        elevation="small"
      >
        <View style={styles.cardHeader}>
          <Text style={styles.spotTitle} numberOfLines={1}>
            {item.spot?.title || 'Parking Spot'}
          </Text>
          <Badge
            text={statusInfo.label}
            variant={
              item.status === 'active' ? 'success' :
              item.status === 'confirmed' ? 'info' :
              item.status === 'pending' ? 'warning' :
              item.status === 'cancelled' ? 'error' : 'default'
            }
            size="small"
          />
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color={NEUTRAL_COLORS.gray} />
            <Text style={styles.detailText}>
              {formatBookingDateRange(item.startTime, item.endTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="car" size={16} color={NEUTRAL_COLORS.gray} />
            <Text style={styles.detailText}>
              {item.vehicle.make} {item.vehicle.model} • {item.vehicle.licensePlate}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatCurrency(item.pricing.total)}
          </Text>
          <Icon name="chevron-right" size={20} color={NEUTRAL_COLORS.gray} />
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => {
    const emptyMessages: Record<TabType, { title: string; description: string }> = {
      upcoming: {
        title: 'No upcoming bookings',
        description: 'Search for parking spots and book your first spot!',
      },
      active: {
        title: 'No active bookings',
        description: "You don't have any active parking sessions.",
      },
      past: {
        title: 'No past bookings',
        description: 'Your completed bookings will appear here.',
      },
    };

    return (
      <EmptyState
        icon={activeTab === 'upcoming' ? 'calendar-blank' : 'history'}
        title={emptyMessages[activeTab].title}
        description={emptyMessages[activeTab].description}
        actionLabel={activeTab === 'upcoming' ? 'Find Parking' : undefined}
        onAction={activeTab === 'upcoming' ? () => navigation.navigate('Map') : undefined}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Tabs */}
      <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
        <View style={styles.tabsContainer}>
          {(['upcoming', 'active', 'past'] as TabType[]).map((tab) => (
            <AnimatedPressable
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { borderBottomColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab)}
              haptic
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && { color: colors.primary, fontWeight: '600' },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </AnimatedPressable>
          ))}
        </View>
      </Animated.View>

      {/* Bookings List */}
      <FlatList
        data={getTabData()}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  bookingCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  spotTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardDetails: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detailText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
});

export default BookingHistoryScreen;
