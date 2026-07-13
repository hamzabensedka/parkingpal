/**
 * AnimatedPressable — spring-animated pressable component
 *
 * Replaces TouchableOpacity throughout the app.
 * Scales to 0.97 on press with spring physics + optional haptic feedback.
 *
 * Usage:
 *   <AnimatedPressable onPress={handlePress} haptic>
 *     <Text>Tap me</Text>
 *   </AnimatedPressable>
 */

import React, { useCallback } from 'react';
import { type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

const SPRING_CONFIG = { damping: 15, stiffness: 300 };

interface AnimatedPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  disabled?: boolean;
  activeOpacity?: number;
  hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
}

const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  scaleTo = 0.97,
  haptic = false,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  disabled = false,
  activeOpacity,
  hitSlop,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(scaleTo, SPRING_CONFIG);
    if (activeOpacity !== undefined) {
      opacity.value = withSpring(activeOpacity, SPRING_CONFIG);
    }
  }, [scaleTo, activeOpacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
    if (activeOpacity !== undefined) {
      opacity.value = withSpring(1, SPRING_CONFIG);
    }
  }, [activeOpacity]);

  const handlePress = useCallback(() => {
    if (haptic) {
      Haptics.impactAsync(hapticStyle);
    }
    onPress?.();
  }, [onPress, haptic, hapticStyle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: activeOpacity !== undefined ? opacity.value : 1,
  }));

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      hitSlop={hitSlop}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default React.memo(AnimatedPressable);
