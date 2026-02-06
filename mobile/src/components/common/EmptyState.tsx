import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.lightest },
        ]}
      >
        <Icon name={icon} size={48} color={colors.medium} />
      </View>
      <Text style={[styles.title, { color: NEUTRAL_COLORS.black }]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: NEUTRAL_COLORS.darkGray }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.button}
        />
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
