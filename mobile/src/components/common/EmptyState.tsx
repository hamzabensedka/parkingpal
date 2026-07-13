import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import { useSlideUp, useFadeIn } from '../../utils/animations';
import Button from './Button';
import LottieAnimation, { type LottieName } from './LottieAnimation';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  /** When set, shows a Lottie animation instead of the static icon */
  lottieAnimation?: LottieName;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
  lottieAnimation,
}) => {
  const { colors } = useTheme();
  const iconAnimStyle = useSlideUp(0, 20);
  const textAnimStyle = useFadeIn(300);
  const buttonAnimStyle = useSlideUp(500, 15);

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={iconAnimStyle}>
        {lottieAnimation ? (
          <LottieAnimation name={lottieAnimation} size={140} loop autoPlay />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: colors.lightest }]}>
            <Icon name={icon} size={48} color={colors.medium} />
          </View>
        )}
      </Animated.View>
      <Animated.View style={[textAnimStyle, styles.textContainer]}>
        <Text style={[styles.title, { color: NEUTRAL_COLORS.black }]}>{title}</Text>
        {description && (
          <Text style={[styles.description, { color: NEUTRAL_COLORS.darkGray }]}>{description}</Text>
        )}
      </Animated.View>
      {actionLabel && onAction && (
        <Animated.View style={buttonAnimStyle}>
          <Button title={actionLabel} onPress={onAction} variant="primary" style={styles.button} />
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
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
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

export default EmptyState;
