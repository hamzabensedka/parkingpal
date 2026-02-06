import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, SPACING, TYPOGRAPHY } from '../../utils/constants';
import Button from './Button';

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

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: NEUTRAL_COLORS.lightGray },
        ]}
      >
        <Icon name="alert-circle-outline" size={48} color={NEUTRAL_COLORS.error} />
      </View>
      <Text style={[styles.title, { color: NEUTRAL_COLORS.black }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: NEUTRAL_COLORS.darkGray }]}>
        {description}
      </Text>
      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          icon="refresh"
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

export default ErrorState;
