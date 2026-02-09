import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, MAP_DEFAULTS, MAPLIBRE_STYLE, API_BASE_URL } from '../../utils/constants';
import { SpotMarker } from '../../components/map';
import { Spot } from '../../types';
import { calculateDistance } from '../../utils/helpers';
import { formatPrice, formatDistance2, formatRating } from '../../utils/formatting';
import { Card, Badge } from '../../components/common';
import { spotApi } from '../../services/api';
import { mapSpotSummaryToSpot } from '../../utils/spotMappers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 140;

const MapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const cameraRef = useRef<MapLibreGL.CameraRef>(null);
  const flatListRef = useRef<FlatList>(null);

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate distances for display in the cards
  const spotsWithDistance = useMemo(() => {
    if (!userLocation) return spots;
    return spots.map((spot) => ({
      ...spot,
      distance: calculateDistance(userLocation.latitude, userLocation.longitude, spot.latitude, spot.longitude),
    }));
  }, [userLocation, spots]);

  // Sort spots so selected marker renders last (on top) for z-index layering
  const sortedSpots = useMemo(() => {
    if (!selectedSpotId) return spotsWithDistance;
    const selected = spotsWithDistance.find((s) => s.id === selectedSpotId);
    const others = spotsWithDistance.filter((s) => s.id !== selectedSpotId);
    return selected ? [...others, selected] : spotsWithDistance;
  }, [spotsWithDistance, selectedSpotId]);

  // Fetch spots near user location
  const fetchSpots = useCallback(async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await spotApi.search({
        latitude,
        longitude,
        radius: 10, // 10km radius
      });

      const mappedSpots = result.spots.map(mapSpotSummaryToSpot);
      setSpots(mappedSpots);
    } catch (err) {
      console.error('Failed to fetch spots:', err);
      setError(`Failed to load parking spots. API: ${API_BASE_URL}`);
      setSpots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user location and fetch spots
  useEffect(() => {
    let isMounted = true;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !isMounted) {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (!isMounted) return;

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(userCoords);

      // Fetch spots near user location
      await fetchSpots(userCoords.latitude, userCoords.longitude);

      // Animate to user location
      if (isMounted) {
        cameraRef.current?.setCamera({
          centerCoordinate: [userCoords.longitude, userCoords.latitude],
          zoomLevel: 13,
          animationDuration: 500,
        });
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchSpots]);

  const handleMarkerPress = useCallback((spot: Spot) => {
    setSelectedSpotId(spot.id);

    // Find index and scroll to it
    const index = spots.findIndex((s) => s.id === spot.id);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }

    // Center map on spot
    cameraRef.current?.setCamera({
      centerCoordinate: [spot.longitude, spot.latitude],
      zoomLevel: 15,
      animationDuration: 300,
    });
  }, [spots]);

  const handleSpotCardPress = useCallback((spot: Spot) => {
    navigation.navigate('SpotDetail', { spotId: spot.id });
  }, [navigation]);

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleFiltersPress = () => {
    navigation.navigate('Filters');
  };

  const handleMyLocationPress = () => {
    if (userLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 14,
        animationDuration: 300,
      });
    }
  };

  const renderSpotCard = useCallback(({ item }: { item: Spot }) => {
    const isSelected = selectedSpotId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleSpotCardPress(item)}
        style={styles.cardWrapper}
      >
        <Card
          style={[
            styles.spotCard,
            isSelected && { borderColor: colors.primary, borderWidth: 2 },
          ]}
          elevation="medium"
        >
          <View style={styles.cardContent}>
            {/* Spot Image */}
            <View style={styles.cardImageContainer}>
              {item.photos[0] && (
                <View style={[styles.cardImage, { backgroundColor: NEUTRAL_COLORS.lightGray }]}>
                  <Icon name="image" size={24} color={NEUTRAL_COLORS.gray} />
                </View>
              )}
              {item.instantBook && (
                <View style={styles.instantBookBadge}>
                  <Icon name="flash" size={12} color={NEUTRAL_COLORS.white} />
                </View>
              )}
            </View>

            {/* Spot Info */}
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.rating >= 4.8 && (
                  <Badge text="Top Rated" variant="success" size="small" />
                )}
              </View>

              <View style={styles.cardDetails}>
                {item.distance && (
                  <View style={styles.detailRow}>
                    <Icon name="map-marker-distance" size={14} color={NEUTRAL_COLORS.gray} />
                    <Text style={styles.detailText}>{formatDistance2(item.distance)}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Icon name="star" size={14} color={NEUTRAL_COLORS.darkGray} />
                  <Text style={styles.detailText}>
                    {formatRating(item.rating, item.reviewCount)}
                  </Text>
                </View>
              </View>

              <View style={styles.amenitiesRow}>
                {item.amenities.slice(0, 3).map((amenity) => (
                  <View key={amenity} style={styles.amenityIcon}>
                    <Icon
                      name={getAmenityIcon(amenity)}
                      size={12}
                      color={NEUTRAL_COLORS.darkGray}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <Text style={[styles.cardPrice, { color: colors.primary }]}>
                  {formatPrice(item.hourlyRate)}
                </Text>
                <TouchableOpacity
                  style={[styles.bookButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleSpotCardPress(item)}
                >
                  <Text style={styles.bookButtonText}>View</Text>
                  <Icon name="chevron-right" size={16} color={NEUTRAL_COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }, [selectedSpotId, colors, handleSpotCardPress]);

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={MAPLIBRE_STYLE}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: MAP_DEFAULTS.center,
            zoomLevel: MAP_DEFAULTS.zoomLevel,
          }}
          minZoomLevel={MAP_DEFAULTS.minZoomLevel}
          maxZoomLevel={MAP_DEFAULTS.maxZoomLevel}
        />
        <MapLibreGL.UserLocation visible />
        {sortedSpots.map((spot) => (
          <SpotMarker
            key={spot.id}
            spot={spot}
            isSelected={selectedSpotId === spot.id}
            onPress={handleMarkerPress}
          />
        ))}
      </MapLibreGL.MapView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={handleSearchPress}
          activeOpacity={0.9}
        >
          <Icon name="magnify" size={24} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.searchPlaceholder}>Where do you need parking?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleFiltersPress}
        >
          <Icon name="tune-vertical" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleMyLocationPress}
      >
        <Icon name="crosshairs-gps" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Spots Count */}
      {!loading && (
        <View style={styles.spotsCountContainer}>
          <Text style={styles.spotsCount}>
            {spots.length} spot{spots.length !== 1 ? 's' : ''} available
          </Text>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading spots...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={24} color={NEUTRAL_COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => userLocation && fetchSpots(userLocation.latitude, userLocation.longitude)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* OSM Attribution */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>&copy; OpenStreetMap contributors</Text>
      </View>

      {/* Bottom Spot Cards */}
      {!loading && spots.length > 0 && (
        <View style={styles.bottomContainer}>
          <FlatList
            ref={flatListRef}
            data={spotsWithDistance}
            renderItem={renderSpotCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsList}
            snapToInterval={CARD_WIDTH + SPACING.md}
            decelerationRate="fast"
            onScrollToIndexFailed={() => {}}
          />
        </View>
      )}
    </View>
  );
};

const getAmenityIcon = (amenity: string): string => {
  const icons: Record<string, string> = {
    covered: 'shield-home-outline',
    lit: 'lightbulb-on-outline',
    camera: 'cctv',
    ev_charging: 'ev-station',
    gated: 'gate',
    handicap: 'wheelchair-accessibility',
  };
  return icons[amenity] || 'check-circle';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    ...SHADOWS.medium,
  },
  searchPlaceholder: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  myLocationButton: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SCREEN_HEIGHT * 0.28,
    width: 48,
    height: 48,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  spotsCountContainer: {
    position: 'absolute',
    left: SPACING.md,
    bottom: SCREEN_HEIGHT * 0.28,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.small,
  },
  spotsCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  attribution: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25 + 4,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: NEUTRAL_COLORS.darkGray,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: SPACING.lg,
  },
  cardsList: {
    paddingHorizontal: SPACING.lg,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginRight: SPACING.md,
  },
  spotCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    height: CARD_HEIGHT,
  },
  cardImageContainer: {
    width: 100,
    height: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantBookBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: NEUTRAL_COLORS.success,
    borderRadius: RADIUS.xs,
    padding: 4,
  },
  cardInfo: {
    flex: 1,
    padding: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginRight: SPACING.sm,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.darkGray,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  amenityIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  cardPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  bookButtonText: {
    color: NEUTRAL_COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    marginRight: 2,
  },
  loadingContainer: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  errorContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    maxWidth: '80%',
    ...SHADOWS.large,
  },
  errorText: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: NEUTRAL_COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
});

export default MapScreen;
