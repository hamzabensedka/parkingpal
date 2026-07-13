/**
 * FloatingSwitchPill -- Airbnb-style floating pill button
 *
 * Like Airbnb's "Switch to traveling" pill that floats at the bottom of the
 * profile screen. Slides up on mount, spring scale on press, haptic feedback.
 *
 * Usage:
 *   <FloatingSwitchPill label="Switch to hosting" onPress={handleSwitch} />
 */

import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated from 'react-native-reanimated';
import AnimatedPressable from './AnimatedPressable';
import { useSlideUp } from '../../utils/animations';
import { NEUTRAL_COLORS, SHADOWS, TYPOGRAPHY } from '../../utils/constants';
import * as Haptics from 'expo-haptics';

interface FloatingSwitchPillProps {
  label: string;
  onPress: () => void;
  icon?: string;
}

const FloatingSwitchPill: React.FC<FloatingSwitchPillProps> = ({
  label,
  onPress,
  icon = 'swap-horizontal',
}) => {
  // Slide up from 60px below on mount
  const slideUpStyle = useSlideUp(200, 60);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[styles.wrapper, slideUpStyle]}>
      <AnimatedPressable
        onPress={handlePress}
        style={styles.pill}
        scaleTo={0.95}
      >
        <Icon name={icon} size={18} color={NEUTRAL_COLORS.white} />
        <Text style={styles.label}>{label}</Text>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.black,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    gap: 8,
    ...SHADOWS.large,
    // Ensure shadow renders on Android
    ...(Platform.OS === 'android' ? { elevation: 10 } : {}),
  },
  label: {
    color: NEUTRAL_COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
});

export default React.memo(FloatingSwitchPill);
