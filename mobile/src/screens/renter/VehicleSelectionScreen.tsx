import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { RenterStackParamList, Vehicle } from '../../types';
import { Button, Card, EmptyState } from '../../components/common';

type Props = NativeStackScreenProps<RenterStackParamList, 'VehicleSelection'>;

const VehicleSelectionScreen = ({ navigation, route }: Props) => {
  const { spotId, spotTitle, hourlyRate, startTime, endTime, duration, total } = route.params;
  const { colors } = useTheme();
  const { vehicles } = useAuth();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(
    vehicles?.[0] || null
  );

  useEffect(() => {
    if (vehicles.length > 0 && (!selectedVehicle || !vehicles.find((v) => v.id === selectedVehicle.id))) {
      setSelectedVehicle(vehicles[0]);
    }
  }, [vehicles]);

  const getVehicleIcon = (type: Vehicle['type']) => {
    switch (type) {
      case 'car':
        return 'car';
      case 'motorcycle':
        return 'motorbike';
      case 'suv':
        return 'car-sports';
      case 'van':
        return 'van-utility';
      case 'truck':
        return 'truck';
      default:
        return 'car';
    }
  };

  const handleAddVehicle = () => {
    navigation.navigate('AddVehicle' as any);
  };

  const handleContinue = () => {
    if (selectedVehicle) {
      navigation.navigate('PaymentReview', {
        spotId,
        spotTitle,
        hourlyRate,
        startTime,
        endTime,
        duration,
        total,
        vehicleId: selectedVehicle.id,
        vehicleName: `${selectedVehicle.make} ${selectedVehicle.model}`,
        vehiclePlate: selectedVehicle.licensePlate,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Icon name="information" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Select the vehicle you'll be parking. Make sure the license plate matches your vehicle for access.
          </Text>
        </Card>

        {/* Vehicles List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Vehicles</Text>
            <TouchableOpacity onPress={handleAddVehicle}>
              <Text style={[styles.addLink, { color: colors.primary }]}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {vehicles.length === 0 ? (
            <EmptyState
              icon="car-off"
              title="No vehicles added"
              description="Add a vehicle to continue with your booking"
              actionLabel="Add Vehicle"
              onAction={handleAddVehicle}
            />
          ) : (
            <View style={styles.vehiclesList}>
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicle?.id === vehicle.id;

                return (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={[
                      styles.vehicleCard,
                      isSelected && { borderColor: colors.primary, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedVehicle(vehicle)}
                  >
                    <View style={styles.vehicleIconContainer}>
                      <Icon
                        name={getVehicleIcon(vehicle.type)}
                        size={32}
                        color={isSelected ? colors.primary : NEUTRAL_COLORS.gray}
                      />
                    </View>

                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleName}>
                        {vehicle.make} {vehicle.model}
                      </Text>
                      <Text style={styles.vehicleDetails}>
                        {vehicle.color} • {vehicle.year}
                      </Text>
                      <View style={styles.plateContainer}>
                        <Icon name="card-text" size={14} color={NEUTRAL_COLORS.gray} />
                        <Text style={styles.plateText}>{vehicle.licensePlate}</Text>
                      </View>
                    </View>

                    <View style={styles.checkContainer}>
                      {isSelected ? (
                        <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                          <Icon name="check" size={16} color={NEUTRAL_COLORS.white} />
                        </View>
                      ) : (
                        <View style={styles.uncheckCircle} />
                      )}
                    </View>

                    {vehicle.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.lightest }]}>
                        <Text style={[styles.defaultText, { color: colors.primary }]}>Default</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Booking Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Spot</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>{spotTitle}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{duration} hour{duration > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate</Text>
            <Text style={styles.summaryValue}>€{hourlyRate}/hour</Text>
          </View>
          {selectedVehicle && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vehicle</Text>
              <Text style={styles.summaryValue}>
                {selectedVehicle.make} {selectedVehicle.model}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>€{total.toFixed(2)}</Text>
          </View>
        </Card>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title="Continue to Payment"
          onPress={handleContinue}
          disabled={!selectedVehicle}
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
  infoCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  addLink: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  vehiclesList: {
    gap: SPACING.md,
  },
  vehicleCard: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    position: 'relative',
  },
  vehicleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: NEUTRAL_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 4,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
  },
  checkContainer: {
    marginLeft: SPACING.sm,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  defaultBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  defaultText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
  },
  summaryCard: {
    margin: SPACING.md,
    padding: SPACING.md,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
});

export default VehicleSelectionScreen;
