import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { SPRING } from '../../utils/animations';
import type { ErrorSeverity } from '../../utils/errorClassifier';
import Button from './Button';
import LottieAnimation from './LottieAnimation';

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

const SEVERITY_STYLES: Record<ErrorSeverity, { iconBg: string; iconColor: string }> = {
  error: { iconBg: '#fef2f2', iconColor: '#dc2626' },
  warning: { iconBg: '#fefce8', iconColor: '#ca8a04' },
  info: { iconBg: NEUTRAL_COLORS.lightGray, iconColor: NEUTRAL_COLORS.darkGray },
};

const SEVERITY_LOTTIE: Record<ErrorSeverity, boolean> = {
  error: true,
  warning: true,
  info: false,
};

const SEVERITY_ICONS: Record<ErrorSeverity, string> = {
  error: 'alert-circle-outline',
  warning: 'alert-outline',
  info: 'information-outline',
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 100;

const ErrorPopup: React.FC<ErrorPopupProps> = ({ visible, config, onDismiss }) => {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible && config) {
      translateY.value = withSpring(0, SPRING.snappy);
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, config]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        dragY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onDismiss)();
      } else {
        dragY.value = withSpring(0, SPRING.snappy);
      }
    })
    .onFinalize(() => {
      dragY.value = withSpring(0, SPRING.snappy);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + dragY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!config) return null;

  const severity = config.severity;
  const { iconBg, iconColor } = SEVERITY_STYLES[severity];
  const iconName = config.icon || SEVERITY_ICONS[severity];
  const dismissable = config.dismissable !== false;
  const useLottie = SEVERITY_LOTTIE[severity];

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={dismissable ? onDismiss : undefined}>
      <View style={styles.overlay}>
        <ReAnimated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismissable ? onDismiss : undefined} />
        </ReAnimated.View>

        <GestureDetector gesture={panGesture}>
          <ReAnimated.View style={[styles.modal, sheetStyle]}>
            {/* Drag handle */}
            <View style={styles.dragHandle}>
              <View style={styles.dragIndicator} />
            </View>

            <View style={styles.content}>
              {useLottie ? (
                <LottieAnimation name="error-warning" size={80} autoPlay loop={false} />
              ) : (
                <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                  <Icon name={iconName} size={32} color={iconColor} />
                </View>
              )}

              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.message}>{config.message}</Text>

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
          </ReAnimated.View>
        </GestureDetector>
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
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  dragHandle: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: NEUTRAL_COLORS.lightGray,
  },
  content: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
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
