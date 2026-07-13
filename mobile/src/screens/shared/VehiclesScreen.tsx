import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import type { VehicleDTO } from '@parkingpal/shared-types';
import { Card, Badge, EmptyState, Button, AnimatedPressable } from '../../components/common';

const VehiclesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { vehicles, deleteVehicle, setDefaultVehicle } = useAuth();

  const getVehicleIcon = (type: VehicleDTO['type']) => {
    switch (type) {
      case 'sedan': return 'car';
      case 'motorcycle': return 'motorbike';
      case 'suv': return 'car-sports';
      case 'van': return 'van-utility';
      case 'compact': return 'car';
      default: return 'car';
    }
  };

  const handleAddVehicle = useCallback(() => {
    navigation.navigate('AddVehicle');
  }, [navigation]);

  const handleEditVehicle = useCallback((vehicle: VehicleDTO) => {
    navigation.navigate('AddVehicle', { vehicleId: vehicle.id });
  }, [navigation]);

  const handleDeleteVehicle = useCallback((vehicleId: string) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to remove this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteVehicle(vehicleId),
        },
      ]
    );
  }, [deleteVehicle]);

  const handleSetDefault = useCallback((vehicleId: string) => {
    setDefaultVehicle(vehicleId);
  }, [setDefaultVehicle]);

  const renderVehicle = ({ item, index }: { item: VehicleDTO; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(500).springify()}>
    <Card style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={[styles.vehicleIconContainer, { backgroundColor: colors.lightest }]}>
          <Icon name={getVehicleIcon(item.type)} size={32} color={colors.primary} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{item.make} {item.model}</Text>
          <Text style={styles.vehicleDetails}>{item.color}{item.year ? ` • ${item.year}` : ''}</Text>
          <View style={styles.plateRow}>
            <Icon name="card-text" size={14} color={NEUTRAL_COLORS.gray} />
            <Text style={styles.plateText}>{item.licensePlate}</Text>
          </View>
        </View>
        {item.isDefault && (
          <Badge text="Default" variant="success" size="small" />
        )}
      </View>

      <View style={styles.vehicleActions}>
        {!item.isDefault && (
          <AnimatedPressable
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
            haptic
          >
            <Icon name="star-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Set Default</Text>
          </AnimatedPressable>
        )}
        <AnimatedPressable
          style={styles.actionButton}
          onPress={() => handleEditVehicle(item)}
          haptic
        >
          <Icon name="pencil" size={18} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.actionText}>Edit</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={styles.actionButton}
          onPress={() => handleDeleteVehicle(item.id)}
          haptic
        >
          <Icon name="trash-can-outline" size={18} color={NEUTRAL_COLORS.darkGray} />
          <Text style={[styles.actionText, { color: NEUTRAL_COLORS.darkGray }]}>Delete</Text>
        </AnimatedPressable>
      </View>
    </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="car-off"
            title="No vehicles added"
            description="Add your vehicles to speed up the booking process."
            actionLabel="Add Vehicle"
            onAction={handleAddVehicle}
          />
        }
        ListFooterComponent={
          vehicles.length > 0 ? (
            <Button
              title="Add New Vehicle"
              onPress={handleAddVehicle}
              variant="outline"
              icon="plus"
              fullWidth
              style={styles.addButton}
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  vehicleCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  },
  vehicleDetails: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  plateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
    letterSpacing: 0.5,
  },
  vehicleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
    gap: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: NEUTRAL_COLORS.gray,
  },
  addButton: {
    marginTop: SPACING.sm,
  },
});

export default VehiclesScreen;
