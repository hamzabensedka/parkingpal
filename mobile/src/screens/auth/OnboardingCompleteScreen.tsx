import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import { AuthStackParamList } from '../../types';
import { Button } from '../../components/common';

type OnboardingCompleteScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OnboardingComplete'>;

interface OnboardingCompleteScreenProps {
  navigation: OnboardingCompleteScreenNavigationProp;
}

const OnboardingCompleteScreen: React.FC<OnboardingCompleteScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate checkmark
    Animated.parallel([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate text
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Animate buttons
    setTimeout(() => {
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 600);
  }, []);

  const handleGetStarted = () => {
    // Navigation will be handled by AppNavigator based on user type
    // The user is now authenticated, so AppNavigator will show the main app
  };

  const isHost = user?.userType === 'host' || user?.userType === 'both';
  const isRenter = user?.userType === 'renter' || user?.userType === 'both';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              backgroundColor: colors.lightest,
              transform: [{ scale: checkmarkScale }],
              opacity: checkmarkOpacity,
            },
          ]}
        >
          <View style={[styles.checkmarkCircle, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={60} color={NEUTRAL_COLORS.white} />
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View style={[styles.textContent, { opacity: textOpacity }]}>
          <Text style={styles.title}>You're All Set!</Text>
          <Text style={styles.subtitle}>
            Welcome to ParkingPal, {user?.firstName}! Your account is ready to use.
          </Text>

          {/* Features Summary */}
          <View style={styles.featuresList}>
            {isRenter && (
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.lightest }]}>
                  <Icon name="map-marker-radius" size={24} color={colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Find Parking</Text>
                  <Text style={styles.featureDescription}>
                    Search for spots near your destination
                  </Text>
                </View>
              </View>
            )}

            {isHost && (
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.lightest }]}>
                  <Icon name="currency-eur" size={24} color={colors.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>Start Earning</Text>
                  <Text style={styles.featureDescription}>
                    List your space and earn passive income
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.lightest }]}>
                <Icon name="shield-check" size={24} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Safe & Secure</Text>
                <Text style={styles.featureDescription}>
                  Verified users and secure payments
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.footer, { opacity: buttonsOpacity }]}>
          <Button
            title={isRenter ? 'Find Parking' : 'List Your Spot'}
            onPress={handleGetStarted}
            fullWidth
            icon={isRenter ? 'magnify' : 'plus'}
          />

          {user?.userType === 'both' && (
            <Text style={styles.switchNote}>
              You can switch between Renter and Host modes from your profile
            </Text>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['2xl'],
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: NEUTRAL_COLORS.darkGray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 26,
  },
  featuresList: {
    width: '100%',
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  switchNote: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
  },
});

export default OnboardingCompleteScreen;
