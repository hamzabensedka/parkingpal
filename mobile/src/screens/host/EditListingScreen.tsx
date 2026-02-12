import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, Button } from '../../components/common';
import { spotApi } from '../../services/api';
import type { SpotDTO, UpdateSpotRequest } from '@parkingpal/shared-types';

type EditListingRouteParams = {
  EditListing: {
    listingId: string;
  };
};

const EditListingScreen: React.FC = () => {
  const route = useRoute<RouteProp<EditListingRouteParams, 'EditListing'>>();
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { listingId } = route.params;

  const [listing, setListing] = useState<SpotDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [weeklyRate, setWeeklyRate] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [accessInstructions, setAccessInstructions] = useState('');
  const [spotLocation, setSpotLocation] = useState('');
  const [houseRules, setHouseRules] = useState('');
  const [instantBook, setInstantBook] = useState(false);

  // Load listing data
  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        const spot = await spotApi.getById(listingId);
        setListing(spot);

        // Populate form fields
        setTitle(spot.title || '');
        setDescription(spot.description || '');
        setHourlyRate(spot.hourlyRate?.toString() || '');
        setDailyRate(spot.dailyRate?.toString() || '');
        setWeeklyRate(spot.weeklyRate?.toString() || '');
        setMonthlyRate(spot.monthlyRate?.toString() || '');
        setAccessInstructions(spot.accessInstructions || '');
        setSpotLocation(spot.spotLocation || '');
        setHouseRules(spot.houseRules || '');
        setInstantBook(spot.instantBook || false);
      } catch (error: any) {
        console.error('Failed to load listing:', error);
        Alert.alert('Error', 'Failed to load listing details');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [listingId, navigation]);

  const handleSave = useCallback(async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }

    const parsedHourlyRate = parseFloat(hourlyRate);
    if (hourlyRate && (isNaN(parsedHourlyRate) || parsedHourlyRate < 0)) {
      Alert.alert('Validation Error', 'Hourly rate must be a valid positive number');
      return;
    }

    const parsedDailyRate = parseFloat(dailyRate);
    if (dailyRate && (isNaN(parsedDailyRate) || parsedDailyRate < 0)) {
      Alert.alert('Validation Error', 'Daily rate must be a valid positive number');
      return;
    }

    try {
      setSaving(true);

      const updateData: UpdateSpotRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        dailyRate: dailyRate ? parseFloat(dailyRate) : undefined,
        weeklyRate: weeklyRate ? parseFloat(weeklyRate) : undefined,
        monthlyRate: monthlyRate ? parseFloat(monthlyRate) : undefined,
        accessInstructions: accessInstructions.trim() || undefined,
        spotLocation: spotLocation.trim() || undefined,
        houseRules: houseRules.trim() || undefined,
        instantBook,
      };

      await spotApi.update(listingId, updateData);

      Alert.alert('Success', 'Listing updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to update listing:', error);
      Alert.alert('Error', error.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  }, [title, description, hourlyRate, dailyRate, weeklyRate, monthlyRate, accessInstructions, spotLocation, houseRules, instantBook, listingId, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading listing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="information-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={[styles.input, { borderColor: NEUTRAL_COLORS.lightGray }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Secure Covered Parking Downtown"
            placeholderTextColor={NEUTRAL_COLORS.gray}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor: NEUTRAL_COLORS.lightGray }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your parking spot..."
            placeholderTextColor={NEUTRAL_COLORS.gray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>

        {/* Pricing */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cash" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Pricing</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Hourly Rate (€)</Text>
              <TextInput
                style={[styles.input, { borderColor: NEUTRAL_COLORS.lightGray }]}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="5.00"
                placeholderTextColor={NEUTRAL_COLORS.gray}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Daily Rate (€)</Text>
              <TextInput
                style={[styles.input, { borderColor: NEUTRAL_COLORS.lightGray }]}
                value={dailyRate}
                onChangeText={setDailyRate}
                placeholder="30.00"
                placeholderTextColor={NEUTRAL_COLORS.gray}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Weekly Rate (€)</Text>
              <TextInput
                style={[styles.input, { borderColor: NEUTRAL_COLORS.lightGray }]}
                value={weeklyRate}
                onChangeText={setWeeklyRate}
                placeholder="180.00"
                placeholderTextColor={NEUTRAL_COLORS.gray}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Monthly Rate (€)</Text>
              <TextInput
                style={[styles.input, { borderColor: NEUTRAL_COLORS.lightGray }]}
                value={monthlyRate}
                onChangeText={setMonthlyRate}
                placeholder="600.00"
                placeholderTextColor={NEUTRAL_COLORS.gray}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </Card>

        {/* Access & Location */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="map-marker" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Access & Location</Text>
          </View>

          <Text style={styles.label}>Access Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor: NEUTRAL_COLORS.lightGray }]}
            value={accessInstructions}
            onChangeText={setAccessInstructions}
            placeholder="How to access the parking spot..."
            placeholderTextColor={NEUTRAL_COLORS.gray}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Spot Location Details</Text>
          <TextInput
            style={[styles.input, { borderColor: NEUTRAL_COLORS.lightGray }]}
            value={spotLocation}
            onChangeText={setSpotLocation}
            placeholder="e.g., First floor, space #12"
            placeholderTextColor={NEUTRAL_COLORS.gray}
          />
        </Card>

        {/* Rules & Policies */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="clipboard-list" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Rules & Policies</Text>
          </View>

          <Text style={styles.label}>House Rules</Text>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor: NEUTRAL_COLORS.lightGray }]}
            value={houseRules}
            onChangeText={setHouseRules}
            placeholder="Any specific rules for renters..."
            placeholderTextColor={NEUTRAL_COLORS.gray}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>Instant Book</Text>
              <Text style={styles.hint}>Allow renters to book without approval</Text>
            </View>
            <Switch
              value={instantBook}
              onValueChange={setInstantBook}
              trackColor={{ false: NEUTRAL_COLORS.lightGray, true: colors.light }}
              thumbColor={instantBook ? colors.primary : NEUTRAL_COLORS.gray}
            />
          </View>
        </Card>

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Icon name="information-outline" size={16} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.infoText}>
            To change location, amenities, or spot type, please contact support.
          </Text>
        </View>

        {/* Save Button */}
        <Button
          title={saving ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={saving}
          loading={saving}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  section: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.black,
  },
  textArea: {
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  switchLabel: {
    flex: 1,
  },
  hint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    marginBottom: SPACING.md,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
});

export default EditListingScreen;
