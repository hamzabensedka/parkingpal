import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { RENTER_COLORS, NEUTRAL_COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import { AuthStackParamList } from '../../types';
import { Button, Input } from '../../components/common';
import { signUpSchema } from '../../utils/validation';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface SignUpScreenProps {
  navigation: SignUpScreenNavigationProp;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { signup, isLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await signUpSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Partial<FormData> = {};
      error.inner?.forEach((err: any) => {
        if (err.path) {
          validationErrors[err.path as keyof FormData] = err.message;
        }
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSignUp = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      navigation.navigate('UserType');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Please try again.');
    }
  };

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={NEUTRAL_COLORS.black} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join ParkingPal and start finding parking or earning from your space
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => updateField('firstName', value)}
                  placeholder="John"
                  leftIcon="account-outline"
                  error={errors.firstName}
                  required
                />
              </View>
              <View style={styles.nameField}>
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => updateField('lastName', value)}
                  placeholder="Doe"
                  error={errors.lastName}
                  required
                />
              </View>
            </View>

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="john.doe@email.com"
              type="email"
              leftIcon="email-outline"
              error={errors.email}
              required
            />

            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="+33 6 12 34 56 78"
              type="phone"
              leftIcon="phone-outline"
              error={errors.phone}
              required
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              placeholder="Create a strong password"
              type="password"
              leftIcon="lock-outline"
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder="Confirm your password"
              type="password"
              leftIcon="lock-check-outline"
              error={errors.confirmPassword}
              required
            />

            {/* Password Requirements */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirement}>
                <Icon
                  name={formData.password.length >= 8 ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={formData.password.length >= 8 ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.gray}
                />
                <Text style={styles.requirementText}>At least 8 characters</Text>
              </View>
              <View style={styles.requirement}>
                <Icon
                  name={/[A-Z]/.test(formData.password) ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={/[A-Z]/.test(formData.password) ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.gray}
                />
                <Text style={styles.requirementText}>One uppercase letter</Text>
              </View>
              <View style={styles.requirement}>
                <Icon
                  name={/[0-9]/.test(formData.password) ? 'check-circle' : 'circle-outline'}
                  size={16}
                  color={/[0-9]/.test(formData.password) ? NEUTRAL_COLORS.success : NEUTRAL_COLORS.gray}
                />
                <Text style={styles.requirementText}>One number</Text>
              </View>
            </View>

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              fullWidth
              style={styles.signUpButton}
            />
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 24,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  nameField: {
    flex: 1,
  },
  passwordRequirements: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  requirementsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  requirementText: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  signUpButton: {
    marginTop: SPACING.sm,
  },
  terms: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  termsLink: {
    color: RENTER_COLORS.primary,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: RENTER_COLORS.primary,
    fontWeight: '600',
  },
});

export default SignUpScreen;
