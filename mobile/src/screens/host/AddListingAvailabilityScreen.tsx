import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { HostStackParamList, SpotAvailability } from '../../types';
import { Button, Card, AnimatedPressable } from '../../components/common';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingAvailability'>;

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AddListingAvailabilityScreen = ({ navigation, route }: Props) => {
  const { location, photos, spotType, amenities, vehicleSizes, accessInstructions, accessType, hourlyRate, dailyRate, numberOfSpots } = route.params;
  const { colors } = useTheme();

  const [availability, setAvailability] = useState<Record<string, SpotAvailability>>({
    Monday: { available: true },
    Tuesday: { available: true },
    Wednesday: { available: true },
    Thursday: { available: true },
    Friday: { available: true },
    Saturday: { available: true },
    Sunday: { available: true },
  });
  const [is24_7, setIs24_7] = useState(true);

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], available: !prev[day].available },
    }));
  };

  const handleContinue = () => {
    navigation.navigate('AddListingDescription', {
      location,
      photos,
      spotType,
      amenities,
      vehicleSizes,
      accessInstructions,
      accessType,
      hourlyRate,
      dailyRate,
      availability,
      numberOfSpots,
    });
  };

  const hasAvailability = Object.values(availability).some(day => day.available);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()} style={styles.header}>
          <Text style={styles.title}>Availability</Text>
          <Text style={styles.subtitle}>
            When is your parking spot available for rent?
          </Text>
        </Animated.View>

        {/* 24/7 Toggle */}
        <Card style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleLabel}>Available 24/7</Text>
              <Text style={styles.toggleDesc}>
                Your spot is always available for booking
              </Text>
            </View>
            <Switch
              value={is24_7}
              onValueChange={(value) => {
                setIs24_7(value);
                if (value) {
                  // Enable all days
                  setAvailability(prev => {
                    const updated = { ...prev };
                    DAYS_OF_WEEK.forEach(day => {
                      updated[day] = { available: true };
                    });
                    return updated;
                  });
                }
              }}
              trackColor={{ false: NEUTRAL_COLORS.lightGray, true: colors.medium }}
              thumbColor={is24_7 ? colors.primary : NEUTRAL_COLORS.white}
            />
          </View>
        </Card>

        {/* Days Selection */}
        {!is24_7 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Available Days</Text>
            <View style={styles.daysList}>
              {DAYS_OF_WEEK.map((day) => {
                const isAvailable = availability[day]?.available;
                return (
                  <AnimatedPressable
                    key={day}
                    style={[
                      styles.dayItem,
                      isAvailable && { borderColor: colors.primary, backgroundColor: colors.lightest },
                    ]}
                    onPress={() => toggleDay(day)}
                    haptic
                  >
                    <Text style={[
                      styles.dayLabel,
                      isAvailable && { color: colors.primary, fontWeight: '600' },
                    ]}>
                      {day}
                    </Text>
                    {isAvailable && (
                      <Icon name="check-circle" size={20} color={colors.primary} />
                    )}
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Info Box */}
        <View style={[styles.infoBox, { backgroundColor: colors.lightest }]}>
          <Icon name="information-outline" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: colors.dark }]}>Flexible Availability</Text>
            <Text style={styles.infoText}>
              You can customize specific time slots and manage bookings from your dashboard after listing your spot.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Text style={styles.progressNumber}>5</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.progressNumber}>6</Text>
          </View>
        </View>
        <View style={styles.footerButtons}>
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!hasAvailability}
            style={styles.continueButton}
          />
        </View>
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
  header: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    lineHeight: 24,
  },
  section: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  toggleCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  daysList: {
    gap: SPACING.sm,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  dayLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  infoBox: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: NEUTRAL_COLORS.lightGray,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});

export default AddListingAvailabilityScreen;
