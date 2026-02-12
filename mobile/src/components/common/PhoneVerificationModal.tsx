import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RENTER_COLORS, NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import Button from './Button';

interface PhoneVerificationModalProps {
  visible: boolean;
  phone: string;
  onClose: () => void;
  onSendCode: (phone: string) => Promise<void>;
  onVerify: (code: string) => Promise<boolean>;
  onSuccess?: () => void;
}

const CODE_LENGTH = 6;

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  visible,
  phone,
  onClose,
  onSendCode,
  onVerify,
  onSuccess,
}) => {
  const [step, setStep] = useState<'send' | 'verify' | 'success'>('send');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setStep('send');
      setCode('');
      setError(null);
      setCountdown(0);
    }
  }, [visible]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSendCode(phone);
      setStep('verify');
      setCountdown(60); // 60 seconds before can resend
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    await handleSendCode();
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, CODE_LENGTH);
      setCode(pastedCode);
      if (pastedCode.length === CODE_LENGTH) {
        handleVerify(pastedCode);
      }
      return;
    }

    const newCode = code.split('');
    newCode[index] = value;
    const updatedCode = newCode.join('');
    setCode(updatedCode);

    // Move to next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when complete
    if (updatedCode.length === CODE_LENGTH && !updatedCode.includes('')) {
      handleVerify(updatedCode);
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await onVerify(verificationCode);
      if (success) {
        setStep('success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
      setCode('');
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const renderSendStep = () => (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <Icon name="cellphone-message" size={48} color={RENTER_COLORS.primary} />
      </View>
      <Text style={styles.title}>Verify Your Phone</Text>
      <Text style={styles.subtitle}>
        We'll send a verification code to:
      </Text>
      <Text style={styles.phone}>{phone}</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button
        title="Send Code"
        onPress={handleSendCode}
        loading={isLoading}
        fullWidth
        style={styles.button}
      />
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <Icon name="shield-check-outline" size={48} color={RENTER_COLORS.primary} />
      </View>
      <Text style={styles.title}>Enter Code</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {phone}
      </Text>

      <View style={styles.codeContainer}>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.codeInput,
              code[index] && styles.codeInputFilled,
              error && styles.codeInputError,
            ]}
            value={code[index] || ''}
            onChangeText={(value) => handleCodeChange(index, value)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={index === 0 ? CODE_LENGTH : 1}
            selectTextOnFocus
            autoFocus={index === 0}
          />
        ))}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {isLoading && (
        <ActivityIndicator size="small" color={RENTER_COLORS.primary} style={styles.loader} />
      )}

      <TouchableOpacity
        style={styles.resendContainer}
        onPress={handleResendCode}
        disabled={countdown > 0}
      >
        <Text style={styles.resendText}>
          Didn't receive the code?{' '}
          <Text style={[styles.resendLink, countdown > 0 && styles.resendDisabled]}>
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.content}>
      <View style={[styles.iconContainer, styles.successIconContainer]}>
        <Icon name="check-circle" size={64} color="#22c55e" />
      </View>
      <Text style={styles.title}>Phone Verified!</Text>
      <Text style={styles.subtitle}>
        Your phone number has been successfully verified.
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={step !== 'success' ? onClose : undefined}
        />
        <View style={styles.modal}>
          {step !== 'success' && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={NEUTRAL_COLORS.gray} />
            </TouchableOpacity>
          )}

          {step === 'send' && renderSendStep()}
          {step === 'verify' && renderVerifyStep()}
          {step === 'success' && renderSuccessStep()}
        </View>
      </KeyboardAvoidingView>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RENTER_COLORS.lightest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successIconContainer: {
    backgroundColor: '#dcfce7',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  phone: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.xl,
  },
  button: {
    marginTop: SPACING.md,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.xl,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: NEUTRAL_COLORS.lightGray,
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize['xl'],
    fontWeight: '600',
    textAlign: 'center',
    color: NEUTRAL_COLORS.black,
  },
  codeInputFilled: {
    borderColor: RENTER_COLORS.primary,
    backgroundColor: RENTER_COLORS.lightest,
  },
  codeInputError: {
    borderColor: '#ef4444',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#fef2f2',
    borderRadius: RADIUS.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#ef4444',
  },
  loader: {
    marginTop: SPACING.md,
  },
  resendContainer: {
    marginTop: SPACING.lg,
  },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  resendLink: {
    color: RENTER_COLORS.primary,
    fontWeight: '600',
  },
  resendDisabled: {
    color: NEUTRAL_COLORS.gray,
  },
});

export default PhoneVerificationModal;
