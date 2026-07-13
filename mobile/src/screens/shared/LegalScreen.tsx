import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedPressable } from '../../components/common';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import { SharedStackParamList } from '../../types';

type LegalScreenProps = NativeStackScreenProps<SharedStackParamList, 'Legal'>;

type Section = 'terms' | 'privacy';

const TERMS_CONTENT = `
1. Acceptance of Terms
By using ParkingPal, you agree to these Terms of Service. If you do not agree, please do not use our services.

2. Description of Service
ParkingPal connects people who need parking with those who have space to share. We act as an intermediary and do not own or operate parking spaces.

3. User Accounts
You must provide accurate information when creating an account. You are responsible for keeping your credentials secure.

4. Bookings and Payments
Bookings are binding once confirmed. Payment is processed at the time of booking. Cancellation policies apply as stated at the time of booking.

5. Conduct
You agree to use the service lawfully and respectfully. Harassment, fraud, or misuse may result in account suspension.

6. Liability
ParkingPal is not liable for damage to vehicles or property occurring at listed spaces. Hosts and renters use the service at their own risk.

7. Changes
We may update these terms. Continued use after changes constitutes acceptance.

Last updated: 2025.
`;

const PRIVACY_CONTENT = `
1. Information We Collect
We collect information you provide (name, email, phone, payment details) and usage data (app interactions, location for finding spots).

2. How We Use It
We use your information to provide the service, process payments, communicate with you, and improve our platform.

3. Sharing
We do not sell your data. We share data only as needed with payment processors, and as required by law.

4. Security
We use industry-standard encryption and secure storage to protect your data.

5. Your Rights
You may access, correct, or delete your personal data through the app or by contacting us. You may also request a copy of your data.

6. Cookies and Similar Tech
The app may use local storage for preferences and session data. We do not use third-party advertising cookies.

7. Children
Our service is not directed at users under 18. We do not knowingly collect data from children.

8. Changes
We may update this policy. We will notify you of material changes in the app or by email.

Contact: privacy@parkingpal.com

Last updated: 2025.
`;

const LegalScreen: React.FC<LegalScreenProps> = ({ route }) => {
  const { colors, NEUTRAL_COLORS } = useTheme();
  const initialSection = route.params?.initialSection ?? 'terms';
  const [activeSection, setActiveSection] = useState<Section>(initialSection);

  const content = useMemo(
    () => (activeSection === 'terms' ? TERMS_CONTENT.trim() : PRIVACY_CONTENT.trim()),
    [activeSection]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
      <View style={styles.tabRow}>
        <AnimatedPressable
          style={[
            styles.tab,
            activeSection === 'terms' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveSection('terms')}
          haptic
        >
          <Icon
            name="file-document-outline"
            size={20}
            color={activeSection === 'terms' ? colors.primary : NEUTRAL_COLORS.gray}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeSection === 'terms' ? colors.primary : NEUTRAL_COLORS.gray },
            ]}
          >
            Terms of Service
          </Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[
            styles.tab,
            activeSection === 'privacy' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveSection('privacy')}
          haptic
        >
          <Icon
            name="shield-check-outline"
            size={20}
            color={activeSection === 'privacy' ? colors.primary : NEUTRAL_COLORS.gray}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeSection === 'privacy' ? colors.primary : NEUTRAL_COLORS.gray },
            ]}
          >
            Privacy Policy
          </Text>
        </AnimatedPressable>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.bodyText}>{content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING['2xl'],
  },
  bodyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.black,
    lineHeight: 24,
  },
});

export default LegalScreen;
