import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { RenterStackParamList } from '../../types';
import { Button, Card } from '../../components/common';
import { format, addDays, addHours, startOfHour, isBefore, isAfter } from 'date-fns';
import { getSpotById } from '../../data/mockSpots';

type Props = NativeStackScreenProps<RenterStackParamList, 'BookingDateTime'>;

const BookingDateTimeScreen = ({ navigation, route }: Props) => {
  const { spotId, spotTitle: passedTitle, hourlyRate: passedRate } = route.params;
  const { colors } = useTheme();
  
  // Get spot data as fallback if params are missing
  const spot = useMemo(() => getSpotById(spotId), [spotId]);
  const spotTitle = passedTitle || spot?.title || 'Parking Spot';
  const hourlyRate = passedRate ?? spot?.hourlyRate ?? 0;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number>(1);

  // Generate next 7 days
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }, []);

  // Generate available time slots
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    const now = new Date();
    const startHour = selectedDate.toDateString() === now.toDateString()
      ? startOfHour(addHours(now, 1)).getHours()
      : 6;

    for (let hour = startHour; hour < 24; hour++) {
      const slot = new Date(selectedDate);
      slot.setHours(hour, 0, 0, 0);
      slots.push(slot);
    }
    return slots;
  }, [selectedDate]);

  // Duration options
  const durationOptions = [1, 2, 3, 4, 6, 8, 12, 24];

  const handleStartTimeSelect = (time: Date) => {
    setStartTime(time);
    setEndTime(addHours(time, duration));
  };

  const handleDurationSelect = (hours: number) => {
    setDuration(hours);
    if (startTime) {
      setEndTime(addHours(startTime, hours));
    }
  };

  const calculateTotal = () => {
    return (hourlyRate * duration).toFixed(2);
  };

  const handleContinue = () => {
    if (startTime && endTime) {
      navigation.navigate('VehicleSelection', {
        spotId,
        spotTitle,
        hourlyRate,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        total: parseFloat(calculateTotal()),
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Spot Info */}
        <Card style={styles.spotCard}>
          <Text style={styles.spotTitle}>{spotTitle}</Text>
          <Text style={styles.spotRate}>€{hourlyRate}/hour</Text>
        </Card>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateContainer}
          >
            {dates.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateItem,
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setSelectedDate(date);
                    setStartTime(null);
                    setEndTime(null);
                  }}
                >
                  <Text style={[
                    styles.dateDay,
                    isSelected && styles.dateTextSelected,
                  ]}>
                    {isToday ? 'Today' : format(date, 'EEE')}
                  </Text>
                  <Text style={[
                    styles.dateNumber,
                    isSelected && styles.dateTextSelected,
                  ]}>
                    {format(date, 'd')}
                  </Text>
                  <Text style={[
                    styles.dateMonth,
                    isSelected && styles.dateTextSelected,
                  ]}>
                    {format(date, 'MMM')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Time</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot, index) => {
              const isSelected = startTime && slot.getTime() === startTime.getTime();

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => handleStartTimeSelect(slot)}
                >
                  <Text style={[
                    styles.timeText,
                    isSelected && styles.timeTextSelected,
                  ]}>
                    {format(slot, 'HH:mm')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <View style={styles.durationGrid}>
            {durationOptions.map((hours) => {
              const isSelected = duration === hours;

              return (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.durationItem,
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => handleDurationSelect(hours)}
                >
                  <Text style={[
                    styles.durationText,
                    isSelected && styles.durationTextSelected,
                  ]}>
                    {hours}h
                  </Text>
                  <Text style={[
                    styles.durationPrice,
                    isSelected && styles.durationTextSelected,
                  ]}>
                    €{(hourlyRate * hours).toFixed(0)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        {startTime && endTime && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Icon name="calendar" size={20} color={colors.primary} />
              <Text style={styles.summaryText}>
                {format(startTime, 'EEE, MMM d, yyyy')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Icon name="clock-outline" size={20} color={colors.primary} />
              <Text style={styles.summaryText}>
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')} ({duration}h)
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={[styles.summaryTotal, { color: colors.primary }]}>
                €{calculateTotal()}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!startTime || !endTime}
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
  spotCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spotTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    flex: 1,
  },
  spotRate: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: NEUTRAL_COLORS.darkGray,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  dateContainer: {
    gap: SPACING.sm,
  },
  dateItem: {
    width: 70,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  dateDay: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
  },
  dateMonth: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 4,
  },
  dateTextSelected: {
    color: NEUTRAL_COLORS.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeSlot: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    minWidth: 70,
    alignItems: 'center',
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
  },
  timeTextSelected: {
    color: NEUTRAL_COLORS.white,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  durationItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    alignItems: 'center',
    minWidth: 80,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  durationTextSelected: {
    color: NEUTRAL_COLORS.white,
  },
  durationPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  summaryCard: {
    margin: SPACING.md,
    padding: SPACING.md,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginVertical: SPACING.md,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    flex: 1,
  },
  summaryTotal: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
});

export default BookingDateTimeScreen;
