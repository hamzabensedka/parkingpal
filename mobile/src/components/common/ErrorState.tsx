import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { NEUTRAL_COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { useSlideUp, useFadeIn } from '../../utils/animations';
import Button from './Button';
import LottieAnimation from './LottieAnimation';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: ViewStyle;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  style,
}) => {
  const iconAnimStyle = useSlideUp(0, 20);
  const textAnimStyle = useFadeIn(300);
  const buttonAnimStyle = useSlideUp(500, 15);

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={iconAnimStyle}>
        <LottieAnimation name="error-warning" size={120} autoPlay loop={false} />
      </Animated.View>
      <Animated.View style={[textAnimStyle, styles.textContainer]}>
        <Text style={[styles.title, { color: NEUTRAL_COLORS.black }]}>{title}</Text>
        <Text style={[styles.description, { color: NEUTRAL_COLORS.darkGray }]}>{description}</Text>
      </Animated.View>
      {onRetry && (
        <Animated.View style={buttonAnimStyle}>
          <Button
            title={retryLabel}
            onPress={onRetry}
            variant="primary"
            icon="refresh"
            style={styles.button}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  button: {
    minWidth: 150,
  },
});

export default ErrorState;
