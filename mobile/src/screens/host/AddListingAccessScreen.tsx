import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, ACCESS_TYPES } from '../../utils/constants';
import { HostStackParamList, AccessType } from '../../types';
import { Button, Input } from '../../components/common';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingAccess'>;

const AddListingAccessScreen = ({ navigation, route }: Props) => {
  const { location, photos, spotType, amenities, vehicleSizes } = route.params;
  const { colors } = useTheme();

  const [accessType, setAccessType] = useState<AccessType | null>(null);
  const [accessInstructions, setAccessInstructions] = useState('');

  const accessTypeOptions: { type: AccessType; label: string; icon: string; description: string }[] = [
    { type: 'code', label: 'Gate/Door Code', icon: 'dialpad', description: 'Provide a code for entry' },
    { type: 'key', label: 'Meet in Person', icon: 'key', description: 'Meet renter to provide access' },
    { type: 'smart_lock', label: 'Smart Lock', icon: 'lock-smart', description: 'Use smart lock system' },
    { type: 'trust', label: 'Leave Unlocked', icon: 'door-open', description: 'No special access required' },
  ];

  const handleContinue = () => {
    if (!accessType || !accessInstructions.trim()) {
      return;
    }

    navigation.navigate('AddListingPricing', {
      location,
      photos,
      spotType,
      amenities,
      vehicleSizes,
      accessInstructions,
      accessType,
    });
  };

  const isValid = accessType && accessInstructions.trim().length >= 10;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Access Instructions</Text>
          <Text style={styles.subtitle}>
            How will renters access your parking spot?
          </Text>
        </View>

        {/* Access Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Access Method</Text>
          <View style={styles.accessTypeList}>
            {accessTypeOptions.map((option) => {
              const isSelected = accessType === option.type;
              return (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.accessTypeItem,
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.lightest },
                  ]}
                  onPress={() => setAccessType(option.type)}
                >
                  <View style={[
                    styles.radioOuter,
                    isSelected && { borderColor: colors.primary },
                  ]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <View style={styles.accessTypeContent}>
                    <View style={styles.accessTypeHeader}>
                      <Icon
                        name={option.icon}
                        size={24}
                        color={isSelected ? colors.primary : NEUTRAL_COLORS.gray}
                      />
                      <Text style={[
                        styles.accessTypeLabel,
                        isSelected && { color: colors.primary, fontWeight: '600' },
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                    <Text style={styles.accessTypeDesc}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Instructions</Text>
          <Text style={styles.sectionSubtitle}>
            Provide step-by-step instructions for renters to access your spot
          </Text>
          <Input
            value={accessInstructions}
            onChangeText={setAccessInstructions}
            placeholder="e.g., Enter code #1234 at the gate. The parking spot is on the left side, marked with number 5."
            multiline
            numberOfLines={6}
            maxLength={500}
          />
          <Text style={styles.charCount}>{accessInstructions.length}/500</Text>
        </View>

        {/* Tips */}
        <View style={[styles.tipBox, { backgroundColor: colors.lightest }]}>
          <Icon name="lightbulb-on-outline" size={24} color={colors.primary} />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: colors.dark }]}>Tip</Text>
            <Text style={styles.tipText}>
              Clear instructions help renters find your spot quickly and reduce support requests.
            </Text>
          </View>
        </View>
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
            <Text style={styles.progressNumber}>4</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.progressNumber}>5</Text>
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
  accessTypeList: {
    gap: SPACING.sm,
  },
  accessTypeItem: {
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
  accessTypeContent: {
    flex: 1,
  },
  accessTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  accessTypeLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
  },
  accessTypeDesc: {
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

export default AddListingAccessScreen;
