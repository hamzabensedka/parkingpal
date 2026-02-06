import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, NEUTRAL_COLORS } from '../../utils/constants';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
type BadgeSize = 'small' | 'medium';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
  icon,
  style,
}) => {
  const { colors } = useTheme();

  const getColors = (): { background: string; text: string } => {
    switch (variant) {
      case 'success':
        return { background: NEUTRAL_COLORS.lightGray, text: NEUTRAL_COLORS.black };
      case 'warning':
        return { background: NEUTRAL_COLORS.lightGray, text: NEUTRAL_COLORS.darkGray };
      case 'error':
        return { background: NEUTRAL_COLORS.lightGray, text: NEUTRAL_COLORS.black };
      case 'info':
        return { background: NEUTRAL_COLORS.lightGray, text: NEUTRAL_COLORS.darkGray };
      case 'primary':
        return { background: colors.lightest, text: colors.dark };
      default:
        return { background: NEUTRAL_COLORS.lightGray, text: NEUTRAL_COLORS.darkGray };
    }
  };

  const colorScheme = getColors();
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colorScheme.background,
          paddingVertical: isSmall ? 2 : SPACING.xs,
          paddingHorizontal: isSmall ? SPACING.xs : SPACING.sm,
        },
        style,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={isSmall ? 10 : 14}
          color={colorScheme.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colorScheme.text,
            fontSize: isSmall ? TYPOGRAPHY.fontSize.xs : TYPOGRAPHY.fontSize.sm,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '500',
  },
});

export default Badge;
