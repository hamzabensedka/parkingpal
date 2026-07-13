import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useError } from '../../contexts/ErrorContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Button, Input, Card, AnimatedPressable } from '../../components/common';

type IssueType =
  | 'spot_not_available'
  | 'wrong_location'
  | 'safety_concern'
  | 'damage'
  | 'access_issue'
  | 'payment_issue'
  | 'other';

const ISSUE_TYPES: { value: IssueType; label: string; icon: string }[] = [
  { value: 'spot_not_available', label: 'Spot Not Available', icon: 'parking' },
  { value: 'wrong_location', label: 'Wrong Location', icon: 'map-marker-off' },
  { value: 'safety_concern', label: 'Safety Concern', icon: 'shield-alert' },
  { value: 'damage', label: 'Property Damage', icon: 'car-wrench' },
  { value: 'access_issue', label: 'Access Issue', icon: 'lock-alert' },
  { value: 'payment_issue', label: 'Payment Issue', icon: 'credit-card-off' },
  { value: 'other', label: 'Other', icon: 'help-circle' },
];

const ReportIssueScreen: React.FC<any> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const { colors } = useTheme();
  const { showError, showPopup } = useError();

  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  }, []);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedIssue) {
      showPopup({ title: 'Select Issue Type', message: 'Please select the type of issue you\'re experiencing.', severity: 'info' });
      return;
    }

    if (!description.trim()) {
      showPopup({ title: 'Description Required', message: 'Please describe the issue.', severity: 'info' });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Report Submitted',
        'We\'ve received your report and will review it shortly. You\'ll hear back within 24 hours.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedIssue, description, photos, isUrgent, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Info Banner */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
          <View style={[styles.infoBanner, { backgroundColor: colors.lightest }]}>
            <Icon name="shield-check" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.dark }]}>
                We're Here to Help
              </Text>
              <Text style={styles.infoText}>
                Report any issues and our team will investigate and resolve them promptly.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Issue Type Selection */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's the issue?</Text>
          <View style={styles.issueGrid}>
            {ISSUE_TYPES.map((issue) => {
              const isSelected = selectedIssue === issue.value;
              return (
                <AnimatedPressable
                  key={issue.value}
                  style={[
                    styles.issueItem,
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.lightest },
                  ]}
                  onPress={() => setSelectedIssue(issue.value)}
                  haptic
                >
                  <Icon
                    name={issue.icon}
                    size={24}
                    color={isSelected ? colors.primary : NEUTRAL_COLORS.gray}
                  />
                  <Text style={[
                    styles.issueLabel,
                    isSelected && { color: colors.primary, fontWeight: '600' },
                  ]}>
                    {issue.label}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Describe the issue</Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Please provide as much detail as possible about the issue you're experiencing..."
              multiline
              numberOfLines={6}
              maxLength={1000}
            />
            <Text style={styles.charCount}>{description.length}/1000</Text>
          </View>
        </Animated.View>

        {/* Photos */}
        <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Photos help us understand and resolve the issue faster
          </Text>
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <AnimatedPressable
                  style={styles.photoRemove}
                  onPress={() => handleRemovePhoto(index)}
                  haptic
                >
                  <Icon name="close-circle" size={22} color={NEUTRAL_COLORS.darkGray} />
                </AnimatedPressable>
              </View>
            ))}
            {photos.length < 5 && (
              <AnimatedPressable
                style={[styles.addPhotoButton, { borderColor: colors.primary }]}
                onPress={handleAddPhoto}
                haptic
              >
                <Icon name="camera-plus" size={24} color={colors.primary} />
                <Text style={[styles.addPhotoText, { color: colors.primary }]}>
                  Add Photo
                </Text>
              </AnimatedPressable>
            )}
          </View>
        </View>
        </Animated.View>

        {/* Urgency Toggle */}
        <Card style={styles.urgencyCard}>
          <AnimatedPressable
            style={styles.urgencyRow}
            onPress={() => setIsUrgent(!isUrgent)}
            haptic
          >
            <Icon
              name="alert-circle"
              size={24}
              color={isUrgent ? NEUTRAL_COLORS.darkGray : NEUTRAL_COLORS.gray}
            />
            <View style={styles.urgencyContent}>
              <Text style={styles.urgencyLabel}>This is urgent</Text>
              <Text style={styles.urgencyDesc}>
                Mark this if you need immediate assistance
              </Text>
            </View>
            <View style={[
              styles.toggleSwitch,
              isUrgent && { backgroundColor: NEUTRAL_COLORS.darkGray },
            ]}>
              <View style={[
                styles.toggleKnob,
                isUrgent && styles.toggleKnobActive,
              ]} />
            </View>
          </AnimatedPressable>
        </Card>

        {/* Booking Reference */}
        {bookingId && (
          <View style={styles.referenceRow}>
            <Icon name="bookmark" size={16} color={NEUTRAL_COLORS.gray} />
            <Text style={styles.referenceText}>
              Booking ref: #{bookingId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title="Submit Report"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!selectedIssue || !description.trim()}
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
  infoBanner: {
    flexDirection: 'row',
    padding: SPACING.md,
    margin: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },
  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  issueItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    gap: SPACING.sm,
  },
  issueLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'right',
    marginTop: 4,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 11,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
  },
  addPhotoText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
    marginTop: 4,
  },
  urgencyCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: 0,
    overflow: 'hidden',
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  urgencyContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  urgencyLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  urgencyDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    justifyContent: 'center',
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: NEUTRAL_COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  referenceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
});

export default ReportIssueScreen;
