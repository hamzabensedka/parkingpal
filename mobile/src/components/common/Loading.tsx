import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { NEUTRAL_COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import LottieAnimation from './LottieAnimation';
import { ShimmerSkeleton, ShimmerCardSkeleton, ShimmerListSkeleton } from './ShimmerSkeleton';

interface LoadingProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  message,
  fullScreen = false,
  style,
}) => {
  const lottieSize = size === 'small' ? 48 : 80;

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: NEUTRAL_COLORS.background }, style]}>
        <LottieAnimation name="loading-spinner" size={lottieSize} loop autoPlay />
        {message && (
          <Text style={[styles.message, { color: NEUTRAL_COLORS.darkGray }]}>{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <LottieAnimation name="loading-spinner" size={lottieSize} loop autoPlay />
      {message && (
        <Text style={[styles.message, { color: NEUTRAL_COLORS.darkGray }]}>{message}</Text>
      )}
    </View>
  );
};

// Re-export shimmer-based skeletons for backward compatibility
export { ShimmerSkeleton as Skeleton };
export { ShimmerCardSkeleton as CardSkeleton };
export { ShimmerListSkeleton as ListSkeleton };

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
});

export default Loading;
