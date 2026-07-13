/**
 * AnimatedHeader — scroll-tracking header that transitions from transparent to solid
 *
 * Used in SpotDetailScreen and similar screens with full-bleed photo headers.
 * As the user scrolls past the photo, the header fades in with a white background and title.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  interpolateColor,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../../utils/constants';
import AnimatedPressable from './AnimatedPressable';

interface AnimatedHeaderProps {
  scrollY: SharedValue<number>;
  title: string;
  /** The scroll offset at which the header becomes fully visible */
  threshold?: number;
  onBack?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
}

const HEADER_HEIGHT = 56;

const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
  scrollY,
  title,
  threshold = 220,
  onBack,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [threshold - 60, threshold],
      [0, 1],
      'clamp'
    );
    return {
      opacity,
      backgroundColor: NEUTRAL_COLORS.white,
      borderBottomColor: interpolateColor(
        scrollY.value,
        [threshold - 60, threshold],
        ['rgba(0,0,0,0)', NEUTRAL_COLORS.lightGray]
      ),
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [threshold - 40, threshold],
      [10, 0],
      'clamp'
    );
    const opacity = interpolate(
      scrollY.value,
      [threshold - 40, threshold],
      [0, 1],
      'clamp'
    );
    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top, height: HEADER_HEIGHT + insets.top },
        containerStyle,
      ]}
    >
      <View style={styles.inner}>
        {onBack && (
          <AnimatedPressable style={styles.backBtn} onPress={onBack} haptic>
            <Icon name="arrow-left" size={22} color={NEUTRAL_COLORS.black} />
          </AnimatedPressable>
        )}

        <Animated.Text
          style={[styles.title, titleStyle]}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>

        {rightAction ? (
          <AnimatedPressable style={styles.backBtn} onPress={rightAction.onPress} haptic>
            <Icon name={rightAction.icon} size={22} color={NEUTRAL_COLORS.black} />
          </AnimatedPressable>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
});

export default AnimatedHeader;
