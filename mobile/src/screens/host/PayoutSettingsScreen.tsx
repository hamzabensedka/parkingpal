import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useError } from '../../contexts/ErrorContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../utils/constants';
import { Button, Card, AnimatedPressable } from '../../components/common';
import { paymentApi } from '../../services/api';

const PayoutSettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showError, showPopup } = useError();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const status = await paymentApi.checkConnectStatus();
      setIsOnboarded(status.onboarded);
    } catch (err) {
      console.error('Error checking Connect status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check payout status');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    checkStatus().finally(() => setIsLoading(false));
  }, [checkStatus]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await checkStatus();
    setIsRefreshing(false);
  }, [checkStatus]);

  const handleSetupPayout = async () => {
    setIsOnboarding(true);
    try {
      const result = await paymentApi.startConnectOnboarding();

      // Open Stripe Connect onboarding in browser
      const canOpen = await Linking.canOpenURL(result.onboardingUrl);
      if (canOpen) {
        await Linking.openURL(result.onboardingUrl);

        // Show instructions after opening
        Alert.alert(
          'Complete Setup in Browser',
          'Please complete the payout setup in your browser. Once done, return here and tap "Refresh Status" to verify.',
          [{ text: 'OK' }]
        );
      } else {
        showPopup({ title: 'Error', message: 'Unable to open the setup page. Please try again.', severity: 'error' });
      }
    } catch (err) {
      console.error('Error starting Connect onboarding:', err);
      showError(err, handleSetupPayout);
    } finally {
      setIsOnboarding(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading payout settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()} style={[styles.header, { backgroundColor: colors.lightest }]}>
          <Icon
            name={isOnboarded ? 'check-decagram' : 'bank-outline'}
            size={48}
            color={isOnboarded ? NEUTRAL_COLORS.success : colors.primary}
          />
          <Text style={styles.headerTitle}>
            {isOnboarded ? 'Payouts Enabled' : 'Set Up Payouts'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isOnboarded
              ? 'Your bank account is connected and ready to receive payouts'
              : 'Connect your bank account to receive earnings from your parking spots'}
          </Text>
        </Animated.View>

        {error && (
          <View style={styles.errorBanner}>
            <Icon name="alert-circle" size={20} color={NEUTRAL_COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Status Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isOnboarded ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.warning },
              ]}
            />
            <Text style={styles.statusTitle}>
              {isOnboarded ? 'Account Connected' : 'Setup Required'}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            {isOnboarded
              ? 'Your Stripe account is fully set up. Earnings will be automatically transferred to your bank account after each completed booking.'
              : 'You need to complete the payout setup to receive earnings from your listings. This only takes a few minutes.'}
          </Text>
        </Card>
        </Animated.View>

        {/* Setup/Manage Button */}
        <View style={styles.actionSection}>
          <Button
            title={isOnboarded ? 'Manage Payout Settings' : 'Set Up Payouts'}
            onPress={handleSetupPayout}
            loading={isOnboarding}
            icon={isOnboarded ? 'cog' : 'bank-plus'}
            fullWidth
          />
          {!isOnboarded && (
            <Text style={styles.setupNote}>
              You'll be redirected to Stripe to securely enter your bank details
            </Text>
          )}
        </View>

        {/* How Payouts Work */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>How payouts work</Text>
          <View style={styles.payoutStep}>
            <View style={[styles.stepNumber, { backgroundColor: colors.lightest }]}>
              <Text style={[styles.stepNumberText, { color: colors.primary }]}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Guest books your spot</Text>
              <Text style={styles.stepText}>Payment is collected and held securely by Stripe</Text>
            </View>
          </View>
          <View style={styles.payoutStep}>
            <View style={[styles.stepNumber, { backgroundColor: colors.lightest }]}>
              <Text style={[styles.stepNumberText, { color: colors.primary }]}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Booking completes</Text>
              <Text style={styles.stepText}>After the parking session ends successfully</Text>
            </View>
          </View>
          <View style={styles.payoutStep}>
            <View style={[styles.stepNumber, { backgroundColor: colors.lightest }]}>
              <Text style={[styles.stepNumberText, { color: colors.primary }]}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get paid</Text>
              <Text style={styles.stepText}>
                Funds are transferred to your bank within 2-3 business days (80% after platform fee)
              </Text>
            </View>
          </View>
        </Card>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Icon name="shield-lock-outline" size={20} color={NEUTRAL_COLORS.success} />
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Secure payments by Stripe</Text>
            <Text style={styles.securityText}>
              We use Stripe, a trusted payment processor used by millions of businesses. Your bank
              details are encrypted and never stored on our servers.
            </Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          <AnimatedPressable style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestionText}>What documents do I need?</Text>
              <Icon name="chevron-down" size={20} color={NEUTRAL_COLORS.gray} />
            </View>
            <Text style={styles.faqAnswer}>
              Stripe may ask for your government ID and bank account details (IBAN/BIC) to verify
              your identity and set up payouts.
            </Text>
          </AnimatedPressable>

          <AnimatedPressable style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestionText}>When do I receive my earnings?</Text>
              <Icon name="chevron-down" size={20} color={NEUTRAL_COLORS.gray} />
            </View>
            <Text style={styles.faqAnswer}>
              Earnings are transferred 2-3 business days after a booking completes. You'll receive
              80% of the booking amount (20% platform fee).
            </Text>
          </AnimatedPressable>

          <AnimatedPressable style={styles.faqItem}>
            <View style={styles.faqQuestion}>
              <Text style={styles.faqQuestionText}>Can I change my bank account later?</Text>
              <Icon name="chevron-down" size={20} color={NEUTRAL_COLORS.gray} />
            </View>
            <Text style={styles.faqAnswer}>
              Yes, you can update your bank details anytime by tapping "Manage Payout Settings"
              above.
            </Text>
          </AnimatedPressable>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  header: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    margin: SPACING.lg,
    marginBottom: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.error,
  },
  statusCard: {
    margin: SPACING.lg,
    padding: SPACING.md,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  statusTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  statusDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  setupNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  infoCard: {
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  payoutStep: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  stepText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL_COLORS.white,
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  securityContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  securityTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  securityText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  faqSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  faqTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  faqItem: {
    backgroundColor: NEUTRAL_COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
    flex: 1,
  },
  faqAnswer: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
});

export default PayoutSettingsScreen;
