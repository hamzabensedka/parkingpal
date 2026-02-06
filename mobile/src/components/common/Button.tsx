import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, NEUTRAL_COLORS } from '../../utils/constants';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const handlePress = async () => {
    if (!disabled && !loading) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getBackgroundColor = (): string => {
    if (disabled) return NEUTRAL_COLORS.lightGray;

    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.medium;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'danger':
        return NEUTRAL_COLORS.error;
      default:
        return colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return NEUTRAL_COLORS.gray;

    switch (variant) {
      case 'primary':
        return NEUTRAL_COLORS.white;
      case 'secondary':
        return NEUTRAL_COLORS.white;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.primary;
      case 'danger':
        return NEUTRAL_COLORS.white;
      default:
        return NEUTRAL_COLORS.white;
    }
  };

  const getBorderColor = (): string => {
    if (disabled) return NEUTRAL_COLORS.lightGray;

    switch (variant) {
      case 'outline':
        return colors.primary;
      case 'danger':
        return NEUTRAL_COLORS.error;
      default:
        return 'transparent';
    }
  };

  const getPadding = (): { paddingVertical: number; paddingHorizontal: number } => {
    switch (size) {
      case 'small':
        return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case 'large':
        return { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl };
      default:
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return TYPOGRAPHY.fontSize.sm;
      case 'large':
        return TYPOGRAPHY.fontSize.lg;
      default:
        return TYPOGRAPHY.fontSize.base;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const padding = getPadding();
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  const borderColor = getBorderColor();
  const fontSize = getFontSize();
  const iconSize = getIconSize();

  const buttonStyles: ViewStyle[] = [
    styles.button,
    {
      backgroundColor,
      borderColor,
      borderWidth: variant === 'outline' ? 1 : 0,
      ...padding,
    },
    fullWidth ? styles.fullWidth : undefined,
    variant !== 'ghost' ? SHADOWS.small : undefined,
    style,
  ].filter((s): s is ViewStyle => s !== undefined);

  const textStyles: TextStyle[] = [
    styles.text,
    {
      color: textColor,
      fontSize,
    },
    textStyle,
  ].filter((s): s is TextStyle => s !== undefined);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={textColor} size="small" />;
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <Icon
            name={icon}
            size={iconSize}
            color={textColor}
            style={styles.iconLeft}
          />
        )}
        <Text style={textStyles}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Icon
            name={icon}
            size={iconSize}
            color={textColor}
            style={styles.iconRight}
          />
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;
