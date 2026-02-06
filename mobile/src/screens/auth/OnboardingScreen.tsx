import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { RENTER_COLORS, NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { AuthStackParamList } from '../../types';
import Button from '../../components/common/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  colors: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'map-search-outline',
    title: 'Find Parking Anywhere',
    description: 'Discover available parking spots near your destination with our interactive map. No more circling around!',
    colors: [RENTER_COLORS.dark, RENTER_COLORS.primary],
  },
  {
    id: '2',
    icon: 'calendar-check-outline',
    title: 'Book Instantly',
    description: 'Reserve your spot in seconds. Pay securely in-app and get instant confirmation with access instructions.',
    colors: [RENTER_COLORS.primary, RENTER_COLORS.medium],
  },
  {
    id: '3',
    icon: 'cash-multiple',
    title: 'Earn Extra Income',
    description: 'Have an empty driveway or garage? List it on ParkingPal and start earning passive income today.',
    colors: [RENTER_COLORS.medium, RENTER_COLORS.lightMedium],
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    navigation.replace('Login');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    return (
      <LinearGradient
        colors={item.colors}
        style={styles.slide}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.slideContent}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Icon name={item.icon} size={80} color={RENTER_COLORS.primary} />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH
          );
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        {renderPagination()}

        <View style={styles.buttons}>
          {!isLastSlide && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}

          <Button
            title={isLastSlide ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary"
            icon={isLastSlide ? 'arrow-right' : 'chevron-right'}
            iconPosition="right"
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 150,
  },
  iconContainer: {
    marginBottom: SPACING['2xl'],
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
    paddingTop: SPACING.lg,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: RENTER_COLORS.primary,
    marginHorizontal: 4,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
  },
  nextButton: {
    minWidth: 140,
  },
});

export default OnboardingScreen;
