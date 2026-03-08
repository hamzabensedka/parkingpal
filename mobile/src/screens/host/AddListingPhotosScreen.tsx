import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useError } from '../../contexts/ErrorContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { HostStackParamList } from '../../types';
import { Button, Card } from '../../components/common';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingPhotos'>;

interface PhotoItem {
  id: string;
  uri: string;
  isMain: boolean;
}

const AddListingPhotosScreen = ({ navigation, route }: Props) => {
  const { address, latitude, longitude } = route.params;
  const { colors } = useTheme();
  const { showPopup } = useError();

  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const handlePickImage = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showPopup({ title: 'Permission Required', message: 'Please allow access to your photo library.', severity: 'info' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      const newPhotos: PhotoItem[] = result.assets.map((asset, index) => ({
        id: `photo-${Date.now()}-${index}`,
        uri: asset.uri,
        isMain: photos.length === 0 && index === 0,
      }));

      setPhotos(prev => [...prev, ...newPhotos]);
    }
  }, [photos.length]);

  const handleTakePhoto = useCallback(async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      showPopup({ title: 'Permission Required', message: 'Please allow access to your camera.', severity: 'info' });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      const newPhoto: PhotoItem = {
        id: `photo-${Date.now()}`,
        uri: result.assets[0].uri,
        isMain: photos.length === 0,
      };

      setPhotos(prev => [...prev, newPhoto]);
    }
  }, [photos.length]);

  const handleRemovePhoto = useCallback((photoId: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId);
      // If we removed the main photo, make the first one main
      if (filtered.length > 0 && !filtered.some(p => p.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  }, []);

  const handleSetMainPhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.map(p => ({
      ...p,
      isMain: p.id === photoId,
    })));
  }, []);

  const handleContinue = () => {
    if (photos.length < 1) {
      showPopup({ title: 'Add Photos', message: 'Please add at least one photo of your parking spot.', severity: 'info' });
      return;
    }

    const location = { address, latitude, longitude };
    const photoUris = photos.map(p => p.uri);

    navigation.navigate('AddListingDetails', {
      location,
      photos: photoUris,
    });
  };

  const renderPhotoTips = () => (
    <Card style={styles.tipsCard}>
      <Text style={styles.tipsTitle}>Photo Tips</Text>
      <View style={styles.tipsList}>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color="#22c55e" />
          <Text style={styles.tipText}>Show the full parking space clearly</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color="#22c55e" />
          <Text style={styles.tipText}>Include entrance and exit points</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color="#22c55e" />
          <Text style={styles.tipText}>Show any security features</Text>
        </View>
        <View style={styles.tipItem}>
          <Icon name="check-circle" size={16} color="#22c55e" />
          <Text style={styles.tipText}>Take photos in good lighting</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>Add Photos</Text>
          <Text style={styles.subtitle}>
            Great photos help renters understand your space and increase bookings.
          </Text>
        </View>

        {/* Photo Grid */}
        <View style={styles.photoSection}>
          <View style={styles.photoGrid}>
            {/* Add Photo Buttons */}
            <TouchableOpacity
              style={[styles.addPhotoCard, { borderColor: colors.primary }]}
              onPress={handlePickImage}
            >
              <Icon name="image-plus" size={32} color={colors.primary} />
              <Text style={[styles.addPhotoText, { color: colors.primary }]}>
                From Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addPhotoCard, { borderColor: colors.primary }]}
              onPress={handleTakePhoto}
            >
              <Icon name="camera-plus" size={32} color={colors.primary} />
              <Text style={[styles.addPhotoText, { color: colors.primary }]}>
                Take Photo
              </Text>
            </TouchableOpacity>

            {/* Photo Items */}
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoImage} />

                {photo.isMain && (
                  <View style={[styles.mainBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.mainBadgeText}>Main</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePhoto(photo.id)}
                >
                  <Icon name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>

                {!photo.isMain && (
                  <TouchableOpacity
                    style={[styles.setMainButton, { backgroundColor: colors.lightest }]}
                    onPress={() => handleSetMainPhoto(photo.id)}
                  >
                    <Text style={[styles.setMainText, { color: colors.primary }]}>
                      Set as Main
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <Text style={styles.photoCount}>
            {photos.length} photo{photos.length !== 1 ? 's' : ''} added
            {photos.length < 3 && ' (minimum 1, recommended 5+)'}
          </Text>
        </View>

        {/* Tips */}
        {renderPhotoTips()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Text style={styles.progressNumber}>2</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.progressNumber}>3</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.progressNumber}>4</Text>
          </View>
        </View>
        <View style={styles.footerButtons}>
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={photos.length < 1}
            style={styles.continueButton}
          />
        </View>
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
  infoSection: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    lineHeight: 22,
  },
  photoSection: {
    padding: SPACING.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  addPhotoCard: {
    width: '48%',
    aspectRatio: 4 / 3,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
  },
  addPhotoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 4 / 3,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  mainBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 12,
  },
  setMainButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  setMainText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  photoCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  tipsCard: {
    margin: SPACING.md,
    padding: SPACING.md,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  tipsList: {
    gap: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: NEUTRAL_COLORS.lightGray,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
});

export default AddListingPhotosScreen;
