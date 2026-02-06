import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Vehicle } from '../../types';
import { Button, Input, Card } from '../../components/common';

type VehicleType = Vehicle['type'];

const VEHICLE_TYPES: { type: VehicleType; label: string; icon: string }[] = [
  { type: 'car', label: 'Car', icon: 'car' },
  { type: 'motorcycle', label: 'Motorcycle', icon: 'motorbike' },
  { type: 'suv', label: 'SUV', icon: 'car-sports' },
  { type: 'van', label: 'Van', icon: 'van-utility' },
  { type: 'truck', label: 'Truck', icon: 'truck' },
];

const AddVehicleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { addVehicle } = useAuth();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValid = make.trim() && model.trim() && year.trim() && licensePlate.trim();

  const handleSave = useCallback(async () => {
    if (!isValid) {
      Alert.alert('Required Fields', 'Please fill in all required fields.');
      return;
    }

    if (year.length !== 4 || parseInt(year, 10) < 1950 || parseInt(year, 10) > new Date().getFullYear() + 1) {
      Alert.alert('Invalid Year', 'Please enter a valid year.');
      return;
    }

    setIsLoading(true);

    try {
      await addVehicle({
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year, 10),
        color: color.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        type: vehicleType,
        isDefault,
      });

      Alert.alert('Vehicle Added', 'Your vehicle has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add vehicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [make, model, year, color, licensePlate, vehicleType, isDefault, addVehicle, navigation, isValid]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Vehicle Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <View style={styles.typeGrid}>
            {VEHICLE_TYPES.map((type) => {
              const isSelected = vehicleType === type.type;
              return (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.typeItem,
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.lightest },
                  ]}
                  onPress={() => setVehicleType(type.type)}
                >
                  <Icon
                    name={type.icon}
                    size={28}
                    color={isSelected ? colors.primary : NEUTRAL_COLORS.gray}
                  />
                  <Text style={[
                    styles.typeLabel,
                    isSelected && { color: colors.primary, fontWeight: '600' },
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Vehicle Details Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>

          <Input
            label="Make *"
            value={make}
            onChangeText={setMake}
            placeholder="e.g., Renault, Peugeot, BMW"
            leftIcon="car"
          />

          <Input
            label="Model *"
            value={model}
            onChangeText={setModel}
            placeholder="e.g., Clio, 208, 3 Series"
          />

          <View style={styles.row}>
            <Input
              label="Year *"
              value={year}
              onChangeText={setYear}
              placeholder="e.g., 2022"
              keyboardType="number-pad"
              maxLength={4}
              containerStyle={styles.halfInput}
            />
            <Input
              label="Color"
              value={color}
              onChangeText={setColor}
              placeholder="e.g., Blue"
              containerStyle={styles.halfInput}
            />
          </View>

          <Input
            label="License Plate *"
            value={licensePlate}
            onChangeText={(text) => setLicensePlate(text.toUpperCase())}
            placeholder="e.g., AB-123-CD"
            autoCapitalize="characters"
            leftIcon="card-text"
          />
        </View>

        {/* Default Toggle */}
        <Card style={styles.defaultCard}>
          <TouchableOpacity
            style={styles.defaultRow}
            onPress={() => setIsDefault(!isDefault)}
          >
            <View style={[styles.defaultIcon, { backgroundColor: colors.lightest }]}>
              <Icon name="star" size={20} color={colors.primary} />
            </View>
            <View style={styles.defaultContent}>
              <Text style={styles.defaultLabel}>Set as Default Vehicle</Text>
              <Text style={styles.defaultDesc}>
                This vehicle will be pre-selected when booking
              </Text>
            </View>
            <View style={[
              styles.toggleSwitch,
              isDefault && { backgroundColor: colors.primary },
            ]}>
              <View style={[
                styles.toggleKnob,
                isDefault && styles.toggleKnobActive,
              ]} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.lightest }]}>
          <Icon name="information" size={20} color={colors.primary} />
          <Text style={styles.tipsText}>
            Make sure your license plate is entered correctly. Hosts may verify your vehicle identity upon arrival.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title="Save Vehicle"
          onPress={handleSave}
          loading={isLoading}
          disabled={!isValid}
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
  section: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  typeItem: {
    width: '18%',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  halfInput: {
    flex: 1,
  },
  defaultCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: 0,
    overflow: 'hidden',
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  defaultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  defaultContent: {
    flex: 1,
  },
  defaultLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  defaultDesc: {
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
  tipsCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  tipsText: {
    flex: 1,
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
});

export default AddVehicleScreen;
