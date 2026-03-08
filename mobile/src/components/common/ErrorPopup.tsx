import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import type { ErrorSeverity } from '../../utils/errorClassifier';
import Button from './Button';

interface ErrorPopupAction {
  label: string;
  onPress: () => void;
}

export interface ErrorPopupConfig {
  title: string;
  message: string;
  severity: ErrorSeverity;
  icon?: string;
  action?: ErrorPopupAction;
  dismissable?: boolean;
  autoDismissMs?: number | null;
}

interface ErrorPopupProps {
  visible: boolean;
  config: ErrorPopupConfig | null;
  onDismiss: () => void;
}

// ─── Severity-based styling ───

const SEVERITY_STYLES: Record<ErrorSeverity, { iconBg: string; iconColor: string }> = {
  error: { iconBg: '#fef2f2', iconColor: '#dc2626' },
  warning: { iconBg: '#fefce8', iconColor: '#ca8a04' },
  info: { iconBg: NEUTRAL_COLORS.lightGray, iconColor: NEUTRAL_COLORS.darkGray },
};

const SEVERITY_ICONS: Record<ErrorSeverity, string> = {
  error: 'alert-circle-outline',
  warning: 'alert-outline',
  info: 'information-outline',
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ErrorPopup: React.FC<ErrorPopupProps> = ({ visible, config, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && config) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, config, slideAnim, fadeAnim]);

  if (!config) return null;

  const severity = config.severity;
  const { iconBg, iconColor } = SEVERITY_STYLES[severity];
  const iconName = config.icon || SEVERITY_ICONS[severity];
  const dismissable = config.dismissable !== false;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={dismissable ? onDismiss : undefined}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={dismissable ? onDismiss : undefined}
          />
        </Animated.View>

        {/* Bottom sheet */}
        <Animated.View
          style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Close button */}
          {dismissable && (
            <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
              <Icon name="close" size={24} color={NEUTRAL_COLORS.gray} />
            </TouchableOpacity>
          )}

          <View style={styles.content}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
              <Icon name={iconName} size={32} color={iconColor} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{config.title}</Text>

            {/* Message */}
            <Text style={styles.message}>{config.message}</Text>

            {/* Action button */}
            {config.action && (
              <Button
                title={config.action.label}
                onPress={config.action.onPress}
                variant="primary"
                fullWidth
                style={styles.actionButton}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.sm,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  actionButton: {
    marginTop: SPACING.sm,
  },
});

export default ErrorPopup;
