import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { RENTER_COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import { SPRING } from '../../utils/animations';
import { AuthStackParamList } from '../../types';
import LottieAnimation from '../../components/common/LottieAnimation';

type SplashScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { isAuthenticated, isOnboardingComplete, isLoading } = useAuth();

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const loaderOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo bounces in
    logoScale.value = withSpring(1, SPRING.bouncy);
    logoOpacity.value = withTiming(1, { duration: 500 });

    // Text slides up with delay
    textOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    textTranslateY.value = withDelay(500, withSpring(0, SPRING.gentle));

    // Loader fades in
    loaderOpacity.value = withDelay(800, withTiming(1, { duration: 300 }));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          // Handled by AppNavigator
        } else if (isOnboardingComplete) {
          navigation.replace('Login');
        } else {
          navigation.replace('Onboarding');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, isOnboardingComplete, navigation]);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const loaderAnimStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
  }));

  return (
    <LinearGradient
      colors={[RENTER_COLORS.dark, RENTER_COLORS.primary, RENTER_COLORS.medium]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimStyle]}>
          <View style={styles.logoCircle}>
            <LottieAnimation name="splash-parking" size={80} autoPlay loop={false} />
          </View>
        </Animated.View>

        <Animated.View style={textAnimStyle}>
          <Text style={styles.title}>ParkingPal</Text>
          <Text style={styles.subtitle}>Find your spot, anywhere</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, loaderAnimStyle]}>
        <LottieAnimation name="loading-spinner" size={40} loop autoPlay />
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
});

export default SplashScreen;
