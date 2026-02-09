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

const MARKER_SIZE = 20;
const SELECTED_MARKER_SIZE = 24;

const SpotMarker: React.FC<SpotMarkerProps> = memo(({ spot, isSelected, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(spot);
  }, [onPress, spot]);

  const size = isSelected ? SELECTED_MARKER_SIZE : MARKER_SIZE;

  return (
    <MapLibreGL.MarkerView
      id={`marker-${spot.id}`}
      coordinate={[spot.longitude, spot.latitude]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View
          style={[
            styles.marker,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isSelected ? '#ff0a54' : NEUTRAL_COLORS.black,
            },
          ]}
        >
          <Text style={styles.markerText}>P</Text>
        </View>
      </TouchableOpacity>
    </MapLibreGL.MarkerView>
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
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.white,
  },
  markerText: {
    color: NEUTRAL_COLORS.white,
    fontSize: 10,
    fontWeight: '500',
  },
});

export default SpotMarker;
