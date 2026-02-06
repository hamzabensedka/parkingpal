import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { RENTER_COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import { AuthStackParamList } from '../../types';

type SplashScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();
  const logoScale = new Animated.Value(0.5);
  const logoOpacity = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);

  useEffect(() => {
    // Animate logo
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate text with delay
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Navigate after splash animation
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          // User is logged in, navigate to main app
          // This will be handled by AppNavigator
        } else if (isOnboardingComplete) {
          // User has seen onboarding, go to login
          navigation.replace('Login');
        } else {
          // First time user, show onboarding
          navigation.replace('Onboarding');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, isOnboardingComplete, navigation]);

  return (
    <LinearGradient
      colors={[RENTER_COLORS.dark, RENTER_COLORS.primary, RENTER_COLORS.medium]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Icon name="parking" size={64} color={RENTER_COLORS.primary} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.title}>ParkingPal</Text>
          <Text style={styles.subtitle}>Find your spot, anywhere</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <View style={styles.loadingDots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotMiddle]} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: SPACING['3xl'],
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  dotMiddle: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    transform: [{ scale: 1.2 }],
  },
});

export default SplashScreen;
