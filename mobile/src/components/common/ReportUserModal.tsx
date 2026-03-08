import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RENTER_COLORS, NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { safetyApi } from '../../services/api';
import { REPORT_REASONS } from '../../services/api/safetyApi';
import { useError } from '../../contexts/ErrorContext';
import Button from './Button';
import type { ReportReasonDTO } from '@parkingpal/shared-types';

interface ReportUserModalProps {
  visible: boolean;
  userId: string;
  userName: string;
  relatedId?: string;
  relatedType?: 'booking' | 'message' | 'spot' | 'review';
  onClose: () => void;
  onSuccess?: () => void;
}

const ReportUserModal: React.FC<ReportUserModalProps> = ({
  visible,
  userId,
  userName,
  relatedId,
  relatedType,
  onClose,
  onSuccess,
}) => {
  const { showError } = useError();
  const [step, setStep] = useState<'reason' | 'details' | 'success'>('reason');
  const [selectedReason, setSelectedReason] = useState<ReportReasonDTO | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setStep('reason');
      setSelectedReason(null);
      setDescription('');
      setError(null);
    }
  }, [visible]);

  const handleSelectReason = (reason: ReportReasonDTO) => {
    setSelectedReason(reason);
    setStep('details');
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) return;

    setIsLoading(true);
    setError(null);

    try {
      await safetyApi.submitReport({
        reportedId: userId,
        reason: selectedReason,
        description: description.trim() || undefined,
        relatedId,
        relatedType,
      });

      setStep('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit report';
      if (errorMessage.includes('already reported')) {
        setError('You have already reported this user for this issue.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${userName}? They won't be able to contact you or see your listings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await safetyApi.blockUser(userId);
              Alert.alert('User Blocked', `${userName} has been blocked.`);
            } catch (err) {
              showError(err);
            }
          },
        },
      ]
    );
  };

  const renderReasonStep = () => (
    <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name="flag-outline" size={48} color={RENTER_COLORS.primary} />
        </View>
        <Text style={styles.title}>Report {userName}</Text>
        <Text style={styles.subtitle}>
          Why are you reporting this user? Select a reason below.
        </Text>

        <View style={styles.reasonsContainer}>
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={styles.reasonItem}
              onPress={() => handleSelectReason(reason.value)}
            >
              <View style={styles.reasonContent}>
                <Text style={styles.reasonLabel}>{reason.label}</Text>
                <Text style={styles.reasonDesc}>{reason.description}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={NEUTRAL_COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.blockOption} onPress={handleBlockUser}>
          <Icon name="account-cancel" size={20} color="#ef4444" />
          <Text style={styles.blockText}>Block this user instead</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDetailsStep = () => {
    const selectedReasonData = REPORT_REASONS.find(r => r.value === selectedReason);

    return (
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep('reason')}>
          <Icon name="arrow-left" size={24} color={NEUTRAL_COLORS.gray} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Icon name="text-box-outline" size={48} color={RENTER_COLORS.primary} />
        </View>
        <Text style={styles.title}>Add Details</Text>
        <Text style={styles.subtitle}>
          Reporting for: <Text style={styles.bold}>{selectedReasonData?.label}</Text>
        </Text>

        <Text style={styles.inputLabel}>Additional details (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe what happened..."
          placeholderTextColor={NEUTRAL_COLORS.gray}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          maxLength={1000}
        />
        <Text style={styles.charCount}>{description.length}/1000</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Button
          title="Submit Report"
          onPress={handleSubmitReport}
          loading={isLoading}
          fullWidth
          style={styles.button}
        />

        <Text style={styles.disclaimer}>
          Your report is confidential. We will review it and take appropriate action.
        </Text>
      </View>
    );
  };

  const renderSuccessStep = () => (
    <View style={styles.content}>
      <View style={[styles.iconContainer, styles.successIconContainer]}>
        <Icon name="check-circle" size={64} color="#22c55e" />
      </View>
      <Text style={styles.title}>Report Submitted</Text>
      <Text style={styles.subtitle}>
        Thank you for helping keep ParkingPal safe. We'll review your report and take appropriate action.
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

          {step === 'reason' && renderReasonStep()}
          {step === 'details' && renderDetailsStep()}
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
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.sm,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: SPACING.sm,
    zIndex: 1,
  },
  scrollContent: {
    maxHeight: 500,
  },
  content: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING['2xl'],
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
    marginBottom: SPACING.lg,
  },
  bold: {
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  reasonsContainer: {
    width: '100%',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  reasonDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  blockOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: '#fef2f2',
  },
  blockText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: '#ef4444',
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
    width: '100%',
  },
  textArea: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.black,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: '#fef2f2',
    borderRadius: RADIUS.sm,
    width: '100%',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#ef4444',
    flex: 1,
  },
  button: {
    marginTop: SPACING.xl,
  },
  disclaimer: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default ReportUserModal;
