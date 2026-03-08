import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../utils/constants';
import Button from './Button';

interface IDVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerifyPress: () => void;
}

export const IDVerificationModal: React.FC<IDVerificationModalProps> = ({
  visible,
  onClose,
  onVerifyPress,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={NEUTRAL_COLORS.gray} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: colors.lightest }]}>
            <Icon name="card-account-details-outline" size={48} color={colors.primary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>ID Verification Required</Text>

          {/* Description */}
          <Text style={styles.description}>
            To book a parking spot, we need to verify your identity. This helps keep our community safe and builds trust between renters and hosts.
          </Text>

          {/* Benefits */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon name="shield-check" size={20} color={NEUTRAL_COLORS.success} />
              <Text style={styles.benefitText}>Secure & encrypted verification</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="clock-fast" size={20} color={colors.primary} />
              <Text style={styles.benefitText}>Takes less than 2 minutes</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="account-check" size={20} color={colors.primary} />
              <Text style={styles.benefitText}>One-time verification</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Verify My ID"
              onPress={onVerifyPress}
              icon="card-account-details"
              fullWidth
            />
            <TouchableOpacity style={styles.laterButton} onPress={onClose}>
              <Text style={styles.laterText}>I'll do this later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  benefitsList: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  buttonContainer: {
    width: '100%',
  },
  laterButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  laterText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
});

export default IDVerificationModal;
