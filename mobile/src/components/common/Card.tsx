import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SPACING, RADIUS, SHADOWS, BORDER_WIDTH, NEUTRAL_COLORS } from '../../utils/constants';
import AnimatedPressable from './AnimatedPressable';

type ElevationType = 'none' | 'small' | 'medium' | 'large';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  elevation?: ElevationType;
  padding?: boolean;
  noBorder?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevation = 'small',
  padding = true,
  noBorder = false,
}) => {

  const getShadow = (): ViewStyle => {
    switch (elevation) {
      case 'none': return {};
      case 'small': return SHADOWS.small;
      case 'medium': return SHADOWS.medium;
      case 'large': return SHADOWS.large;
      default: return SHADOWS.small;
    }
  };

  const cardStyles: ViewStyle[] = [
    styles.card,
    { backgroundColor: NEUTRAL_COLORS.white, borderColor: noBorder ? 'transparent' : NEUTRAL_COLORS.lightGray },
    getShadow(),
    padding ? styles.padding : undefined,
    style as ViewStyle,
  ].filter((s): s is ViewStyle => s !== undefined);

  if (onPress) {
    return (
      <AnimatedPressable onPress={onPress} style={cardStyles} scaleTo={0.98}>
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: BORDER_WIDTH.thin,
    overflow: 'hidden',
  },
  padding: {
    padding: SPACING.md,
  },
});

export default Card;
