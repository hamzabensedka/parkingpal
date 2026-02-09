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
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SPOT_TYPES, VEHICLE_SIZES, AMENITIES } from '../../utils/constants';
import { HostStackParamList, SpotType, VehicleSize } from '../../types';
import { Button, Input, Card, Chip } from '../../components/common';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingDetails'>;

const AddListingDetailsScreen = ({ navigation, route }: Props) => {
  const { location, photos } = route.params;
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [spotType, setSpotType] = useState<SpotType | null>(null);
  const [vehicleSize, setVehicleSize] = useState<VehicleSize | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [numberOfSpots, setNumberOfSpots] = useState('1');

  const spotTypeOptions: { type: SpotType; label: string; icon: string }[] = [
    { type: 'driveway', label: 'Driveway', icon: 'home' },
    { type: 'garage', label: 'Garage', icon: 'garage' },
    { type: 'street', label: 'Street', icon: 'road' },
    { type: 'lot', label: 'Parking Lot', icon: 'parking' },
    { type: 'covered', label: 'Covered', icon: 'home-roof' },
    { type: 'underground', label: 'Underground', icon: 'arrow-down-bold-box' },
  ];

  const vehicleSizeOptions: { size: VehicleSize; label: string; description: string }[] = [
    { size: 'compact', label: 'Compact', description: 'Small cars' },
    { size: 'sedan', label: 'Sedan', description: 'Standard cars' },
    { size: 'suv', label: 'SUV', description: 'Large vehicles' },
    { size: 'van', label: 'Van/Truck', description: 'Extra large vehicles' },
  ];

  const amenityOptions = [
    { id: 'ev_charging', label: 'EV Charging', icon: 'ev-station' },
    { id: 'covered', label: 'Covered', icon: 'home-roof' },
    { id: 'security_camera', label: 'Security Camera', icon: 'cctv' },
    { id: 'gated', label: 'Gated', icon: 'gate' },
    { id: 'lighting', label: 'Well Lit', icon: 'lightbulb-on' },
    { id: 'accessible', label: 'Accessible', icon: 'wheelchair-accessibility' },
    { id: '24_7_access', label: '24/7 Access', icon: 'clock-outline' },
    { id: 'security_guard', label: 'Security Guard', icon: 'shield-account' },
  ];

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleContinue = () => {
    if (!title || !spotType || !vehicleSize) {
      return;
    }

    navigation.navigate('AddListingAccess', {
      location,
      photos,
      spotType,
      amenities: selectedAmenities as any,
      vehicleSizes: [vehicleSize],
      numberOfSpots: parseInt(numberOfSpots, 10),
    });
  };

  const isValid = title.length >= 5 && spotType && vehicleSize;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Title</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Secure Garage in City Center"
            maxLength={60}
          />
          <Text style={styles.charCount}>{title.length}/60</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Input
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your parking space..."
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Spot Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parking Type</Text>
          <View style={styles.optionsGrid}>
            {spotTypeOptions.map((option) => {
              const isSelected = spotType === option.type;
              return (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.optionCard,
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.lightest },
                  ]}
                  onPress={() => setSpotType(option.type)}
                >
                  <Icon
                    name={option.icon}
                    size={28}
                    color={isSelected ? colors.primary : NEUTRAL_COLORS.gray}
                  />
                  <Text style={[
                    styles.optionLabel,
                    isSelected && { color: colors.primary, fontWeight: '600' },
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Vehicle Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Vehicle Size</Text>
          <View style={styles.vehicleSizeList}>
            {vehicleSizeOptions.map((option) => {
              const isSelected = vehicleSize === option.size;
              return (
                <TouchableOpacity
                  key={option.size}
                  style={[
                    styles.vehicleSizeItem,
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.lightest },
                  ]}
                  onPress={() => setVehicleSize(option.size)}
                >
                  <View style={[
                    styles.radioOuter,
                    isSelected && { borderColor: colors.primary },
                  ]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <View style={styles.vehicleSizeInfo}>
                    <Text style={[
                      styles.vehicleSizeLabel,
                      isSelected && { color: colors.primary, fontWeight: '600' },
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={styles.vehicleSizeDesc}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Number of Spots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Parking Spots</Text>
          <View style={styles.numberPicker}>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setNumberOfSpots(prev => Math.max(1, parseInt(prev, 10) - 1).toString())}
              disabled={numberOfSpots === '1'}
            >
              <Icon name="minus" size={24} color={numberOfSpots === '1' ? NEUTRAL_COLORS.lightGray : colors.primary} />
            </TouchableOpacity>
            <Text style={styles.numberValue}>{numberOfSpots}</Text>
            <TouchableOpacity
              style={styles.numberButton}
              onPress={() => setNumberOfSpots(prev => Math.min(10, parseInt(prev, 10) + 1).toString())}
              disabled={numberOfSpots === '10'}
            >
              <Icon name="plus" size={24} color={numberOfSpots === '10' ? NEUTRAL_COLORS.lightGray : colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.amenitiesGrid}>
            {amenityOptions.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <TouchableOpacity
                  key={amenity.id}
                  style={[
                    styles.amenityItem,
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.lightest },
                  ]}
                  onPress={() => toggleAmenity(amenity.id)}
                >
                  <Icon
                    name={amenity.icon}
                    size={20}
                    color={isSelected ? colors.primary : NEUTRAL_COLORS.gray}
                  />
                  <Text style={[
                    styles.amenityLabel,
                    isSelected && { color: colors.primary, fontWeight: '600' },
                  ]}>
                    {amenity.label}
                  </Text>
                  {isSelected && (
                    <Icon name="check-circle" size={16} color={colors.primary} style={styles.amenityCheck} />
                  )}
                </TouchableOpacity>
              );
            })}
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionCard: {
    width: '31%',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  optionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  vehicleSizeList: {
    gap: SPACING.sm,
  },
  vehicleSizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  vehicleSizeInfo: {
    flex: 1,
  },
  vehicleSizeLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
  },
  vehicleSizeDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  numberPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  numberButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NEUTRAL_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  numberValue: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    minWidth: 48,
    textAlign: 'center',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.background,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    gap: SPACING.xs,
  },
  amenityLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  amenityCheck: {
    marginLeft: 2,
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

export default AddListingDetailsScreen;
