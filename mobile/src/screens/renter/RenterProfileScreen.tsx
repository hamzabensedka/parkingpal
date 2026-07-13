import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, Avatar, Badge, AnimatedPressable } from '../../components/common';

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'error' | 'info';
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
  haptic?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  badge,
  badgeVariant = 'info',
  onPress,
  showChevron = true,
  danger = false,
  haptic = false,
}) => {
  const { colors, NEUTRAL_COLORS } = useTheme();

  return (
    <AnimatedPressable style={styles.menuItem} onPress={onPress} haptic={haptic}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? NEUTRAL_COLORS.lightGray : colors.lightest }]}>
        <Icon name={icon} size={20} color={danger ? NEUTRAL_COLORS.darkGray : colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && { color: NEUTRAL_COLORS.darkGray }]}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {badge && (
        <Badge text={badge} variant={badgeVariant} size="small" />
      )}
      {showChevron && (
        <Icon name="chevron-right" size={20} color={NEUTRAL_COLORS.gray} />
      )}
    </AnimatedPressable>
  );
};

const RenterProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { user, vehicles, paymentMethods, logout, switchUserType } = useAuth();

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleVehicles = useCallback(() => {
    navigation.navigate('Vehicles');
  }, [navigation]);

  const handlePaymentMethods = useCallback(() => {
    navigation.navigate('PaymentMethods');
  }, [navigation]);

  const handleSavedSpots = useCallback(() => {
    navigation.getParent()?.navigate('Bookings', { screen: 'SavedSpots' });
  }, [navigation]);

  const handleSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  const handleHelp = useCallback(() => {
    navigation.navigate('Help');
  }, [navigation]);

  const handleSwitchToHost = useCallback(async () => {
    if (user?.userType === 'host' || user?.userType === 'superhost') {
      // Host already - just switch to host mode
      await switchUserType('host');
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'HostTabs' }] })
      );
    } else {
      // Only show popup for pure renters
      Alert.alert(
        'Become a Host',
        'Would you like to list your parking space and start earning?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Get Started',
            onPress: () => {
              // Navigate to host listing flow (renters can create their first spot)
              navigation.navigate('HostTabs', {
                screen: 'Listings',
                params: { screen: 'AddListingLocation' },
              });
            },
          },
        ]
      );
    }
  }, [user, switchUserType, navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  }, [logout]);

  const vehicleCount = vehicles?.length || 0;
  const paymentMethodCount = paymentMethods?.length || 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View
          entering={FadeInDown.delay(0).duration(500).springify()}
          style={styles.header}
        >
          <AnimatedPressable onPress={handleEditProfile} haptic>
            <Avatar
              name={user?.firstName}
              imageUrl={user?.avatar ?? user?.profilePhoto ?? undefined}
              size={80}
            />
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Icon name="pencil" size={14} color={NEUTRAL_COLORS.white} />
            </View>
          </AnimatedPressable>

          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.verificationRow}>
            {user?.verified?.email && (
              <View style={styles.verificationBadge}>
                <Icon name="email-check" size={14} color={NEUTRAL_COLORS.darkGray} />
                <Text style={styles.verificationText}>Email Verified</Text>
              </View>
            )}
            {user?.verified?.phone && (
              <View style={styles.verificationBadge}>
                <Icon name="phone-check" size={14} color={NEUTRAL_COLORS.darkGray} />
                <Text style={styles.verificationText}>Phone Verified</Text>
              </View>
            )}
            {user?.verified?.id && (
              <View style={styles.verificationBadge}>
                <Icon name="card-account-details-outline" size={14} color={NEUTRAL_COLORS.darkGray} />
                <Text style={styles.verificationText}>ID Verified</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Stats Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <Card style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {user?.stats?.totalBookings ?? 0}
              </Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                €{(user?.stats?.totalSpent ?? 0).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {user?.rating?.toFixed(1) || 'N/A'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Account Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="account-edit"
              label="Edit Profile"
              onPress={handleEditProfile}
              haptic
            />
            <MenuItem
              icon="car"
              label="My Vehicles"
              value={`${vehicleCount} vehicle${vehicleCount !== 1 ? 's' : ''}`}
              onPress={handleVehicles}
              haptic
            />
            <MenuItem
              icon="credit-card"
              label="Payment Methods"
              value={`${paymentMethodCount} card${paymentMethodCount !== 1 ? 's' : ''}`}
              onPress={handlePaymentMethods}
              haptic
            />
            <MenuItem
              icon="heart"
              label="Saved Spots"
              onPress={handleSavedSpots}
              haptic
            />
          </Card>
        </Animated.View>

        {/* Host Section - Only show for renters */}
        {user?.userType === 'renter' && (
          <Animated.View entering={FadeInDown.delay(300).duration(500).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Become a Host</Text>
            <Card style={styles.hostCard} onPress={handleSwitchToHost}>
              <View style={[styles.hostIcon, { backgroundColor: colors.lightest }]}>
                <Icon name="home-plus" size={32} color={colors.primary} />
              </View>
              <View style={styles.hostContent}>
                <Text style={styles.hostTitle}>List Your Space</Text>
                <Text style={styles.hostDescription}>
                  Earn money by renting out your parking space
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.primary} />
            </Card>
          </Animated.View>
        )}

        {/* Go to Dashboard - Show for hosts and superhosts */}
        {(user?.userType === 'host' || user?.userType === 'superhost') && (
          <Animated.View entering={FadeInDown.delay(300).duration(500).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Host Dashboard</Text>
            <Card style={styles.hostCard} onPress={handleSwitchToHost}>
              <View style={[styles.hostIcon, { backgroundColor: colors.lightest }]}>
                <Icon name="view-dashboard" size={32} color={colors.primary} />
              </View>
              <View style={styles.hostContent}>
                <Text style={styles.hostTitle}>
                  {user?.userType === 'superhost' ? 'Superhost Dashboard' : 'Go to Dashboard'}
                </Text>
                <Text style={styles.hostDescription}>
                  Manage your listings and bookings
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.primary} />
            </Card>
          </Animated.View>
        )}

        {/* Support Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="cog"
              label="Settings"
              onPress={handleSettings}
              haptic
            />
            <MenuItem
              icon="help-circle"
              label="Help & Support"
              onPress={handleHelp}
              haptic
            />
            <MenuItem
              icon="file-document"
              label="Terms & Privacy"
              onPress={() => navigation.navigate('Legal')}
              haptic
            />
          </Card>
        </Animated.View>

        {/* Logout */}
        <Animated.View entering={FadeInDown.delay(500).duration(500).springify()} style={styles.section}>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="logout"
              label="Log Out"
              onPress={handleLogout}
              showChevron={false}
              danger
              haptic
            />
          </Card>
        </Animated.View>

        {/* App Version */}
        <Animated.View entering={FadeInDown.delay(600).duration(500).springify()}>
          <Text style={styles.versionText}>ParkingPal v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: NEUTRAL_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: NEUTRAL_COLORS.white,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginTop: SPACING.md,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    marginTop: 4,
  },
  verificationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.lightGray,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  verificationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
  },
  statsCard: {
    flexDirection: 'row',
    margin: SPACING.md,
    padding: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginVertical: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
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
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
  },
  menuValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  hostIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  hostContent: {
    flex: 1,
  },
  hostTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  hostDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    lineHeight: 20,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    paddingVertical: SPACING.lg,
  },
});

export default RenterProfileScreen;
