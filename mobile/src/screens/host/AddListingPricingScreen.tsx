import React, { useState, useMemo } from 'react';
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
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { HostStackParamList } from '../../types';
import { Button, Input, Card } from '../../components/common';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingPricing'>;

const SERVICE_FEE_PERCENTAGE = 0.15; // 15% service fee

const AddListingPricingScreen = ({ navigation, route }: Props) => {
  const { location, photos, spotType, amenities, vehicleSizes, accessInstructions, accessType, numberOfSpots } = route.params;
  const { colors } = useTheme();

  const [hourlyRate, setHourlyRate] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [weeklyRate, setWeeklyRate] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [isInstantBook, setIsInstantBook] = useState(true);
  const [minimumBookingHours, setMinimumBookingHours] = useState('1');

  const suggestedPrices = useMemo(() => {
    // In real app, this would be based on location, amenities, etc.
    return {
      hourly: { min: 2, max: 8, suggested: 4 },
      daily: { min: 15, max: 50, suggested: 25 },
      weekly: { min: 80, max: 250, suggested: 150 },
      monthly: { min: 300, max: 800, suggested: 500 },
    };
  }, []);

  const calculateEarnings = (rate: string, period: 'hourly' | 'daily') => {
    const numRate = parseFloat(rate) || 0;
    const serviceFee = numRate * SERVICE_FEE_PERCENTAGE;
    return (numRate - serviceFee).toFixed(2);
  };

  const handleApplySuggested = (type: 'hourly' | 'daily' | 'weekly' | 'monthly') => {
    switch (type) {
      case 'hourly':
        setHourlyRate(suggestedPrices.hourly.suggested.toString());
        break;
      case 'daily':
        setDailyRate(suggestedPrices.daily.suggested.toString());
        break;
      case 'weekly':
        setWeeklyRate(suggestedPrices.weekly.suggested.toString());
        break;
      case 'monthly':
        setMonthlyRate(suggestedPrices.monthly.suggested.toString());
        break;
    }
  };

  const handleContinue = () => {
    if (!hourlyRate || parseFloat(hourlyRate) <= 0) {
      Alert.alert('Set Hourly Rate', 'Please set at least an hourly rate for your listing.');
      return;
    }

    navigation.navigate('AddListingAvailability', {
      location,
      photos,
      spotType,
      amenities,
      vehicleSizes,
      accessInstructions,
      accessType,
      hourlyRate: parseFloat(hourlyRate),
      dailyRate: dailyRate ? parseFloat(dailyRate) : undefined,
      numberOfSpots,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Pricing Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>Set Your Pricing</Text>
          <Text style={styles.subtitle}>
            Competitive pricing helps you get more bookings. You can adjust prices anytime.
          </Text>
        </View>

        {/* Hourly Rate */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hourly Rate (Required)</Text>
            <TouchableOpacity onPress={() => handleApplySuggested('hourly')}>
              <Text style={[styles.suggestedLink, { color: colors.primary }]}>
                Use Suggested €{suggestedPrices.hourly.suggested}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.priceInputRow}>
            <Text style={styles.currencySymbol}>€</Text>
            <Input
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="0.00"
              keyboardType="decimal-pad"
              containerStyle={styles.priceInput}
            />
            <Text style={styles.perText}>/hour</Text>
          </View>
          {hourlyRate && (
            <View style={styles.earningsRow}>
              <Icon name="information" size={16} color={colors.primary} />
              <Text style={styles.earningsText}>
                You'll earn €{calculateEarnings(hourlyRate, 'hourly')}/hour after service fees
              </Text>
            </View>
          )}
          <Text style={styles.rangeText}>
            Similar spots: €{suggestedPrices.hourly.min} - €{suggestedPrices.hourly.max}/hour
          </Text>
        </View>

        {/* Daily Rate */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Rate (Optional)</Text>
            <TouchableOpacity onPress={() => handleApplySuggested('daily')}>
              <Text style={[styles.suggestedLink, { color: colors.primary }]}>
                Use Suggested €{suggestedPrices.daily.suggested}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.priceInputRow}>
            <Text style={styles.currencySymbol}>€</Text>
            <Input
              value={dailyRate}
              onChangeText={setDailyRate}
              placeholder="0.00"
              keyboardType="decimal-pad"
              containerStyle={styles.priceInput}
            />
            <Text style={styles.perText}>/day</Text>
          </View>
          <Text style={styles.rangeText}>
            Similar spots: €{suggestedPrices.daily.min} - €{suggestedPrices.daily.max}/day
          </Text>
        </View>

        {/* Weekly Rate */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Rate (Optional)</Text>
            <TouchableOpacity onPress={() => handleApplySuggested('weekly')}>
              <Text style={[styles.suggestedLink, { color: colors.primary }]}>
                Use Suggested €{suggestedPrices.weekly.suggested}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.priceInputRow}>
            <Text style={styles.currencySymbol}>€</Text>
            <Input
              value={weeklyRate}
              onChangeText={setWeeklyRate}
              placeholder="0.00"
              keyboardType="decimal-pad"
              containerStyle={styles.priceInput}
            />
            <Text style={styles.perText}>/week</Text>
          </View>
        </View>

        {/* Monthly Rate */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monthly Rate (Optional)</Text>
            <TouchableOpacity onPress={() => handleApplySuggested('monthly')}>
              <Text style={[styles.suggestedLink, { color: colors.primary }]}>
                Use Suggested €{suggestedPrices.monthly.suggested}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.priceInputRow}>
            <Text style={styles.currencySymbol}>€</Text>
            <Input
              value={monthlyRate}
              onChangeText={setMonthlyRate}
              placeholder="0.00"
              keyboardType="decimal-pad"
              containerStyle={styles.priceInput}
            />
            <Text style={styles.perText}>/month</Text>
          </View>
        </View>

        {/* Booking Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Options</Text>

          {/* Instant Book Toggle */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsInstantBook(!isInstantBook)}
          >
            <View style={styles.toggleInfo}>
              <Icon name="lightning-bolt" size={24} color={colors.primary} />
              <View style={styles.toggleText}>
                <Text style={styles.toggleLabel}>Instant Book</Text>
                <Text style={styles.toggleDesc}>
                  Allow renters to book immediately without your approval
                </Text>
              </View>
            </View>
            <View style={[
              styles.toggleSwitch,
              isInstantBook && { backgroundColor: colors.primary },
            ]}>
              <View style={[
                styles.toggleKnob,
                isInstantBook && styles.toggleKnobActive,
              ]} />
            </View>
          </TouchableOpacity>

          {/* Minimum Booking */}
          <View style={styles.minimumBookingRow}>
            <Text style={styles.minimumLabel}>Minimum Booking Duration</Text>
            <View style={styles.minimumPicker}>
              {['1', '2', '3', '4'].map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.minimumOption,
                    minimumBookingHours === hours && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setMinimumBookingHours(hours)}
                >
                  <Text style={[
                    styles.minimumOptionText,
                    minimumBookingHours === hours && { color: NEUTRAL_COLORS.white },
                  ]}>
                    {hours}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Earnings Estimate */}
        <Card style={[styles.estimateCard, { backgroundColor: colors.lightest }]}>
          <Icon name="chart-line" size={24} color={colors.primary} />
          <View style={styles.estimateContent}>
            <Text style={[styles.estimateTitle, { color: colors.dark }]}>
              Potential Earnings
            </Text>
            <Text style={styles.estimateDesc}>
              With similar spots in this area averaging 20 hours/month bookings, you could earn
            </Text>
            <Text style={[styles.estimateAmount, { color: colors.primary }]}>
              €{((parseFloat(hourlyRate) || suggestedPrices.hourly.suggested) * 20 * (1 - SERVICE_FEE_PERCENTAGE)).toFixed(0)}/month
            </Text>
          </View>
        </Card>

        {/* Fee Info */}
        <View style={styles.feeInfo}>
          <Icon name="information" size={16} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.feeText}>
            ParkingPal charges a 15% service fee on all bookings. This helps us maintain the platform and provide support.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <View style={[
                styles.progressStep,
                { backgroundColor: step <= 4 ? colors.primary : NEUTRAL_COLORS.lightGray },
              ]}>
                {step < 4 ? (
                  <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
                ) : (
                  <Text style={styles.progressNumber}>{step}</Text>
                )}
              </View>
              {step < 4 && (
                <View style={[
                  styles.progressLine,
                  { backgroundColor: step < 4 ? colors.primary : NEUTRAL_COLORS.lightGray },
                ]} />
              )}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.footerButtons}>
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Preview Listing"
            onPress={handleContinue}
            disabled={!hourlyRate}
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
  infoSection: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
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
    lineHeight: 22,
  },
  section: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    marginTop: SPACING.sm,
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
  suggestedLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginRight: SPACING.sm,
  },
  priceInput: {
    flex: 1,
    marginBottom: 0,
  },
  perText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    marginLeft: SPACING.sm,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  earningsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  rangeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: SPACING.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: SPACING.md,
  },
  toggleText: {
    flex: 1,
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
    lineHeight: 20,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    justifyContent: 'center',
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: NEUTRAL_COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  minimumBookingRow: {
    paddingTop: SPACING.md,
  },
  minimumLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
  },
  minimumPicker: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  minimumOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  minimumOptionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
  },
  estimateCard: {
    flexDirection: 'row',
    margin: SPACING.md,
    padding: SPACING.md,
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  estimateContent: {
    flex: 1,
  },
  estimateTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  estimateDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  estimateAmount: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  feeText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
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

export default AddListingPricingScreen;
