import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useError } from '../../contexts/ErrorContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../utils/constants';
import { HostStackParamList } from '../../types';
import { Button, Card } from '../../components/common';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingDocuments'>;

type DocumentType = 'utility_bill' | 'rental_agreement' | 'property_tax' | 'landlord_permission';

interface DocumentOption {
  id: DocumentType;
  label: string;
  description: string;
  icon: string;
}

const DOCUMENT_OPTIONS: DocumentOption[] = [
  {
    id: 'utility_bill',
    label: 'Utility Bill',
    description: 'Recent electricity, gas, or water bill showing your name and address',
    icon: 'lightning-bolt',
  },
  {
    id: 'rental_agreement',
    label: 'Rental Agreement',
    description: 'Lease or rental contract showing you have permission to sublet parking',
    icon: 'file-document-outline',
  },
  {
    id: 'property_tax',
    label: 'Property Tax Bill',
    description: 'Property tax statement showing ownership',
    icon: 'home-city-outline',
  },
  {
    id: 'landlord_permission',
    label: 'Landlord Permission',
    description: 'Written permission from your landlord to rent parking',
    icon: 'account-check-outline',
  },
];

const AddListingDocumentsScreen = ({ navigation, route }: Props) => {
  const { colors } = useTheme();
  const { showError, showPopup } = useError();
  const { user, verifyId } = useAuth();

  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('utility_bill');
  const [ownershipDoc, setOwnershipDoc] = useState<string | null>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [isVerifyingId, setIsVerifyingId] = useState(false);

  const isIdVerified = user?.verified?.id ?? false;

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showPopup({
        title: 'Permission Required',
        message: 'Please enable camera access to take photos of your documents.',
        severity: 'info',
      });
      return false;
    }
    return true;
  };

  const pickImage = async (setImage: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async (setImage: (uri: string) => void) => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleVerifyId = async () => {
    if (!idImage) return;

    setIsVerifyingId(true);
    try {
      const success = await verifyId(idImage);
      if (success) {
        Alert.alert('Success', 'Your ID has been verified!');
      } else {
        showPopup({ title: 'Verification Failed', message: 'Please try again with a clearer photo.', severity: 'info' });
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsVerifyingId(false);
    }
  };

  const handleContinue = () => {
    if (!isIdVerified && !idImage) {
      showPopup({
        title: 'ID Required',
        message: 'Please upload your government-issued ID to continue.',
        severity: 'info',
      });
      return;
    }

    if (!ownershipDoc) {
      showPopup({
        title: 'Document Required',
        message: 'Please upload a document proving your right to rent this parking spot.',
        severity: 'info',
      });
      return;
    }

    // If ID was just uploaded but not verified yet, verify it first
    if (!isIdVerified && idImage) {
      handleVerifyId().then(() => {
        navigateToPreview();
      });
    } else {
      navigateToPreview();
    }
  };

  const navigateToPreview = () => {
    navigation.navigate('AddListingPreview', {
      ...route.params,
      ownershipDocument: ownershipDoc ? {
        uri: ownershipDoc,
        type: selectedDocType,
      } : undefined,
    });
  };

  const renderDocumentUpload = (
    title: string,
    description: string,
    image: string | null,
    setImage: (uri: string | null) => void,
    isVerified?: boolean
  ) => (
    <Card style={styles.uploadCard}>
      <View style={styles.uploadHeader}>
        <Text style={styles.uploadTitle}>{title}</Text>
        {isVerified && (
          <View style={styles.verifiedBadge}>
            <Icon name="check-circle" size={16} color={NEUTRAL_COLORS.success} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      <Text style={styles.uploadDescription}>{description}</Text>

      {image ? (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => setImage(null)}
          >
            <Icon name="close-circle" size={28} color={NEUTRAL_COLORS.error} />
          </TouchableOpacity>
        </View>
      ) : isVerified ? (
        <View style={[styles.verifiedPlaceholder, { backgroundColor: colors.lightest }]}>
          <Icon name="check-decagram" size={48} color={colors.primary} />
          <Text style={[styles.verifiedPlaceholderText, { color: colors.primary }]}>
            Already Verified
          </Text>
        </View>
      ) : (
        <View style={styles.uploadButtons}>
          <TouchableOpacity
            style={[styles.uploadButton, { borderColor: colors.primary }]}
            onPress={() => takePhoto(setImage)}
          >
            <Icon name="camera" size={24} color={colors.primary} />
            <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
              Take Photo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.uploadButton, { borderColor: colors.primary }]}
            onPress={() => pickImage(setImage)}
          >
            <Icon name="image" size={24} color={colors.primary} />
            <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
              Upload
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.lightest }]}>
          <Icon name="shield-check-outline" size={48} color={colors.primary} />
          <Text style={styles.headerTitle}>Verify Your Listing</Text>
          <Text style={styles.headerSubtitle}>
            We need to verify your identity and ownership to protect our community
          </Text>
        </View>

        {/* ID Verification Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="card-account-details" size={20} color={NEUTRAL_COLORS.black} />
            {' '}Step 1: Verify Your Identity
          </Text>
          {renderDocumentUpload(
            'Government-Issued ID',
            "Upload your driver's license, passport, or national ID card. Your name must match your profile.",
            idImage,
            setIdImage,
            isIdVerified
          )}
        </View>

        {/* Ownership Document Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="home-outline" size={20} color={NEUTRAL_COLORS.black} />
            {' '}Step 2: Prove Ownership or Permission
          </Text>

          <Text style={styles.docTypeLabel}>Select document type:</Text>
          <View style={styles.docTypeGrid}>
            {DOCUMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.docTypeOption,
                  selectedDocType === option.id && {
                    borderColor: colors.primary,
                    backgroundColor: colors.lightest,
                  },
                ]}
                onPress={() => setSelectedDocType(option.id)}
              >
                <Icon
                  name={option.icon}
                  size={24}
                  color={selectedDocType === option.id ? colors.primary : NEUTRAL_COLORS.gray}
                />
                <Text
                  style={[
                    styles.docTypeLabel,
                    selectedDocType === option.id && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderDocumentUpload(
            DOCUMENT_OPTIONS.find(d => d.id === selectedDocType)?.label || 'Document',
            DOCUMENT_OPTIONS.find(d => d.id === selectedDocType)?.description || '',
            ownershipDoc,
            setOwnershipDoc
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Icon name="information" size={20} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Why we need these documents</Text>
            <Text style={styles.infoText}>
              Verification helps protect renters from fraud and ensures you have the legal right to rent out this parking spot. Your documents are encrypted and securely stored.
            </Text>
          </View>
        </View>

        {/* Review Note */}
        <View style={styles.reviewNote}>
          <Icon name="clock-outline" size={16} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.reviewNoteText}>
            Your listing will be marked as "Pending Verification" until our team reviews your documents (usually within 24 hours).
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Continue to Preview"
          onPress={handleContinue}
          loading={isVerifyingId}
          icon="arrow-right"
          fullWidth
        />
      </View>
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
  header: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  uploadCard: {
    padding: SPACING.md,
  },
  uploadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  uploadTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.success,
    fontWeight: '500',
  },
  uploadDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.md,
    lineHeight: 20,
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
  imagePreview: {
    position: 'relative',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 14,
  },
  verifiedPlaceholder: {
    height: 120,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedPlaceholderText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  docTypeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  docTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  docTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    backgroundColor: NEUTRAL_COLORS.white,
    gap: SPACING.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL_COLORS.white,
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  reviewNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  reviewNoteText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
});

export default AddListingDocumentsScreen;
