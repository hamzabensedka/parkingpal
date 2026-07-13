/**
 * ShimmerSkeleton — animated shimmer placeholder
 *
 * Replaces the static gray Skeleton from Loading.tsx.
 * Uses Reanimated for a smooth pulsing shimmer effect.
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { NEUTRAL_COLORS, RADIUS, SPACING } from '../../utils/constants';

// ─── Base Shimmer ──────────────────────────────────────────────────────

interface ShimmerSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ShimmerSkeleton: React.FC<ShimmerSkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = RADIUS.sm,
  style,
}) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.4, { duration: 700 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: NEUTRAL_COLORS.lightGray,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// ─── Card Skeleton ─────────────────────────────────────────────────────

interface ShimmerCardSkeletonProps {
  style?: ViewStyle;
}

export const ShimmerCardSkeleton: React.FC<ShimmerCardSkeletonProps> = ({ style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.cardRow}>
      {/* Image placeholder */}
      <ShimmerSkeleton width={80} height={80} borderRadius={RADIUS.md} />
      <View style={styles.cardContent}>
        {/* Title */}
        <ShimmerSkeleton width="70%" height={18} />
        {/* Subtitle */}
        <ShimmerSkeleton width="50%" height={14} style={{ marginTop: 8 }} />
        {/* Price */}
        <ShimmerSkeleton width="30%" height={14} style={{ marginTop: 8 }} />
      </View>
    </View>
  </View>
);

// ─── List Skeleton ─────────────────────────────────────────────────────

interface ShimmerListSkeletonProps {
  count?: number;
  style?: ViewStyle;
}

export const ShimmerListSkeleton: React.FC<ShimmerListSkeletonProps> = ({
  count = 4,
  style,
}) => (
  <View style={style}>
    {Array.from({ length: count }).map((_, i) => (
      <ShimmerCardSkeleton key={i} style={i > 0 ? { marginTop: SPACING.md } : undefined} />
    ))}
  </View>
);

// ─── Inline Skeleton (for text placeholders) ───────────────────────────

interface ShimmerTextSkeletonProps {
  lines?: number;
  style?: ViewStyle;
}

export const ShimmerTextSkeleton: React.FC<ShimmerTextSkeletonProps> = ({
  lines = 3,
  style,
}) => (
  <View style={style}>
    {Array.from({ length: lines }).map((_, i) => (
      <ShimmerSkeleton
        key={i}
        width={i === lines - 1 ? '60%' : '100%'}
        height={14}
        style={i > 0 ? { marginTop: 10 } : undefined}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  cardRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default ShimmerSkeleton;
