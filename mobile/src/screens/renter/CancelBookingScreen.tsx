import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useBooking } from '../../contexts/BookingContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { RenterStackParamList } from '../../types';
import { Button, Card, Input } from '../../components/common';
import { format, differenceInHours } from 'date-fns';

type Props = NativeStackScreenProps<RenterStackParamList, 'CancelBooking'>;

type CancellationReason =
  | 'plans_changed'
  | 'found_better_option'
  | 'incorrect_booking'
  | 'safety_concerns'
  | 'other';

const CANCELLATION_REASONS: { value: CancellationReason; label: string }[] = [
  { value: 'plans_changed', label: 'My plans changed' },
  { value: 'found_better_option', label: 'Found a better parking option' },
  { value: 'incorrect_booking', label: 'Booked by mistake' },
  { value: 'safety_concerns', label: 'Safety or security concerns' },
  { value: 'other', label: 'Other reason' },
];

const CancelBookingScreen = ({ navigation, route }: Props) => {
  const { bookingId } = route.params;
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { upcomingBookings, cancelBooking } = useBooking();

  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const booking = upcomingBookings.find(b => b.id === bookingId);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.errorText}>Booking not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  const startDate = new Date(booking.startTime);
  const hoursUntilBooking = differenceInHours(startDate, new Date());
  const isFreeCancellation = hoursUntilBooking >= 24;
  const refundPercentage = isFreeCancellation ? 100 : hoursUntilBooking >= 1 ? 50 : 0;
  const refundAmount = (booking.pricing.total * refundPercentage) / 100;

  const handleCancel = async () => {
    if (!selectedReason) {
      Alert.alert('Select Reason', 'Please select a cancellation reason.');
      return;
    }

    Alert.alert(
      'Confirm Cancellation',
      `Are you sure you want to cancel this booking? You will receive a ${refundPercentage}% refund (€${refundAmount.toFixed(2)}).`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Combine reason and notes into a single cancellation reason
              const reasonLabel = CANCELLATION_REASONS.find(r => r.value === selectedReason)?.label ?? selectedReason;
              const fullReason = additionalNotes
                ? `${reasonLabel}: ${additionalNotes}`
                : reasonLabel;
              await cancelBooking(bookingId, fullReason);
              Alert.alert(
                'Booking Cancelled',
                'Your booking has been cancelled. The refund will be processed within 3-5 business days.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Warning Banner */}
        <View style={[styles.warningBanner, {
          backgroundColor: isFreeCancellation ? colors.lightest : NEUTRAL_COLORS.lightGray
        }]}>
          <Icon
            name={isFreeCancellation ? 'check-circle' : 'alert'}
            size={24}
            color={isFreeCancellation ? colors.primary : NEUTRAL_COLORS.darkGray}
          />
          <View style={styles.warningContent}>
            <Text style={[styles.warningTitle, {
              color: isFreeCancellation ? colors.dark : NEUTRAL_COLORS.darkGray
            }]}>
              {isFreeCancellation ? 'Free Cancellation' : 'Partial Refund'}
            </Text>
            <Text style={[styles.warningText, {
              color: isFreeCancellation ? colors.primary : NEUTRAL_COLORS.black
            }]}>
              {isFreeCancellation
                ? 'You can cancel for free up to 24 hours before your booking.'
                : `Cancelling now will result in a ${refundPercentage}% refund.`}
            </Text>
          </View>
        </View>

        {/* Booking Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Booking Details</Text>

          <View style={styles.detailRow}>
            <Icon name="map-marker" size={20} color={colors.primary} />
            <Text style={styles.detailText}>{booking.spot?.title}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {format(startDate, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="clock-outline" size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {format(startDate, 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Original Amount</Text>
            <Text style={styles.priceValue}>€{booking.pricing.total.toFixed(2)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Refund ({refundPercentage}%)</Text>
            <Text style={[styles.priceValue, { color: '#22c55e' }]}>
              €{refundAmount.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Cancellation Reason */}
        <Card style={styles.reasonCard}>
          <Text style={styles.cardTitle}>Reason for Cancellation</Text>
          <Text style={styles.reasonSubtitle}>
            Please let us know why you're cancelling
          </Text>

          <View style={styles.reasonsList}>
            {CANCELLATION_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.value;

              return (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonItem,
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.lightest },
                  ]}
                  onPress={() => setSelectedReason(reason.value)}
                >
                  <View style={[
                    styles.radioOuter,
                    isSelected && { borderColor: colors.primary },
                  ]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[
                    styles.reasonText,
                    isSelected && { color: colors.primary, fontWeight: '600' },
                  ]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedReason === 'other' && (
            <Input
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              placeholder="Please describe your reason..."
              multiline
              numberOfLines={4}
              containerStyle={styles.notesInput}
            />
          )}
        </Card>

        {/* Cancellation Policy */}
        <Card style={styles.policyCard}>
          <Text style={styles.cardTitle}>Cancellation Policy</Text>
          <View style={styles.policyItem}>
            <Icon name="check-circle" size={16} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.policyText}>Free cancellation up to 24 hours before booking</Text>
          </View>
          <View style={styles.policyItem}>
            <Icon name="alert-circle" size={16} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.policyText}>50% refund if cancelled 1-24 hours before</Text>
          </View>
          <View style={styles.policyItem}>
            <Icon name="close-circle" size={16} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.policyText}>No refund for cancellations less than 1 hour before</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Cancel Button */}
      <View style={styles.footer}>
        <Button
          title="Keep My Booking"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.keepButton}
        />
        <Button
          title="Cancel Booking"
          onPress={handleCancel}
          variant="danger"
          loading={isLoading}
          disabled={!selectedReason}
          style={styles.cancelButton}
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: NEUTRAL_COLORS.gray,
  },
  warningBanner: {
    flexDirection: 'row',
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: 2,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: 20,
  },
  summaryCard: {
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  detailText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginVertical: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  reasonCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  reasonSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },
  reasonsList: {
    gap: SPACING.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    gap: SPACING.sm,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: NEUTRAL_COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  notesInput: {
    marginTop: SPACING.md,
  },
  policyCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  policyText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
    gap: SPACING.sm,
  },
  keepButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
});

export default CancelBookingScreen;
