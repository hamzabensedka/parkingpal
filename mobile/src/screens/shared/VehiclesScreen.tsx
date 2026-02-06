import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { Card, Badge, EmptyState, Button } from '../../components/common';

const VehiclesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { user, removeVehicle, setDefaultVehicle } = useAuth();

  const vehicles = user?.vehicles || [];

  const getVehicleIcon = (type: Vehicle['type']) => {
    switch (type) {
      case 'car': return 'car';
      case 'motorcycle': return 'motorbike';
      case 'suv': return 'car-sports';
      case 'van': return 'van-utility';
      case 'truck': return 'truck';
      default: return 'car';
    }
  };

  const handleAddVehicle = useCallback(() => {
    navigation.navigate('AddVehicle');
  }, [navigation]);

  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
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
          onPress: () => removeVehicle(vehicleId),
        },
      ]
    );
  }, [removeVehicle]);

  const handleSetDefault = useCallback((vehicleId: string) => {
    setDefaultVehicle(vehicleId);
  }, [setDefaultVehicle]);

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <Card style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={[styles.vehicleIconContainer, { backgroundColor: colors.lightest }]}>
          <Icon name={getVehicleIcon(item.type)} size={32} color={colors.primary} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{item.make} {item.model}</Text>
          <Text style={styles.vehicleDetails}>{item.color} • {item.year}</Text>
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
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Icon name="star-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditVehicle(item)}
        >
          <Icon name="pencil" size={18} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteVehicle(item.id)}
        >
          <Icon name="trash-can-outline" size={18} color={NEUTRAL_COLORS.darkGray} />
          <Text style={[styles.actionText, { color: NEUTRAL_COLORS.darkGray }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
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
