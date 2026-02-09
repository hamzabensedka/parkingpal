import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, MAPLIBRE_STYLE } from '../../utils/constants';
import { HostStackParamList } from '../../types';
import { Button, Input, Card } from '../../components/common';
import { geocode, reverseGeocode } from '../../services/osmService';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingLocation'>;

const INITIAL_CENTER: [number, number] = [2.3522, 48.8566]; // [lng, lat] Paris
const INITIAL_ZOOM = 13;

const AddListingLocationScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();
  const cameraRef = useRef<MapLibreGL.CameraRef>(null);

  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [addressDetails, setAddressDetails] = useState<{
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }>({
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [isGeocoding, setIsGeocoding] = useState(false);

  const updateAddressFromCoordinates = useCallback(async (latitude: number, longitude: number) => {
    setIsGeocoding(true);
    const result = await reverseGeocode({ latitude, longitude });
    setIsGeocoding(false);

    if (result) {
      setAddressDetails({
        street: result.street,
        city: result.city,
        postalCode: result.postalCode,
        country: result.country,
      });
      setAddress(result.displayName);
    } else {
      setAddressDetails({
        street: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        city: '',
        postalCode: '',
        country: 'France',
      });
      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  }, []);

  const handleMapPress = useCallback(async (event: any) => {
    const coordinates = event.geometry?.coordinates;
    if (!coordinates) return;
    const [longitude, latitude] = coordinates;
    setSelectedLocation({ latitude, longitude });
    await updateAddressFromCoordinates(latitude, longitude);
  }, [updateAddressFromCoordinates]);

  const handleMarkerDragEnd = useCallback(async (e: any) => {
    const coordinates = e.geometry?.coordinates;
    if (!coordinates) return;
    const [longitude, latitude] = coordinates;
    setSelectedLocation({ latitude, longitude });
    await updateAddressFromCoordinates(latitude, longitude);
  }, [updateAddressFromCoordinates]);

  const handleSearchAddress = useCallback(async () => {
    if (address.length < 3) return;

    setIsGeocoding(true);
    const result = await geocode(address);
    setIsGeocoding(false);

    if (result) {
      setSelectedLocation(result);
      cameraRef.current?.setCamera({
        centerCoordinate: [result.longitude, result.latitude],
        zoomLevel: 16,
        animationDuration: 500,
      });
      await updateAddressFromCoordinates(result.latitude, result.longitude);
    } else {
      Alert.alert('Not Found', 'Could not find this address. Please try a different search.');
    }
  }, [address, updateAddressFromCoordinates]);

  const handleCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(coords);
      cameraRef.current?.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: 16,
        animationDuration: 500,
      });
      await updateAddressFromCoordinates(coords.latitude, coords.longitude);
    } catch {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    }
  }, [updateAddressFromCoordinates]);

  const handleContinue = () => {
    if (!selectedLocation) {
      Alert.alert('Select Location', 'Please select a location on the map or enter an address.');
      return;
    }

    navigation.navigate('AddListingPhotos', {
      address: address,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          value={address}
          onChangeText={setAddress}
          placeholder="Enter parking spot address"
          leftIcon="magnify"
          containerStyle={styles.searchInput}
          onSubmitEditing={handleSearchAddress}
        />
        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: colors.primary }]}
          onPress={handleCurrentLocation}
        >
          <Icon name="crosshairs-gps" size={24} color={NEUTRAL_COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapLibreGL.MapView
          style={styles.map}
          mapStyle={MAPLIBRE_STYLE}
          onPress={handleMapPress}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <MapLibreGL.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: INITIAL_CENTER,
              zoomLevel: INITIAL_ZOOM,
            }}
          />
          <MapLibreGL.UserLocation visible />
          {selectedLocation && (
            <MapLibreGL.PointAnnotation
              id="selected-location"
              coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <View style={[styles.markerContainer, { backgroundColor: colors.primary }]}>
                <Icon name="parking" size={20} color={NEUTRAL_COLORS.white} />
              </View>
            </MapLibreGL.PointAnnotation>
          )}
        </MapLibreGL.MapView>

        {/* Map Instructions */}
        <View style={styles.mapInstructions}>
          <Icon name="information" size={16} color={colors.primary} />
          <Text style={styles.instructionsText}>
            Tap on the map to select your parking spot location
          </Text>
        </View>

        {/* OSM Attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>&copy; OpenStreetMap contributors</Text>
        </View>
      </View>

      {/* Selected Location Details */}
      {selectedLocation && (
        <Card style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Icon name="map-marker" size={24} color={colors.primary} />
            <Text style={styles.locationTitle}>
              {isGeocoding ? 'Loading address...' : 'Selected Location'}
            </Text>
          </View>
          <Text style={styles.locationAddress}>{address || 'Selected location'}</Text>
          <View style={styles.coordinatesRow}>
            <Text style={styles.coordinatesText}>
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        </Card>
      )}

      {/* Continue Button */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, { backgroundColor: colors.primary }]}>
            <Text style={styles.progressNumber}>1</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.progressNumber}>2</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.progressNumber}>3</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <Text style={styles.progressNumber}>4</Text>
          </View>
        </View>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedLocation}
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
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  locationButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapInstructions: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  attribution: {
    position: 'absolute',
    bottom: SPACING.sm,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: NEUTRAL_COLORS.darkGray,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  locationCard: {
    margin: SPACING.md,
    padding: SPACING.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  locationTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  locationAddress: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
});

export default AddListingLocationScreen;
