import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { HostStackParamList } from '../../types';
import { Button, Card, Avatar, Badge, Loading } from '../../components/common';
import { format, differenceInSeconds } from 'date-fns';

type Props = NativeStackScreenProps<HostStackParamList, 'HostActiveBooking'>;

// Mock booking data
const mockBooking = {
  id: 'booking-123',
  status: 'active',
  renter: {
    id: 'renter-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    avatar: null,
    rating: 4.8,
    totalBookings: 24,
    phone: '+33612345678',
  },
  spot: {
    id: 'spot-1',
    title: 'City Center Garage',
    address: '123 Rue de la Paix, 75001 Paris',
  },
  vehicle: {
    make: 'Renault',
    model: 'Clio',
    licensePlate: 'AB-123-CD',
    color: 'Blue',
  },
  startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  endTime: new Date(Date.now() + 3600000 * 2).toISOString(), // 2 hours from now
  pricing: {
    hourlyRate: 4,
    total: 12,
    serviceFee: 1.8,
    hostEarnings: 10.2,
  },
};

const HostActiveBookingScreen = ({ navigation, route }: Props) => {
  const { bookingId } = route.params;
  const { colors } = useTheme();

  const [booking] = useState(mockBooking);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
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

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining(`${minutes}m remaining`);
      }

      setProgress((elapsedSeconds / totalSeconds) * 100);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [booking]);

  const handleContactRenter = useCallback(() => {
    navigation.navigate('Chat' as any, {
      conversationId: `${booking.renter.id}-${booking.id}`,
      recipientName: `${booking.renter.firstName} ${booking.renter.lastName}`,
    });
  }, [booking, navigation]);

  const handleCallRenter = useCallback(() => {
    Linking.openURL(`tel:${booking.renter.phone}`);
  }, [booking.renter.phone]);

  const handleReportIssue = useCallback(() => {
    navigation.navigate('ReportIssue' as any, { bookingId: booking.id });
  }, [booking, navigation]);

  const handleEndBookingEarly = useCallback(() => {
    Alert.alert(
      'End Booking Early?',
      'This will end the booking and issue a partial refund to the renter. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Booking',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Booking Ended', 'The renter has been notified.');
            navigation.goBack();
          },
        },
      ]
    );
  }, [navigation]);

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card style={[styles.statusCard, { borderColor: colors.primary }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.statusText}>Active Booking</Text>
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
        </Card>

        {/* Renter Info */}
        <Card style={styles.renterCard}>
          <View style={styles.renterHeader}>
            <Avatar
              name={booking.renter.firstName}
              imageUrl={booking.renter.avatar}
              size={56}
            />
            <View style={styles.renterInfo}>
              <Text style={styles.renterName}>
                {booking.renter.firstName} {booking.renter.lastName}
              </Text>
              <View style={styles.renterMeta}>
                <Icon name="star" size={14} color="#f59e0b" />
                <Text style={styles.renterRating}>
                  {booking.renter.rating} • {booking.renter.totalBookings} bookings
                </Text>
              </View>
            </View>
            <Badge text="Verified" variant="success" size="small" />
          </View>

          <View style={styles.contactButtons}>
            <Button
              title="Message"
              onPress={handleContactRenter}
              variant="outline"
              icon="message-text"
              size="small"
              style={styles.contactButton}
            />
            <Button
              title="Call"
              onPress={handleCallRenter}
              variant="outline"
              icon="phone"
              size="small"
              style={styles.contactButton}
            />
          </View>
        </Card>

        {/* Vehicle Info */}
        <Card style={styles.vehicleCard}>
          <Text style={styles.cardTitle}>Vehicle Information</Text>
          <View style={styles.vehicleDetails}>
            <View style={styles.vehicleRow}>
              <Icon name="car" size={20} color={colors.primary} />
              <Text style={styles.vehicleText}>
                {booking.vehicle.make} {booking.vehicle.model}
              </Text>
            </View>
            <View style={styles.vehicleRow}>
              <Icon name="palette" size={20} color={colors.primary} />
              <Text style={styles.vehicleText}>{booking.vehicle.color}</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Icon name="card-text" size={20} color={colors.primary} />
              <Text style={styles.vehiclePlate}>{booking.vehicle.licensePlate}</Text>
            </View>
          </View>
        </Card>

        {/* Booking Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Booking Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Spot</Text>
            <Text style={styles.detailValue}>{booking.spot.title}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {format(startDate, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rate</Text>
            <Text style={styles.detailValue}>€{booking.pricing.hourlyRate}/hour</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>€{booking.pricing.total.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Fee</Text>
            <Text style={styles.detailValue}>-€{booking.pricing.serviceFee.toFixed(2)}</Text>
          </View>

          <View style={[styles.detailRow, styles.earningsRow]}>
            <Text style={styles.earningsLabel}>Your Earnings</Text>
            <Text style={[styles.earningsValue, { color: colors.primary }]}>
              €{booking.pricing.hostEarnings.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Card style={styles.actionCard} onPress={handleReportIssue}>
            <Icon name="alert-circle" size={24} color="#f59e0b" />
            <Text style={styles.actionText}>Report Issue</Text>
            <Icon name="chevron-right" size={20} color={NEUTRAL_COLORS.gray} />
          </Card>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="End Booking Early"
          onPress={handleEndBookingEarly}
          variant="outline"
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
  statusCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 2,
  },
  statusHeader: {
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
    color: '#22c55e',
  },
  timeRemaining: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  progressContainer: {
    marginBottom: SPACING.sm,
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
  renterCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  renterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  renterInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  renterName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  renterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  renterRating: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  contactButton: {
    flex: 1,
  },
  vehicleCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  vehicleDetails: {
    gap: SPACING.sm,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  vehicleText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  vehiclePlate: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    letterSpacing: 1,
  },
  detailsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginVertical: SPACING.md,
  },
  earningsRow: {
    marginTop: SPACING.sm,
    marginBottom: 0,
  },
  earningsLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  earningsValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
  },
  actionsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  actionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    marginLeft: SPACING.md,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
});

export default HostActiveBookingScreen;
