import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { RenterStackParamList } from '../../types';
import { Button, Card } from '../../components/common';
import { format } from 'date-fns';

type Props = NativeStackScreenProps<RenterStackParamList, 'BookingConfirmation'>;

const BookingConfirmationScreen = ({ navigation, route }: Props) => {
  const { bookingId, spotTitle, startTime, endTime, total, vehiclePlate } = route.params;
  const { colors } = useTheme();

  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate checkmark
    Animated.parallel([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate content
    setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 300);
  }, []);

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just booked parking at ${spotTitle} on ${format(startDate, 'MMM d')} from ${format(startDate, 'HH:mm')} to ${format(endDate, 'HH:mm')}. Booking ID: ${bookingId.slice(0, 8)}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleViewBooking = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'RenterTabs',
            state: {
              routes: [
                { name: 'Map' },
                { name: 'Bookings' },
              ],
              index: 1,
            },
          },
        ],
      })
    );
  };

  const handleGoToMap = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'RenterTabs' }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              backgroundColor: colors.lightest,
              transform: [{ scale: checkmarkScale }],
              opacity: checkmarkOpacity,
            },
          ]}
        >
          <View style={[styles.checkmarkCircle, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={60} color={NEUTRAL_COLORS.white} />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.textContent, { opacity: contentOpacity }]}>
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your parking spot has been successfully reserved.
          </Text>

          {/* Booking Details Card */}
          <Card style={styles.detailsCard}>
            <View style={styles.bookingIdRow}>
              <Text style={styles.bookingIdLabel}>Booking ID</Text>
              <Text style={[styles.bookingId, { color: colors.primary }]}>
                #{bookingId.slice(0, 8).toUpperCase()}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Icon name="map-marker" size={20} color={colors.primary} />
              <Text style={styles.detailText} numberOfLines={2}>{spotTitle}</Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="calendar" size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {format(startDate, 'EEE, MMM d, yyyy')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="clock-outline" size={20} color={colors.primary} />
              <Text style={styles.detailText}>
                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="car" size={20} color={colors.primary} />
              <Text style={styles.detailText}>{vehiclePlate}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                €{total.toFixed(2)}
              </Text>
            </View>
          </Card>

          {/* Info Box */}
          <View style={[styles.infoBox, { backgroundColor: colors.lightest }]}>
            <Icon name="information" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.dark }]}>
              You'll receive a confirmation email with directions and access instructions.
            </Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="View My Bookings"
            onPress={handleViewBooking}
            fullWidth
          />
          <Button
            title="Back to Map"
            onPress={handleGoToMap}
            variant="outline"
            fullWidth
          />
          <Button
            title="Share"
            onPress={handleShare}
            variant="ghost"
            icon="share-variant"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['2xl'],
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  detailsCard: {
    width: '100%',
    padding: SPACING.md,
  },
  bookingIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingIdLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  bookingId: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginVertical: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
});

export default BookingConfirmationScreen;
