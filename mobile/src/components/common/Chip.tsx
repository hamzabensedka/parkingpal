import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, NEUTRAL_COLORS } from '../../utils/constants';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();

  const handlePress = async () => {
    if (!disabled && onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const backgroundColor = selected
    ? colors.primary
    : disabled
    ? NEUTRAL_COLORS.lightGray
    : NEUTRAL_COLORS.white;

  const textColor = selected
    ? NEUTRAL_COLORS.white
    : disabled
    ? NEUTRAL_COLORS.gray
    : NEUTRAL_COLORS.black;

  const borderColor = selected
    ? colors.primary
    : disabled
    ? NEUTRAL_COLORS.lightGray
    : NEUTRAL_COLORS.lightGray;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || !onPress}
      activeOpacity={0.8}
    >
      {icon && (
        <Icon
          name={icon}
          size={16}
          color={textColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
});

export default Chip;
