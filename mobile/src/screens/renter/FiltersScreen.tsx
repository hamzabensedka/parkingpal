import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SPOT_TYPES, AMENITIES, VEHICLE_TYPES } from '../../utils/constants';
import { Button, Chip, AnimatedPressable } from '../../components/common';

const FiltersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();

  const [priceRange, setPriceRange] = useState({ min: 2, max: 15 });
  const [selectedSpotTypes, setSelectedSpotTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedVehicleSize, setSelectedVehicleSize] = useState<string | null>(null);
  const [instantBookOnly, setInstantBookOnly] = useState(false);
  const [superhostOnly, setSuperhostOnly] = useState(false);

  const toggleSpotType = (id: string) => {
    setSelectedSpotTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    navigation.navigate('SearchResults', {
      filters: {
        priceRange,
        spotTypes: selectedSpotTypes,
        amenities: selectedAmenities,
        vehicleSize: selectedVehicleSize,
        instantBookOnly,
        superhostOnly,
      },
    });
  };

  const handleReset = () => {
    setPriceRange({ min: 2, max: 15 });
    setSelectedSpotTypes([]);
    setSelectedAmenities([]);
    setSelectedVehicleSize(null);
    setInstantBookOnly(false);
    setSuperhostOnly(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceRange}>
            <Text style={styles.priceText}>€{priceRange.min}/h</Text>
            <Text style={styles.priceText}>€{priceRange.max}/h</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={2}
            maximumValue={15}
            step={1}
            value={priceRange.max}
            onValueChange={(value) => setPriceRange({ ...priceRange, max: value })}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={NEUTRAL_COLORS.lightGray}
            thumbTintColor={colors.primary}
          />
        </View>

        {/* Spot Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spot Type</Text>
          <View style={styles.chipsContainer}>
            {SPOT_TYPES.map((type) => (
              <Chip
                key={type.id}
                label={type.label}
                icon={type.icon}
                selected={selectedSpotTypes.includes(type.id)}
                onPress={() => toggleSpotType(type.id)}
              />
            ))}
          </View>
        </View>

        {/* Vehicle Size */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Size</Text>
          <View style={styles.chipsContainer}>
            {VEHICLE_TYPES.map((type) => (
              <Chip
                key={type.id}
                label={type.label}
                icon={type.icon}
                selected={selectedVehicleSize === type.id}
                onPress={() => setSelectedVehicleSize(
                  selectedVehicleSize === type.id ? null : type.id
                )}
              />
            ))}
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.chipsContainer}>
            {AMENITIES.map((amenity) => (
              <Chip
                key={amenity.id}
                label={amenity.label}
                icon={amenity.icon}
                selected={selectedAmenities.includes(amenity.id)}
                onPress={() => toggleAmenity(amenity.id)}
              />
            ))}
          </View>
        </View>

        {/* Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Options</Text>
          <AnimatedPressable
            style={styles.toggleRow}
            onPress={() => setInstantBookOnly(!instantBookOnly)}
            haptic
          >
            <View style={styles.toggleInfo}>
              <Icon name="flash" size={24} color={colors.primary} />
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Instant Book Only</Text>
                <Text style={styles.toggleDescription}>
                  Spots you can book without waiting for approval
                </Text>
              </View>
            </View>
            <Icon
              name={instantBookOnly ? 'toggle-switch' : 'toggle-switch-off'}
              size={40}
              color={instantBookOnly ? colors.primary : NEUTRAL_COLORS.gray}
            />
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.toggleRow}
            onPress={() => setSuperhostOnly(!superhostOnly)}
            haptic
          >
            <View style={styles.toggleInfo}>
              <Icon name="star-circle" size={24} color={colors.primary} />
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Superhosts Only</Text>
                <Text style={styles.toggleDescription}>
                  Top-rated hosts with excellent reviews
                </Text>
              </View>
            </View>
            <Icon
              name={superhostOnly ? 'toggle-switch' : 'toggle-switch-off'}
              size={40}
              color={superhostOnly ? colors.primary : NEUTRAL_COLORS.gray}
            />
          </AnimatedPressable>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <AnimatedPressable onPress={handleReset} haptic>
          <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
        </AnimatedPressable>
        <Button
          title="Show Results"
          onPress={handleApply}
          style={styles.applyButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  priceText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  toggleTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
  },
  toggleDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
  resetText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  applyButton: {
    minWidth: 150,
  },
});

export default FiltersScreen;
