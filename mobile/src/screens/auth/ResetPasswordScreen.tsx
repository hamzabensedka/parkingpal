import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RENTER_COLORS, NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { useError } from '../../contexts/ErrorContext';
import { AuthStackParamList } from '../../types';
import { Button, Input, AnimatedPressable } from '../../components/common';
import { authApi } from '../../services/api';
import * as yup from 'yup';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>;

type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
}

const passwordSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { token } = route.params;
  const { showError } = useError();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateForm = async (): Promise<boolean> => {
    try {
      await passwordSchema.validate({ password, confirmPassword }, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: { password?: string; confirmPassword?: string } = {};
      error.inner?.forEach((err: any) => {
        if (err.path) {
          validationErrors[err.path as keyof typeof validationErrors] = err.message;
        }
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: password });
      setResetSuccess(true);
    } catch (error) {
      showError(error, handleSubmit);
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle-outline" size={64} color="#22c55e" />
          </View>
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successMessage}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Text>

          <Button
            title="Sign In"
            onPress={() => navigation.navigate('Login')}
            fullWidth
            style={styles.signInButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <AnimatedPressable
            haptic
            style={styles.backButtonHeader}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={NEUTRAL_COLORS.black} />
          </AnimatedPressable>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Icon name="lock-check-outline" size={48} color={RENTER_COLORS.primary} />
              </View>
              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.subtitle}>
                Your new password must be different from previously used passwords.
              </Text>
            </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <View style={styles.form}>
            <Input
              label="New Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              type="password"
              leftIcon="lock-outline"
              error={errors.password}
              autoFocus
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              type="password"
              leftIcon="lock-check-outline"
              error={errors.confirmPassword}
            />

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementItem}>
                <Icon
                  name={password.length >= 8 ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={password.length >= 8 ? '#22c55e' : NEUTRAL_COLORS.gray}
                />
                <Text
                  style={[
                    styles.requirementText,
                    password.length >= 8 && styles.requirementMet,
                  ]}
                >
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={/[A-Z]/.test(password) ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={/[A-Z]/.test(password) ? '#22c55e' : NEUTRAL_COLORS.gray}
                />
                <Text
                  style={[
                    styles.requirementText,
                    /[A-Z]/.test(password) && styles.requirementMet,
                  ]}
                >
                  One uppercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={/[a-z]/.test(password) ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={/[a-z]/.test(password) ? '#22c55e' : NEUTRAL_COLORS.gray}
                />
                <Text
                  style={[
                    styles.requirementText,
                    /[a-z]/.test(password) && styles.requirementMet,
                  ]}
                >
                  One lowercase letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={/\d/.test(password) ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={/\d/.test(password) ? '#22c55e' : NEUTRAL_COLORS.gray}
                />
                <Text
                  style={[
                    styles.requirementText,
                    /\d/.test(password) && styles.requirementMet,
                  ]}
                >
                  One number
                </Text>
              </View>
            </View>

            <Button
              title="Reset Password"
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING['2xl'],
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NEUTRAL_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
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
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  requirements: {
    backgroundColor: NEUTRAL_COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  requirementsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  requirementText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginLeft: SPACING.sm,
  },
  requirementMet: {
    color: '#22c55e',
  },
  submitButton: {
    marginTop: SPACING.md,
  },
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  signInButton: {
    marginTop: SPACING.md,
  },
});

export default ResetPasswordScreen;
