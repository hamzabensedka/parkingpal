import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../utils/constants';
import { AuthStackParamList } from '../../types';
import { Button } from '../../components/common';

type IDVerificationScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'IDVerification'>;

interface IDVerificationScreenProps {
  navigation: IDVerificationScreenNavigationProp;
}

const IDVerificationScreen: React.FC<IDVerificationScreenProps> = ({ navigation }) => {
  const { verifyId, isLoading } = useAuth();
  const { colors } = useTheme();
  const [idImage, setIdImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable camera access to take a photo of your ID.'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIdImage(result.assets[0].uri);
    }
  };

  const handleChooseFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIdImage(result.assets[0].uri);
    }
  };

  const handleVerify = async () => {
    if (!idImage) return;

    setIsVerifying(true);
    try {
      const success = await verifyId(idImage);
      if (success) {
        navigation.navigate('OnboardingComplete');
      } else {
        Alert.alert(
          'Verification Failed',
          'We could not verify your ID. Please try again with a clearer photo.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingComplete');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={NEUTRAL_COLORS.black} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.lightest }]}>
            <Icon name="card-account-details-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>
            ID verification helps build trust and keeps our community safe. Your information is encrypted and secure.
          </Text>
        </View>

        {/* ID Upload Area */}
        <View style={styles.uploadSection}>
          {idImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: idImage }} style={styles.idImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setIdImage(null)}
              >
                <Icon name="close-circle" size={28} color={NEUTRAL_COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.uploadPlaceholder, { borderColor: colors.medium }]}>
              <Icon name="image-plus" size={48} color={colors.medium} />
              <Text style={styles.uploadText}>Upload your ID</Text>
              <Text style={styles.uploadHint}>
                Driver's license, passport, or national ID
              </Text>
            </View>
          )}

          {/* Upload Buttons */}
          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: colors.primary }]}
              onPress={handleTakePhoto}
            >
              <Icon name="camera" size={24} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.uploadButton, { borderColor: colors.primary }]}
              onPress={handleChooseFromLibrary}
            >
              <Icon name="image" size={24} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="shield-check" size={20} color={NEUTRAL_COLORS.success} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Your privacy is protected</Text>
            <Text style={styles.infoText}>
              We use bank-level encryption to protect your data. Your ID is only used for verification and is never shared.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <Button
            title="Verify ID"
            onPress={handleVerify}
            disabled={!idImage}
            loading={isVerifying}
            fullWidth
            style={styles.verifyButton}
          />

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>

          <Text style={styles.skipNote}>
            You can verify later from your profile settings
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
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
    color: NEUTRAL_COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  uploadSection: {
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  idImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 14,
  },
  uploadPlaceholder: {
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEUTRAL_COLORS.background,
    marginBottom: SPACING.md,
  },
  uploadText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginTop: SPACING.sm,
  },
  uploadHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: SPACING.xs,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  uploadButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL_COLORS.lightGray,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 2,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  verifyButton: {
    marginBottom: SPACING.md,
  },
  skipButton: {
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
  },
  skipNote: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: SPACING.xs,
  },
});

export default IDVerificationScreen;
