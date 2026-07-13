import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, CANCELLATION_POLICIES } from '../../utils/constants';
import { HostStackParamList } from '../../types';
import { Button, Input, Card, AnimatedPressable } from '../../components/common';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingDescription'>;

const AddListingDescriptionScreen = ({ navigation, route }: Props) => {
  const { location, photos, spotType, amenities, vehicleSizes, accessInstructions, accessType, hourlyRate, dailyRate, availability, numberOfSpots } = route.params;
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [houseRules, setHouseRules] = useState('');
  const [instantBook, setInstantBook] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState<'flexible' | 'moderate' | 'strict'>('moderate');

  const handleContinue = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    navigation.navigate('AddListingDocuments', {
      location,
      photos,
      spotType,
      amenities,
      vehicleSizes,
      accessInstructions,
      accessType,
      hourlyRate,
      dailyRate,
      availability,
      title,
      description,
      houseRules: houseRules.trim() || undefined,
      numberOfSpots,
    });
  };

  const isValid = title.trim().length >= 5 && description.trim().length >= 20;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
          <View style={styles.header}>
            <Text style={styles.title}>Listing Details</Text>
            <Text style={styles.subtitle}>
              Make your listing stand out with a great title and description
            </Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Title</Text>
            <Input
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Secure Garage Near Metro Station"
              maxLength={60}
            />
            <Text style={styles.charCount}>{title.length}/60</Text>
          </View>
        </Animated.View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionSubtitle}>
            Describe your parking spot, its features, and any important details
          </Text>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Spacious garage with easy access, well-lit, and secure. Perfect for daily commuters. Close to restaurants and shops."
            multiline
            numberOfLines={6}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* House Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>House Rules (Optional)</Text>
          <Text style={styles.sectionSubtitle}>
            Any specific rules renters should follow
          </Text>
          <Input
            value={houseRules}
            onChangeText={setHouseRules}
            placeholder="e.g., No oversized vehicles, Keep gate closed at all times"
            multiline
            numberOfLines={4}
            maxLength={300}
          />
          <Text style={styles.charCount}>{houseRules.length}/300</Text>
        </View>

        {/* Instant Book */}
        <Card style={styles.instantBookCard}>
          <View style={styles.instantBookRow}>
            <Icon name="lightning-bolt" size={24} color={instantBook ? colors.primary : NEUTRAL_COLORS.gray} />
            <View style={styles.instantBookContent}>
              <Text style={styles.instantBookLabel}>Instant Book</Text>
              <Text style={styles.instantBookDesc}>
                Renters can book immediately without waiting for approval
              </Text>
            </View>
            <Switch
              value={instantBook}
              onValueChange={setInstantBook}
              trackColor={{ false: NEUTRAL_COLORS.lightGray, true: colors.medium }}
              thumbColor={instantBook ? colors.primary : NEUTRAL_COLORS.white}
            />
          </View>
        </Card>

        {/* Cancellation Policy */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <View style={styles.policyList}>
            {CANCELLATION_POLICIES.map((policy) => {
              const isSelected = cancellationPolicy === policy.id;
              return (
                <AnimatedPressable
                  haptic
                  key={policy.id}
                  style={[
                    styles.policyItem,
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.lightest },
                  ]}
                  onPress={() => setCancellationPolicy(policy.id as typeof cancellationPolicy)}
                >
                  <View style={[
                    styles.radioOuter,
                    isSelected && { borderColor: colors.primary },
                  ]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <View style={styles.policyContent}>
                    <Text style={[
                      styles.policyLabel,
                      isSelected && { color: colors.primary, fontWeight: '600' },
                    ]}>
                      {policy.label}
                    </Text>
                    <Text style={styles.policyDesc}>{policy.description}</Text>
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>
        </Animated.View>

        {/* Tips */}
        <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
          <View style={[styles.tipBox, { backgroundColor: colors.lightest }]}>
            <Icon name="lightbulb-on-outline" size={24} color={colors.primary} />
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, { color: colors.dark }]}>Pro Tips</Text>
              <Text style={styles.tipText}>
                • Use descriptive titles that highlight key features{'\n'}
                • Mention nearby landmarks and attractions{'\n'}
                • Enable instant book to get more bookings
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Icon name="check" size={14} color={NEUTRAL_COLORS.white} />
          </View>
          <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Text style={styles.progressNumber}>6</Text>
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
            title="Preview"
            onPress={handleContinue}
            disabled={!isValid}
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
  header: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    marginBottom: SPACING.sm,
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
    lineHeight: 24,
  },
  section: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    marginBottom: SPACING.sm,
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
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'right',
    marginTop: 4,
  },
  instantBookCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  instantBookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  instantBookContent: {
    flex: 1,
  },
  instantBookLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  instantBookDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  policyList: {
    gap: SPACING.sm,
  },
  policyItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: NEUTRAL_COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  policyContent: {
    flex: 1,
  },
  policyLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
    marginBottom: 4,
  },
  policyDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  tipBox: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
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

export default AddListingDescriptionScreen;
