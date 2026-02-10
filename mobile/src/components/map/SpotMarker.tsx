import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { NEUTRAL_COLORS } from '../../utils/constants';
import { Spot } from '../../types';

interface SpotMarkerProps {
  spot: Spot;
  isSelected: boolean;
  onPress: (spot: Spot) => void;
}

const MARKER_SIZE = 28;
const SELECTED_MARKER_SIZE = 34;

const SpotMarker: React.FC<SpotMarkerProps> = memo(({ spot, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(spot);
  }, [onPress, spot]);

  const size = isSelected ? SELECTED_MARKER_SIZE : MARKER_SIZE;

  return (
    <MapLibreGL.PointAnnotation
      id={`marker-${spot.id}`}
      coordinate={[spot.longitude, spot.latitude]}
      onSelected={handlePress}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View
          style={[
            styles.marker,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isSelected ? '#ff0a54' : NEUTRAL_COLORS.white,
              borderColor: isSelected ? '#ff0a54' : NEUTRAL_COLORS.darkGray,
            },
          ]}
        >
          <Text style={[styles.markerText, { color: isSelected ? NEUTRAL_COLORS.white : NEUTRAL_COLORS.black }]}>P</Text>
        </View>
      </TouchableOpacity>
    </MapLibreGL.PointAnnotation>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.spot.id === nextProps.spot.id &&
    prevProps.isSelected === nextProps.isSelected
  );
});

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SpotMarker;
