import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, Avatar, Badge, AnimatedPressable } from '../../components/common';

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
}) => {
  const { colors } = useTheme();

  return (
    <AnimatedPressable style={styles.menuItem} onPress={onPress} haptic>
      <View style={[styles.menuIcon, { backgroundColor: danger ? '#fef2f2' : colors.lightest }]}>
        <Icon name={icon} size={20} color={danger ? '#ef4444' : colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && { color: '#ef4444' }]}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {showChevron && (
        <Icon name="chevron-right" size={20} color={NEUTRAL_COLORS.gray} />
      )}
    </AnimatedPressable>
  );
};

const HostProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user, logout, switchUserType } = useAuth();

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleSwitchToRenter = useCallback(async () => {
    // Hosts can always switch to renter view (they may have been renters before)
    await switchUserType('renter');
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'RenterTabs' }] })
    );
  }, [switchUserType, navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  }, [logout]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
        <View style={styles.header}>
          <AnimatedPressable onPress={handleEditProfile} haptic>
            <Avatar
              name={user?.firstName}
              imageUrl={user?.avatar}
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

          <View style={styles.hostBadge}>
            <Icon name="home-account" size={16} color={colors.primary} />
            <Text style={[styles.hostBadgeText, { color: colors.primary }]}>Host</Text>
          </View>
        </View>
        </Animated.View>

        {/* Host Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <Card style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {user?.stats?.totalListings || 3}
            </Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              €{user?.stats?.totalEarnings?.toFixed(0) || '4,850'}
            </Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {user?.rating?.toFixed(1) || '4.8'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </Card>
        </Animated.View>

        {/* Host Tools */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Host Tools</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="home-edit"
              label="Manage Listings"
              value={`${user?.stats?.totalListings || 3} spots`}
              onPress={() => navigation.navigate('ListingManagement')}
            />
            <MenuItem
              icon="chart-line"
              label="Earnings & Payouts"
              onPress={() => navigation.navigate('Earnings')}
            />
            <MenuItem
              icon="calendar-check"
              label="Booking Requests"
              onPress={() => navigation.navigate('BookingRequests')}
            />
            <MenuItem
              icon="star"
              label="Reviews"
              onPress={() => navigation.navigate('Reviews')}
            />
          </Card>
        </View>
        </Animated.View>

        {/* Switch Mode - All hosts can switch to renter view */}
        <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Switch Mode</Text>
          <Card style={styles.switchCard} onPress={handleSwitchToRenter}>
            <View style={styles.switchIcon}>
              <Icon name="swap-horizontal" size={24} color={colors.primary} />
            </View>
            <View style={styles.switchContent}>
              <Text style={styles.switchTitle}>Switch to Renter</Text>
              <Text style={styles.switchDesc}>
                Find and book parking spots
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </Card>
        </View>
        </Animated.View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="account-edit"
              label="Edit Profile"
              onPress={handleEditProfile}
            />
            <MenuItem
              icon="bank"
              label="Payout Settings"
              onPress={() => navigation.navigate('PayoutSettings')}
            />
            <MenuItem
              icon="cog"
              label="Settings"
              onPress={() => navigation.navigate('Settings')}
            />
          </Card>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="help-circle"
              label="Help & Support"
              onPress={() => navigation.navigate('Help')}
            />
            <MenuItem
              icon="file-document"
              label="Terms & Privacy"
              onPress={() => navigation.navigate('Legal')}
            />
          </Card>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Card style={styles.menuCard}>
            <MenuItem
              icon="logout"
              label="Log Out"
              onPress={handleLogout}
              showChevron={false}
              danger
            />
          </Card>
        </View>

        <Text style={styles.versionText}>ParkingPal v1.0.0</Text>
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
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: NEUTRAL_COLORS.background,
    gap: 4,
  },
  hostBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
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
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  switchIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NEUTRAL_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  switchContent: {
    flex: 1,
  },
  switchTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  switchDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  versionText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    paddingVertical: SPACING.lg,
  },
});

export default HostProfileScreen;
