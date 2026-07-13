import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Button, Input, Card, AnimatedPressable } from '../../components/common';

const AddPaymentCardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { addPaymentMethod, paymentMethods } = useAuth();
  const { showError } = useError();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(paymentMethods.length === 0);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  }>({});

  // Format card number with spaces every 4 digits
  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (text: string): string => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  // Detect card brand from number
  const detectCardBrand = (number: string): string | undefined => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'amex';
    return undefined;
  };

  const getCardBrandIcon = (): string => {
    const brand = detectCardBrand(cardNumber);
    switch (brand) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card-outline';
      case 'amex':
        return 'credit-card-multiple';
      default:
        return 'credit-card-plus-outline';
    }
  };

  const getCardBrandLabel = (): string => {
    const brand = detectCardBrand(cardNumber);
    switch (brand) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      default:
        return '';
    }
  };

  const handleCardNumberChange = useCallback((text: string) => {
    setCardNumber(formatCardNumber(text));
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }));
    }
  }, [errors.cardNumber]);

  const handleExpiryChange = useCallback((text: string) => {
    setExpiryDate(formatExpiryDate(text));
    if (errors.expiryDate) {
      setErrors((prev) => ({ ...prev, expiryDate: undefined }));
    }
  }, [errors.expiryDate]);

  const handleCvvChange = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    setCvv(cleaned);
    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: undefined }));
    }
  }, [errors.cvv]);

  const handleCardholderNameChange = useCallback((text: string) => {
    setCardholderName(text);
    if (errors.cardholderName) {
      setErrors((prev) => ({ ...prev, cardholderName: undefined }));
    }
  }, [errors.cardholderName]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const cleanedNumber = cardNumber.replace(/\s/g, '');

    if (!cleanedNumber || cleanedNumber.length < 15) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!expiryDate || expiryDate.length < 5) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const [monthStr, yearStr] = expiryDate.split('/');
      const month = parseInt(monthStr, 10);
      const year = parseInt(yearStr, 10) + 2000;
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const cleanedNumber = cardNumber.replace(/\s/g, '');
      const [monthStr, yearStr] = expiryDate.split('/');

      await addPaymentMethod({
        type: 'card',
        last4: cleanedNumber.slice(-4),
        brand: detectCardBrand(cardNumber),
        expiryMonth: parseInt(monthStr, 10),
        expiryYear: parseInt(yearStr, 10) + 2000,
        isDefault,
      });

      Alert.alert('Success', 'Payment card added successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    cardNumber,
    expiryDate,
    cvv,
    cardholderName,
    isDefault,
    addPaymentMethod,
    navigation,
  ]);

  const isFormComplete =
    cardNumber.replace(/\s/g, '').length >= 15 &&
    expiryDate.length === 5 &&
    cvv.length >= 3 &&
    cardholderName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Preview */}
          <Animated.View
            entering={FadeInDown.delay(0).duration(500).springify()}
            style={[
              styles.cardPreview,
              { backgroundColor: colors.dark },
            ]}
          >
            <View style={styles.previewHeader}>
              <Icon name={getCardBrandIcon()} size={32} color={NEUTRAL_COLORS.white} />
              {getCardBrandLabel() ? (
                <Text style={styles.previewBrand}>{getCardBrandLabel()}</Text>
              ) : null}
            </View>
            <Text style={styles.previewNumber}>
              {cardNumber || '**** **** **** ****'}
            </Text>
            <View style={styles.previewFooter}>
              <View>
                <Text style={styles.previewLabel}>CARDHOLDER</Text>
                <Text style={styles.previewValue}>
                  {cardholderName.toUpperCase() || 'YOUR NAME'}
                </Text>
              </View>
              <View>
                <Text style={styles.previewLabel}>EXPIRES</Text>
                <Text style={styles.previewValue}>
                  {expiryDate || 'MM/YY'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.form}>
            <Input
              label="Card Number"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              error={errors.cardNumber}
              leftIcon="credit-card-outline"
              type="number"
              maxLength={19}
              required
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Expiry Date"
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  placeholder="MM/YY"
                  error={errors.expiryDate}
                  leftIcon="calendar-range"
                  type="number"
                  maxLength={5}
                  required
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="CVV"
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="123"
                  error={errors.cvv}
                  leftIcon="lock-outline"
                  type="number"
                  maxLength={4}
                  required
                />
              </View>
            </View>

            <Input
              label="Cardholder Name"
              value={cardholderName}
              onChangeText={handleCardholderNameChange}
              placeholder="John Doe"
              error={errors.cardholderName}
              leftIcon="account-outline"
              required
            />

            {/* Set as Default Toggle */}
            <AnimatedPressable
              style={styles.toggleRow}
              onPress={() => setIsDefault(!isDefault)}
              haptic
            >
              <View style={styles.toggleContent}>
                <Icon
                  name="star-outline"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.toggleTextContainer}>
                  <Text style={styles.toggleLabel}>Set as Default</Text>
                  <Text style={styles.toggleDescription}>
                    Use this card for future payments
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggle,
                  isDefault
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: NEUTRAL_COLORS.lightGray },
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    isDefault && styles.toggleKnobActive,
                  ]}
                />
              </View>
            </AnimatedPressable>
          </Animated.View>

          {/* Security Note */}
          <Card style={styles.securityCard}>
            <View style={styles.securityContent}>
              <Icon
                name="shield-lock-outline"
                size={20}
                color={NEUTRAL_COLORS.success}
              />
              <Text style={styles.securityText}>
                Your card details are encrypted and securely processed. We never store your full card number or CVV.
              </Text>
            </View>
          </Card>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Button
            title="Save Card"
            onPress={handleSave}
            disabled={!isFormComplete}
            loading={isLoading}
            icon="check"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  cardPreview: {
    margin: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewBrand: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
    opacity: 0.9,
  },
  previewNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
    letterSpacing: 2,
    marginVertical: SPACING.lg,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.white,
    opacity: 0.6,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
    letterSpacing: 0.5,
  },
  form: {
    paddingHorizontal: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfInput: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    marginBottom: SPACING.md,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
  },
  toggleDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  securityCard: {
    margin: SPACING.md,
    padding: SPACING.md,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  securityText: {
    flex: 1,
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
});

export default AddPaymentCardScreen;
