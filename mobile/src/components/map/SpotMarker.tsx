import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from '../../contexts/ThemeContext';
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
  const { colors } = useTheme();

  // Start true for initial render, then disable for performance
  const isFirstRender = useRef(true);
  const wasSelected = useRef(isSelected);
  const [tracksChanges, setTracksChanges] = useState(true);

  useEffect(() => {
    // After initial render, disable tracking
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const timer = setTimeout(() => {
        setTracksChanges(false);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Re-enable tracking during selection changes
    if (wasSelected.current !== isSelected) {
      setTracksChanges(true);
      wasSelected.current = isSelected;

      const timer = setTimeout(() => {
        setTracksChanges(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  const handlePress = useCallback(() => {
    onPress(spot);
  }, [onPress, spot]);

  const size = isSelected ? SELECTED_MARKER_SIZE : MARKER_SIZE;

  return (
    <Marker
      identifier={spot.id}
      coordinate={{
        latitude: spot.latitude,
        longitude: spot.longitude,
      }}
      onPress={handlePress}
      tracksViewChanges={tracksChanges}
      zIndex={isSelected ? 1000 : 1}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={[
          styles.marker,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isSelected ? colors.primary : NEUTRAL_COLORS.black,
          },
        ]}
      >
        <Text style={styles.markerText}>P</Text>
      </View>
    </Marker>
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
