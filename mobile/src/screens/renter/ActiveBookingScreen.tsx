import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useBooking } from '../../contexts/BookingContext';
import { useError } from '../../contexts/ErrorContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { RenterStackParamList, Booking } from '../../types';
import { Button, Card, Loading } from '../../components/common';
import { format, differenceInSeconds, differenceInMinutes, differenceInHours } from 'date-fns';
import { openNavigation } from '../../services/osmService';

type Props = NativeStackScreenProps<RenterStackParamList, 'ActiveBooking'>;

const ActiveBookingScreen = ({ navigation, route }: Props) => {
  const { bookingId } = route.params;
  const { colors } = useTheme();
  const { activeBookings, extendBooking, endBookingEarly } = useBooking();
  const { showError } = useError();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [isExtending, setIsExtending] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    const foundBooking = activeBookings.find(b => b.id === bookingId);
    setBooking(foundBooking || null);
  }, [bookingId, activeBookings]);

  useEffect(() => {
    if (!booking) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(booking.endTime);
      const start = new Date(booking.startTime);

      const totalSeconds = differenceInSeconds(end, start);
      const elapsedSeconds = differenceInSeconds(now, start);
      const remainingSeconds = differenceInSeconds(end, now);

      if (remainingSeconds <= 0) {
        setTimeRemaining('Booking ended');
        setProgress(100);
        return;
      }

      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining(`${seconds}s remaining`);
      }

      setProgress((elapsedSeconds / totalSeconds) * 100);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  const handleExtend = useCallback(async (hours: number) => {
    if (!booking) return;

    setIsExtending(true);
    try {
      await extendBooking(booking.id, hours);
      Alert.alert('Success', `Your booking has been extended by ${hours} hour(s).`);
    } catch (error) {
      showError(error, () => handleExtend(hours));
    } finally {
      setIsExtending(false);
    }
  }, [booking, extendBooking]);

  const handleEndEarly = useCallback(async () => {
    if (!booking) return;

    Alert.alert(
      'End Booking Early?',
      'Are you sure you want to end your booking early? Remaining time will not be refunded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Booking',
          style: 'destructive',
          onPress: async () => {
            setIsEnding(true);
            try {
              await endBookingEarly(booking.id);
              navigation.goBack();
            } catch (error) {
              showError(error);
            } finally {
              setIsEnding(false);
            }
          },
        },
      ]
    );
  }, [booking, endBookingEarly, navigation]);

  const handleGetDirections = useCallback(() => {
    if (!booking?.spot) return;

    const { latitude, longitude } = booking.spot.location;
    openNavigation(
      { latitude, longitude },
      booking.spot.title || 'Parking Spot'
    );
  }, [booking]);

  const handleContactHost = useCallback(() => {
    if (!booking?.spot?.host) return;
    navigation.navigate('Chat' as any, {
      conversationId: `${booking.spot.host.id}-${booking.id}`,
      recipientName: `${booking.spot.host.firstName} ${booking.spot.host.lastName}`,
    });
  }, [booking, navigation]);

  const handleReportIssue = useCallback(() => {
    navigation.navigate('ReportIssue' as any, { bookingId: booking?.id });
  }, [booking, navigation]);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading />
      </SafeAreaView>
    );
  }

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Timer Card */}
        <Card style={[styles.timerCard, { borderColor: colors.primary }]}>
          <View style={styles.timerHeader}>
            <View style={[styles.statusDot, { backgroundColor: NEUTRAL_COLORS.darkGray }]} />
            <Text style={styles.statusText}>Active Session</Text>
          </View>

          <Text style={[styles.timeRemaining, { color: colors.primary }]}>
            {timeRemaining}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressTime}>{format(startDate, 'HH:mm')}</Text>
              <Text style={styles.progressTime}>{format(endDate, 'HH:mm')}</Text>
            </View>
          </View>

          <View style={styles.timeDetails}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Check In</Text>
              <Text style={styles.timeValue}>{format(startDate, 'HH:mm')}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Check Out</Text>
              <Text style={styles.timeValue}>{format(endDate, 'HH:mm')}</Text>
            </View>
          </View>
        </Card>

        {/* Spot Info */}
        <Card style={styles.spotCard}>
          <Text style={styles.cardTitle}>Parking Location</Text>
          <Text style={styles.spotTitle}>{booking.spot?.title}</Text>
          <Text style={styles.spotAddress}>{booking.spot?.address}</Text>

          <Button
            title="Get Directions"
            onPress={handleGetDirections}
            variant="outline"
            icon="navigation"
            fullWidth
            style={styles.directionsButton}
          />
        </Card>

        {/* Access Info */}
        <Card style={styles.accessCard}>
          <Text style={styles.cardTitle}>Access Information</Text>

          {booking.spot?.accessInstructions && (
            <View style={styles.accessRow}>
              <Icon name="key" size={20} color={colors.primary} />
              <Text style={styles.accessText}>{booking.spot.accessInstructions}</Text>
            </View>
          )}

          {booking.spot?.accessCode && (
            <View style={[styles.accessCodeContainer, { backgroundColor: colors.lightest }]}>
              <Text style={styles.accessCodeLabel}>Gate Code</Text>
              <Text style={[styles.accessCode, { color: colors.primary }]}>
                {booking.spot.accessCode}
              </Text>
            </View>
          )}
        </Card>

        {/* Vehicle Info */}
        <Card style={styles.vehicleCard}>
          <Text style={styles.cardTitle}>Your Vehicle</Text>
          <View style={styles.vehicleRow}>
            <Icon name="car" size={24} color={NEUTRAL_COLORS.gray} />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {booking.vehicle.make} {booking.vehicle.model}
              </Text>
              <Text style={styles.vehiclePlate}>{booking.vehicle.licensePlate}</Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Card style={styles.actionCard} onPress={handleContactHost}>
            <Icon name="message-text" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Contact Host</Text>
          </Card>

          <Card style={styles.actionCard} onPress={handleReportIssue}>
            <Icon name="alert-circle" size={24} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.actionText}>Report Issue</Text>
          </Card>
        </View>

        {/* Extend Booking */}
        <Card style={styles.extendCard}>
          <Text style={styles.cardTitle}>Need More Time?</Text>
          <Text style={styles.extendDescription}>
            Extend your booking if you need to stay longer.
          </Text>
          <View style={styles.extendOptions}>
            {[1, 2, 3].map((hours) => (
              <Button
                key={hours}
                title={`+${hours}h`}
                onPress={() => handleExtend(hours)}
                variant="outline"
                size="small"
                loading={isExtending}
                style={styles.extendButton}
              />
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* End Booking Button */}
      <View style={styles.footer}>
        <Button
          title="End Booking Early"
          onPress={handleEndEarly}
          variant="danger"
          loading={isEnding}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  timerCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 2,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
  },
  timeRemaining: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  progressTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
  },
  timeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  timeItem: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: NEUTRAL_COLORS.lightGray,
  },
  spotCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
  },
  spotTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  spotAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.md,
  },
  directionsButton: {
    marginTop: SPACING.sm,
  },
  accessCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  accessText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 22,
  },
  accessCodeContainer: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  accessCodeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 4,
  },
  accessCode: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    letterSpacing: 4,
  },
  vehicleCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  vehiclePlate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: NEUTRAL_COLORS.darkGray,
  },
  extendCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  extendDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.md,
  },
  extendOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  extendButton: {
    flex: 1,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
});

export default ActiveBookingScreen;
