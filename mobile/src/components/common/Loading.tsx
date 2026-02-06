import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';

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
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: NEUTRAL_COLORS.background },
          style,
        ]}
      >
        <ActivityIndicator size={size} color={colors.primary} />
        {message && (
          <Text style={[styles.message, { color: NEUTRAL_COLORS.darkGray }]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: NEUTRAL_COLORS.darkGray }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

// Skeleton Loader Component
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: NEUTRAL_COLORS.lightGray,
        },
        style,
      ]}
    />
  );
};

// Card Skeleton for loading state
export const CardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {

  return (
    <View
      style={[
        styles.cardSkeleton,
        { backgroundColor: NEUTRAL_COLORS.white },
        style,
      ]}
    >
      <Skeleton width={80} height={80} borderRadius={12} />
      <View style={styles.cardSkeletonContent}>
        <Skeleton width="70%" height={16} style={{ marginBottom: SPACING.sm }} />
        <Skeleton width="50%" height={14} style={{ marginBottom: SPACING.sm }} />
        <Skeleton width="30%" height={14} />
      </View>
    </View>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={styles.listSkeleton}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} style={{ marginBottom: SPACING.md }} />
      ))}
    </View>
  );
};

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
  skeleton: {
    opacity: 0.7,
  },
  cardSkeleton: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: 16,
    marginBottom: SPACING.sm,
  },
  cardSkeletonContent: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  listSkeleton: {
    padding: SPACING.md,
  },
});

export default Loading;
