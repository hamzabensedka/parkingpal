import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, AnimatedPressable } from '../../components/common';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { user, logout } = useAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationAccess, setLocationAccess] = useState(true);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data, bookings, and listings will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type DELETE to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: () => logout(),
                },
              ]
            );
          },
        },
      ]
    );
  }, [logout]);

  const renderToggleItem = (
    icon: string,
    label: string,
    description: string,
    value: boolean,
    onValueChange: (val: boolean) => void
  ) => (
    <View style={styles.settingItem}>
      <View style={[styles.settingIcon, { backgroundColor: colors.lightest }]}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: NEUTRAL_COLORS.lightGray, true: colors.light }}
        thumbColor={value ? colors.primary : NEUTRAL_COLORS.gray}
      />
    </View>
  );

  const renderNavItem = (
    icon: string,
    label: string,
    value?: string,
    onPress?: () => void,
    danger?: boolean
  ) => (
    <AnimatedPressable style={styles.settingItem} onPress={onPress} haptic>
      <View style={[styles.settingIcon, { backgroundColor: danger ? NEUTRAL_COLORS.lightGray : colors.lightest }]}>
        <Icon name={icon} size={20} color={danger ? NEUTRAL_COLORS.darkGray : colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, danger && { color: NEUTRAL_COLORS.darkGray }]}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {!danger && <Icon name="chevron-right" size={20} color={NEUTRAL_COLORS.gray} />}
    </AnimatedPressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Card style={styles.sectionCard}>
            {renderToggleItem(
              'bell',
              'Push Notifications',
              'Receive booking updates and alerts',
              pushNotifications,
              setPushNotifications
            )}
            <View style={styles.divider} />
            {renderToggleItem(
              'email',
              'Email Notifications',
              'Receive booking confirmations via email',
              emailNotifications,
              setEmailNotifications
            )}
            <View style={styles.divider} />
            {renderToggleItem(
              'clock-alert',
              'Booking Reminders',
              'Get reminded before your booking starts',
              bookingReminders,
              setBookingReminders
            )}
            <View style={styles.divider} />
            {renderToggleItem(
              'tag',
              'Promotions & Offers',
              'Receive special deals and discounts',
              marketingEmails,
              setMarketingEmails
            )}
          </Card>
        </View>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Card style={styles.sectionCard}>
            {renderToggleItem(
              'theme-light-dark',
              'Dark Mode',
              'Switch to dark theme',
              darkMode,
              setDarkMode
            )}
          </Card>
        </View>
        </Animated.View>

        {/* Privacy & Security */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <Card style={styles.sectionCard}>
            {renderToggleItem(
              'map-marker',
              'Location Access',
              'Allow ParkingPal to access your location',
              locationAccess,
              setLocationAccess
            )}
            <View style={styles.divider} />
            {renderNavItem(
              'lock',
              'Change Password',
              undefined,
              () => navigation.navigate('ChangePassword')
            )}
            <View style={styles.divider} />
            {renderNavItem(
              'shield-lock',
              'Two-Factor Authentication',
              'Disabled',
              () => navigation.navigate('TwoFactor')
            )}
            <View style={styles.divider} />
            {renderNavItem(
              'account-cancel',
              'Blocked Users',
              undefined,
              () => navigation.navigate('BlockedUsers')
            )}
          </Card>
        </View>
        </Animated.View>

        {/* General */}
        <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <Card style={styles.sectionCard}>
            {renderNavItem(
              'translate',
              'Language',
              'English',
              () => {}
            )}
            <View style={styles.divider} />
            {renderNavItem(
              'currency-eur',
              'Currency',
              'EUR (€)',
              () => {}
            )}
            <View style={styles.divider} />
            {renderNavItem(
              'map',
              'Distance Unit',
              'Kilometers',
              () => {}
            )}
          </Card>
        </View>
        </Animated.View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Card style={styles.sectionCard}>
            {renderNavItem(
              'file-document',
              'Terms of Service',
              undefined,
              () => navigation.navigate('Legal', { initialSection: 'terms' })
            )}
            <View style={styles.divider} />
            {renderNavItem(
              'shield-check',
              'Privacy Policy',
              undefined,
              () => navigation.navigate('Legal', { initialSection: 'privacy' })
            )}
            <View style={styles.divider} />
            {renderNavItem(
              'license',
              'Licenses',
              undefined,
              () => {}
            )}
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.sectionCard}>
            {renderNavItem(
              'trash-can',
              'Delete Account',
              undefined,
              handleDeleteAccount,
              true
            )}
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>ParkingPal</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (Build 1)</Text>
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
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
  },
  settingDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginLeft: 52 + SPACING.md,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray,
  },
  appVersion: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 4,
  },
});

export default SettingsScreen;
