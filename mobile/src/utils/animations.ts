/**
 * ParkingPal Animation Utilities
 *
 * Centralized Reanimated 3 hooks and spring presets.
 * All screens import animation helpers from here instead of rolling their own.
 */

import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  type SharedValue,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';
import { ANIMATION_SPRING } from './constants';

// ─── Spring Config Presets ─────────────────────────────────────────────

export const SPRING = {
  gentle: { damping: 15, stiffness: 150 } as WithSpringConfig,
  snappy: { damping: 12, stiffness: 200 } as WithSpringConfig,
  bouncy: { damping: 8, stiffness: 120 } as WithSpringConfig,
  default: { damping: 10, stiffness: 100 } as WithSpringConfig,
  press: { damping: 15, stiffness: 300 } as WithSpringConfig,
} as const;

// ─── Timing Config Presets ─────────────────────────────────────────────

export const TIMING = {
  fast: { duration: 150, easing: Easing.out(Easing.ease) } as WithTimingConfig,
  normal: { duration: 300, easing: Easing.out(Easing.ease) } as WithTimingConfig,
  slow: { duration: 500, easing: Easing.out(Easing.ease) } as WithTimingConfig,
} as const;

// ─── useScaleOnPress ───────────────────────────────────────────────────
/**
 * Returns an animated style that scales the view to 0.97 on press.
 * Usage:
 *   const { animatedStyle, onPressIn, onPressOut } = useScaleOnPress();
 *   <Animated.View style={animatedStyle}>...</Animated.View>
 */
export function useScaleOnPress(scaleTo = 0.97) {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    'worklet';
    scale.value = withSpring(scaleTo, SPRING.press);
  };

  const onPressOut = () => {
    'worklet';
    scale.value = withSpring(1, SPRING.press);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut, scale };
}

// ─── useFadeIn ─────────────────────────────────────────────────────────
/**
 * Opacity 0 → 1 entrance animation on mount.
 */
export function useFadeIn(delay = 0, duration = 400) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}

// ─── useSlideUp ────────────────────────────────────────────────────────
/**
 * Slide up from 30px below + fade in on mount.
 */
export function useSlideUp(delay = 0, distance = 30) {
  const translateY = useSharedValue(distance);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return animatedStyle;
}

// ─── useStaggeredSlideUp ───────────────────────────────────────────────
/**
 * Returns a function that generates staggered slide-up styles for list items.
 * Usage:
 *   const getItemStyle = useStaggeredSlideUp(items.length);
 *   items.map((item, i) => <Animated.View style={getItemStyle(i)}>...)
 */
export function useStaggeredSlideUp(count: number, baseDelay = 0, staggerMs = 80) {
  const values = Array.from({ length: count }, () => ({
    translateY: useSharedValue(30),
    opacity: useSharedValue(0),
  }));

  useEffect(() => {
    values.forEach((val, i) => {
      const delay = baseDelay + i * staggerMs;
      val.translateY.value = withDelay(delay, withSpring(0, SPRING.gentle));
      val.opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    });
  }, []);

  const getStyle = (index: number) =>
    useAnimatedStyle(() => ({
      transform: [{ translateY: values[index]?.translateY.value ?? 0 }],
      opacity: values[index]?.opacity.value ?? 1,
    }));

  return getStyle;
}

// ─── useShimmer ────────────────────────────────────────────────────────
/**
 * Returns an animated opacity for shimmer/pulse effect.
 */
export function useShimmer() {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1, // infinite
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return animatedStyle;
}

// ─── useParallax ───────────────────────────────────────────────────────
/**
 * Returns an animated style for parallax photo header.
 * Photo translates at ratio speed of scroll, scales on overscroll.
 */
export function useParallax(
  scrollY: SharedValue<number>,
  imageHeight: number,
  ratio = 0.5
) {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-imageHeight, 0, imageHeight],
      [-imageHeight * ratio, 0, imageHeight * ratio]
    );

    const scale = interpolate(
      scrollY.value,
      [-imageHeight, 0],
      [2, 1],
      'clamp'
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  return animatedStyle;
}

// ─── useCountUp ────────────────────────────────────────────────────────
/**
 * Animates a number from 0 to target value over duration.
 * Returns a shared value you can display with useDerivedValue.
 */
export function useCountUp(target: number, duration = 1000, delay = 0) {
  const value = useSharedValue(0);

  useEffect(() => {
    value.value = withDelay(
      delay,
      withTiming(target, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [target]);

  return value;
}

// ─── useShake ──────────────────────────────────────────────────────────
/**
 * Returns a trigger function and animated style for error shake.
 */
export function useShake() {
  const translateX = useSharedValue(0);

  const shake = () => {
    translateX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { shake, animatedStyle };
}

// ─── usePulse ──────────────────────────────────────────────────────────
/**
 * Gentle repeating scale pulse (e.g. for CTA buttons).
 */
export function usePulse(minScale = 1, maxScale = 1.03) {
  const scale = useSharedValue(minScale);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration: 1000 }),
        withTiming(minScale, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
}
