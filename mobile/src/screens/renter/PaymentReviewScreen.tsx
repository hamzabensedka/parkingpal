import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { RenterStackParamList, PaymentMethod } from '../../types';
import { Button, Card, Input } from '../../components/common';
import { format } from 'date-fns';

type Props = NativeStackScreenProps<RenterStackParamList, 'PaymentReview'>;

const PaymentReviewScreen = ({ navigation, route }: Props) => {
  const {
    spotId,
    spotTitle,
    hourlyRate,
    startTime,
    endTime,
    duration,
    total = 0,
    vehicleId,
    vehicleName,
    vehiclePlate,
  } = route.params;

  const { colors } = useTheme();
  const { paymentMethods: authPaymentMethods, vehicles } = useAuth();
  const { createBooking } = useBooking();

  const vehicle = vehicles?.find((v) => v.id === vehicleId);

  const paymentMethods = authPaymentMethods || [];
  const defaultCard = paymentMethods.find((m) => m.isDefault) || paymentMethods[0];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(
    defaultCard || null
  );
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const serviceFee = total * 0.1; // 10% service fee
  const finalTotal = total + serviceFee - discount;

  // Keep selected payment in sync with auth (e.g. default card loads after login)
  useEffect(() => {
    const defaultCard = paymentMethods.find((m) => m.isDefault) || paymentMethods[0];
    if (defaultCard && !selectedPaymentMethod) {
      setSelectedPaymentMethod(defaultCard);
    }
  }, [paymentMethods]);

  const getCardIcon = (brand?: string) => {
    switch ((brand ?? '').toLowerCase()) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card';
      case 'amex':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'parking10') {
      setDiscount(total * 0.1);
      setPromoApplied(true);
      Alert.alert('Success', '10% discount applied!');
    } else if (promoCode.toLowerCase() === 'first5') {
      setDiscount(5);
      setPromoApplied(true);
      Alert.alert('Success', '€5 discount applied!');
    } else {
      Alert.alert('Invalid Code', 'The promo code is not valid or has expired.');
    }
  };

  const handleAddPaymentMethod = () => {
    navigation.navigate('AddPaymentCard' as any);
  };

  const handleConfirmBooking = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Payment Required', 'Please select a payment method.');
      return;
    }
    if (!vehicle) {
      Alert.alert('Vehicle required', 'Please go back and select a vehicle.');
      return;
    }

    setIsLoading(true);

    try {
      const booking = await createBooking({
        spotId,
        startTime,
        endTime,
        vehicle,
        hasInsurance: false,
        ...(promoApplied && promoCode ? { specialInstructions: `Promo: ${promoCode}` } : {}),
      });

      navigation.navigate('BookingConfirmation', {
        bookingId: booking.id,
        spotTitle,
        startTime,
        endTime,
        total: finalTotal,
        vehiclePlate,
      });
    } catch (error) {
      Alert.alert('Booking Failed', 'Unable to complete your booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Booking Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Booking Details</Text>

          <View style={styles.detailRow}>
            <Icon name="map-marker" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{spotTitle}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="calendar" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {format(startDate, 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="clock-outline" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>
                {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')} ({duration}h)
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="car" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>{vehicleName} • {vehiclePlate}</Text>
            </View>
          </View>
        </Card>

        {/* Payment Method */}
        <Card style={styles.paymentCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Payment Method</Text>
            <TouchableOpacity onPress={handleAddPaymentMethod}>
              <Text style={[styles.addLink, { color: colors.primary }]}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length === 0 ? (
            <TouchableOpacity
              style={styles.addPaymentButton}
              onPress={handleAddPaymentMethod}
            >
              <Icon name="credit-card-plus" size={24} color={colors.primary} />
              <Text style={[styles.addPaymentText, { color: colors.primary }]}>
                Add Payment Method
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.paymentMethods}>
              {paymentMethods.map((method) => {
                const isSelected = selectedPaymentMethod?.id === method.id;

                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodItem,
                      isSelected && { borderColor: colors.primary, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedPaymentMethod(method)}
                  >
                    <Icon
                      name={getCardIcon(method.brand)}
                      size={24}
                      color={isSelected ? colors.primary : NEUTRAL_COLORS.gray}
                    />
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodName}>
                        {method.brand ?? 'Card'} •••• {method.last4}
                      </Text>
                      <Text style={styles.paymentMethodExpiry}>
                        Expires {method.expiryMonth ?? '—'}/{method.expiryYear ?? '—'}
                      </Text>
                    </View>
                    {isSelected && (
                      <Icon name="check-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        {/* Promo Code */}
        <Card style={styles.promoCard}>
          <Text style={styles.cardTitle}>Promo Code</Text>
          <View style={styles.promoRow}>
            <Input
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter promo code"
              containerStyle={styles.promoInput}
              editable={!promoApplied}
            />
            <Button
              title={promoApplied ? 'Applied' : 'Apply'}
              onPress={handleApplyPromo}
              variant={promoApplied ? 'secondary' : 'outline'}
              disabled={!promoCode || promoApplied}
              size="small"
            />
          </View>
          {promoApplied && (
            <View style={styles.promoSuccess}>
              <Icon name="check-circle" size={16} color={NEUTRAL_COLORS.darkGray} />
              <Text style={styles.promoSuccessText}>
                Promo code "{promoCode}" applied - €{discount.toFixed(2)} off
              </Text>
            </View>
          )}
        </Card>

        {/* Price Breakdown */}
        <Card style={styles.priceCard}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              €{hourlyRate}/hour × {duration} hours
            </Text>
            <Text style={styles.priceValue}>€{total.toFixed(2)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>€{serviceFee.toFixed(2)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: NEUTRAL_COLORS.darkGray }]}>Discount</Text>
              <Text style={[styles.priceValue, { color: NEUTRAL_COLORS.darkGray }]}>
                -€{discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.priceDivider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              €{finalTotal.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Terms */}
        <Text style={styles.termsText}>
          By confirming, you agree to our Terms of Service and Cancellation Policy.
          You can cancel up to 1 hour before the booking starts for a full refund.
        </Text>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={[styles.footerTotal, { color: colors.primary }]}>
            €{finalTotal.toFixed(2)}
          </Text>
        </View>
        <Button
          title="Confirm & Pay"
          onPress={handleConfirmBooking}
          disabled={!selectedPaymentMethod}
          loading={isLoading}
          style={styles.confirmButton}
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
  detailsCard: {
    margin: SPACING.md,
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
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  detailContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.black,
    fontWeight: '500',
  },
  paymentCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  addLink: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: NEUTRAL_COLORS.lightGray,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  addPaymentText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  paymentMethods: {
    gap: SPACING.sm,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentMethodName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  paymentMethodExpiry: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  promoCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  promoInput: {
    flex: 1,
    marginBottom: 0,
  },
  promoSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  promoSuccessText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  priceCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
  },
  priceDivider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginVertical: SPACING.md,
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
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
  footerPrice: {
    marginRight: SPACING.md,
  },
  footerLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  footerTotal: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
  },
});

export default PaymentReviewScreen;
