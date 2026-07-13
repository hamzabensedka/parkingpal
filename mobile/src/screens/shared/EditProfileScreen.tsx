import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Button, Input, Card, Avatar, PhoneVerificationModal, AnimatedPressable } from '../../components/common';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { user, updateProfile, sendPhoneCode, verifyPhone } = useAuth();
  const { showError, showPopup } = useError();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? user?.profilePhoto ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  const handlePickAvatar = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showPopup({ title: 'Permission Required', message: 'Please allow access to your photo library.', severity: 'info' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showPopup({ title: 'Required Fields', message: 'Please fill in your first and last name.', severity: 'info' });
      return;
    }

    setIsLoading(true);

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar: avatar || undefined,
        profilePhoto: avatar || undefined,
      });

      Alert.alert('Success', 'Your profile has been updated.');
      navigation.goBack();
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [firstName, lastName, phone, bio, avatar, updateProfile, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
        <View style={styles.avatarSection}>
          <AnimatedPressable onPress={handlePickAvatar} haptic>
            <Avatar
              name={firstName}
              imageUrl={avatar}
              size={100}
            />
            <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
              <Icon name="camera" size={18} color={NEUTRAL_COLORS.white} />
            </View>
          </AnimatedPressable>
          <Text style={[styles.changePhotoText, { color: colors.primary }]}>
            Change Photo
          </Text>
        </View>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <View style={styles.form}>
          <View style={styles.row}>
            <Input
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              containerStyle={styles.halfInput}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            editable={false}
            leftIcon="email"
          />

          <View style={styles.verifiedRow}>
            <Icon name="check-circle" size={16} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.verifiedText}>Email verified</Text>
          </View>

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+33 6 12 34 56 78"
            keyboardType="phone-pad"
            leftIcon="phone"
          />

          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others a bit about yourself..."
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>
        </Animated.View>

        {/* Verification Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification</Text>
          <Card style={styles.verificationCard}>
            <View style={styles.verificationItem}>
              <Icon name="email-check" size={24} color={NEUTRAL_COLORS.darkGray} />
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationLabel}>Email</Text>
                <Text style={styles.verificationStatus}>Verified</Text>
              </View>
              <Icon name="check-circle" size={20} color={NEUTRAL_COLORS.darkGray} />
            </View>

            <View style={styles.verificationDivider} />

            <View style={styles.verificationItem}>
              <Icon
                name="phone-check"
                size={24}
                color={user?.verified?.phone ? NEUTRAL_COLORS.darkGray : NEUTRAL_COLORS.gray}
              />
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationLabel}>Phone</Text>
                <Text style={styles.verificationStatus}>
                  {user?.verified?.phone ? 'Verified' : 'Not verified'}
                </Text>
              </View>
              {user?.verified?.phone ? (
                <Icon name="check-circle" size={20} color={NEUTRAL_COLORS.darkGray} />
              ) : (
                <AnimatedPressable onPress={() => {
                  if (!phone.trim()) {
                    showPopup({ title: 'Phone Required', message: 'Please enter your phone number first.', severity: 'info' });
                    return;
                  }
                  setShowPhoneVerification(true);
                }} haptic>
                  <Text style={[styles.verifyLink, { color: colors.primary }]}>Verify</Text>
                </AnimatedPressable>
              )}
            </View>

            <View style={styles.verificationDivider} />

            <View style={styles.verificationItem}>
              <Icon
                name="card-account-details"
                size={24}
                color={user?.verified?.id ? NEUTRAL_COLORS.darkGray : NEUTRAL_COLORS.gray}
              />
              <View style={styles.verificationInfo}>
                <Text style={styles.verificationLabel}>ID</Text>
                <Text style={styles.verificationStatus}>
                  {user?.verified?.id ? 'Verified' : 'Not verified'}
                </Text>
              </View>
              {user?.verified?.id ? (
                <Icon name="check-circle" size={20} color={NEUTRAL_COLORS.darkGray} />
              ) : (
                <AnimatedPressable haptic>
                  <Text style={[styles.verifyLink, { color: colors.primary }]}>Verify</Text>
                </AnimatedPressable>
              )}
            </View>
          </Card>
        </View>
        </Animated.View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isLoading}
          fullWidth
        />
      </View>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        visible={showPhoneVerification}
        phone={phone}
        onClose={() => setShowPhoneVerification(false)}
        onSendCode={sendPhoneCode}
        onVerify={verifyPhone}
        onSuccess={() => {
          setShowPhoneVerification(false);
          Alert.alert('Success', 'Your phone number has been verified.');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: NEUTRAL_COLORS.white,
  },
  changePhotoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  form: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    marginTop: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'right',
    marginTop: -SPACING.sm,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
  },
  verificationCard: {
    padding: 0,
    overflow: 'hidden',
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  verificationInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  verificationLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
  },
  verificationStatus: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  verificationDivider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginLeft: 56,
  },
  verifyLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
});

export default EditProfileScreen;
