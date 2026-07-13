import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  NEUTRAL_COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  MAP_DEFAULTS,
  MAPLIBRE_STYLE,
} from '../../utils/constants';
import { Spot } from '../../types';
import { calculateDistance } from '../../utils/helpers';
import { formatPrice, formatDistance2, formatRating } from '../../utils/formatting';
import { Card, Badge, AnimatedPressable } from '../../components/common';
import { spotApi } from '../../services/api';
import { mapSpotSummaryToSpot } from '../../utils/spotMappers';

const TAB_BAR_HEIGHT = 60;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16 px margin each side
const CARD_HEIGHT = 140;

// ─── Conditional MapLibre loading ─────────────────────────────────────────────
// MapLibre requires a native dev build — not available in Expo Go.
const isExpoGo = Constants.appOwnership === 'expo';

let MLMapView: any = null;
let MLCamera: any = null;
let MLShapeSource: any = null;
let MLSymbolLayer: any = null;
let MLCircleLayer: any = null;
let MLUserLocation: any = null;

if (!isExpoGo) {
  const ML = require('@maplibre/maplibre-react-native');
  MLMapView = ML.MapView;
  MLCamera = ML.Camera;
  MLShapeSource = ML.ShapeSource;
  MLSymbolLayer = ML.SymbolLayer;
  MLCircleLayer = ML.CircleLayer;
  MLUserLocation = ML.UserLocation;
}

// ─── GeoJSON helpers ──────────────────────────────────────────────────────────
function spotsToGeoJSON(spots: Spot[], selectedId: string | null) {
  return {
    type: 'FeatureCollection',
    features: spots.map((spot) => ({
      type: 'Feature',
      id: spot.id,
      geometry: {
        type: 'Point',
        coordinates: [spot.longitude, spot.latitude],
      },
      properties: {
        spotId: spot.id,
        price: spot.hourlyRate,
        selected: spot.id === selectedId,
      },
    })),
  };
}

// ─── Amenity icon helper ───────────────────────────────────────────────────────
function getAmenityIcon(amenity: string): string {
  const icons: Record<string, string> = {
    covered: 'shield-home-outline',
    lit: 'lightbulb-on-outline',
    camera: 'cctv',
    ev_charging: 'ev-station',
    gated: 'gate',
    handicap: 'wheelchair-accessibility',
  };
  return icons[amenity] || 'check-circle';
}

// ─── Component ────────────────────────────────────────────────────────────────
const MapScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  // Map refs
  const mapRef = useRef<any>(null);        // MapView ref — for getVisibleBounds()
  const cameraRef = useRef<any>(null);     // Camera ref — for setCamera()
  const viewportDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userHasInteractedRef = useRef(false);

  // State
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [previousSpot, setPreviousSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearchHere, setShowSearchHere] = useState(false);

  // ─── 3-slot carousel animation ─────────────────────────────────────────────
  // Layout:  [slot1: selected] [slot2: previous??selected] [slot3: empty]
  // Idle:    translateX = -CARD_WIDTH  → slot2 visible
  // Animate: translateX 0→0 (slot1 slides in from left, slot2 slides out right)
  const stripTranslate = useSharedValue(-CARD_WIDTH);

  const stripAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: stripTranslate.value }],
  }));

  const clearPrevious = useCallback(() => setPreviousSpot(null), []);

  useLayoutEffect(() => {
    if (previousSpot !== null) {
      // Snap strip so slot2 (old card) is visible, then slide slot1 (new card) in
      stripTranslate.value = -CARD_WIDTH;
      stripTranslate.value = withTiming(0, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) runOnJS(clearPrevious)();
      });
    } else {
      // Reset to idle — slot2 visible, no animation visible to the user
      stripTranslate.value = -CARD_WIDTH;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousSpot]);

  // ─── Viewport loading ──────────────────────────────────────────────────────
  const loadViewport = useCallback(async () => {
    if (!mapRef.current) return;

    let north: number, south: number, east: number, west: number;

    try {
      // getVisibleBounds() → [[east, north], [west, south]]
      const [[e, n], [w, s]] = await mapRef.current.getVisibleBounds();
      north = n; south = s; east = e; west = w;
    } catch {
      // Fallback: ±0.05° delta around last known center
      const [lng, lat] = MAP_DEFAULTS.center;
      north = lat + 0.05; south = lat - 0.05;
      east = lng + 0.05;  west = lng - 0.05;
    }

    try {
      const result = await spotApi.searchViewport({ north, south, east, west });
      const mapped = result.spots.map(mapSpotSummaryToSpot);
      if (mapped.length > 0) {
        // Never wipe existing markers with zero results
        setSpots(mapped);
        setError(null);
      }
    } catch {
      // Keep previous markers on failure
    }
  }, []);

  // onRegionDidChange — fired after pan/zoom ends, debounced 400 ms
  const handleRegionDidChange = useCallback(() => {
    userHasInteractedRef.current = true;
    setShowSearchHere(true);
    if (viewportDebounceRef.current) clearTimeout(viewportDebounceRef.current);
    viewportDebounceRef.current = setTimeout(() => {
      setShowSearchHere(false);
      loadViewport();
    }, 400);
  }, [loadViewport]);

  // "Search this zone" button — immediate, no debounce
  const handleSearchHere = useCallback(() => {
    if (viewportDebounceRef.current) clearTimeout(viewportDebounceRef.current);
    setShowSearchHere(false);
    loadViewport();
  }, [loadViewport]);

  // ─── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('denied');

        const location = await Location.getCurrentPositionAsync({});
        if (!isMounted || userHasInteractedRef.current) return;

        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(coords);

        // Fly to user location (600 ms animation)
        cameraRef.current?.setCamera({
          centerCoordinate: [coords.longitude, coords.latitude],
          zoomLevel: 14,
          animationDuration: 600,
        });

        // Load spots 600 ms after camera settles
        setTimeout(async () => {
          if (!isMounted || userHasInteractedRef.current) return;
          try {
            const result = await spotApi.search({
              latitude: coords.latitude,
              longitude: coords.longitude,
              radius: 5,
            });
            if (isMounted) {
              setSpots(result.spots.map(mapSpotSummaryToSpot));
              setError(null);
            }
          } catch {
            if (isMounted) setError('Failed to load parking spots');
          } finally {
            if (isMounted) setLoading(false);
          }
        }, 600);
      } catch {
        // GPS unavailable → default center (Toulouse), try viewport load
        if (!isMounted) return;
        loadViewport().finally(() => {
          if (isMounted) setLoading(false);
        });
      }
    })();

    return () => {
      isMounted = false;
      if (viewportDebounceRef.current) clearTimeout(viewportDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Marker press (GeoJSON ShapeSource) ───────────────────────────────────
  const handleMarkerPress = useCallback((e: any) => {
    const features: any[] = e?.features ?? e?.nativeEvent?.payload?.features ?? [];
    if (!features.length) return;

    const spotId: string | undefined = features[0]?.properties?.spotId;
    if (!spotId) return;

    const spot = spots.find((s) => s.id === spotId);
    if (!spot) return;

    // Update carousel slots
    setPreviousSpot(selectedSpot);
    setSelectedSpot(spot);

    // Center map on tapped spot
    cameraRef.current?.setCamera({
      centerCoordinate: [spot.longitude, spot.latitude],
      zoomLevel: 15,
      animationDuration: 300,
    });
  }, [spots, selectedSpot]);

  // ─── Navigation handlers ───────────────────────────────────────────────────
  const handleSpotCardPress = useCallback((spot: Spot) => {
    navigation.navigate('SpotDetail', { spotId: spot.id });
  }, [navigation]);

  const handleSearchPress = () => navigation.navigate('Search');
  const handleFiltersPress = () => navigation.navigate('Filters');

  const handleMyLocationPress = useCallback(() => {
    if (userLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 14,
        animationDuration: 800,
      });
    }
  }, [userLocation]);

  // ─── GeoJSON FeatureCollection ─────────────────────────────────────────────
  const spotsGeoJSON = useMemo(
    () => spotsToGeoJSON(spots, selectedSpot?.id ?? null),
    [spots, selectedSpot?.id],
  );

  // ─── Distance helpers for cards ───────────────────────────────────────────
  const addDistance = useCallback((spot: Spot): Spot => {
    if (!userLocation) return spot;
    return {
      ...spot,
      distance: calculateDistance(
        userLocation.latitude, userLocation.longitude,
        spot.latitude, spot.longitude,
      ),
    } as Spot & { distance: number };
  }, [userLocation]);

  const selectedSpotWithDist = useMemo(
    () => (selectedSpot ? addDistance(selectedSpot) : null),
    [selectedSpot, addDistance],
  );
  const previousSpotWithDist = useMemo(
    () => (previousSpot ? addDistance(previousSpot) : null),
    [previousSpot, addDistance],
  );

  // ─── Bottom card renderer ──────────────────────────────────────────────────
  const renderSpotCard = (spot: Spot | null) => {
    if (!spot) return <View style={{ width: CARD_WIDTH }} />;

    const dist = (spot as any).distance as number | undefined;

    return (
      <AnimatedPressable
        haptic
        onPress={() => handleSpotCardPress(spot)}
        style={{ width: CARD_WIDTH }}
      >
        <Card style={styles.spotCard} elevation="medium">
          <View style={styles.cardContent}>
            {/* Image placeholder */}
            <View style={styles.cardImageContainer}>
              <View style={[styles.cardImage, { backgroundColor: NEUTRAL_COLORS.lightGray }]}>
                <Icon name="image" size={24} color={NEUTRAL_COLORS.gray} />
              </View>
              {spot.instantBook && (
                <View style={styles.instantBookBadge}>
                  <Icon name="flash" size={12} color={NEUTRAL_COLORS.white} />
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{spot.title}</Text>
                {spot.rating >= 4.8 && <Badge text="Top Rated" variant="success" size="small" />}
              </View>

              <View style={styles.cardDetails}>
                {dist !== undefined && (
                  <View style={styles.detailRow}>
                    <Icon name="map-marker-distance" size={14} color={NEUTRAL_COLORS.gray} />
                    <Text style={styles.detailText}>{formatDistance2(dist)}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Icon name="star" size={14} color={NEUTRAL_COLORS.darkGray} />
                  <Text style={styles.detailText}>{formatRating(spot.rating, spot.reviewCount)}</Text>
                </View>
              </View>

              <View style={styles.amenitiesRow}>
                {spot.amenities.slice(0, 3).map((amenity) => (
                  <View key={amenity} style={styles.amenityIcon}>
                    <Icon name={getAmenityIcon(amenity)} size={12} color={NEUTRAL_COLORS.darkGray} />
                  </View>
                ))}
              </View>

              <View style={styles.cardFooter}>
                <Text style={[styles.cardPrice, { color: colors.primary }]}>
                  {formatPrice(spot.hourlyRate)}
                </Text>
                <AnimatedPressable
                  haptic
                  style={[styles.bookButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleSpotCardPress(spot)}
                >
                  <Text style={styles.bookButtonText}>View</Text>
                  <Icon name="chevron-right" size={16} color={NEUTRAL_COLORS.white} />
                </AnimatedPressable>
              </View>
            </View>
          </View>
        </Card>
      </AnimatedPressable>
    );
  };

  // Bottom overlay offset changes based on whether a card is shown
  const overlayBottom = selectedSpot
    ? TAB_BAR_HEIGHT + CARD_HEIGHT + SPACING.lg + SPACING.md
    : TAB_BAR_HEIGHT + SPACING.xl;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── Map (native) or Expo Go placeholder ──────────────────────────── */}
      {!isExpoGo && MLMapView ? (
        <MLMapView
          ref={mapRef}
          style={styles.map}
          mapStyle={MAPLIBRE_STYLE}
          logoEnabled={false}
          attributionEnabled={false}
          onRegionDidChange={handleRegionDidChange}
        >
          <MLCamera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: MAP_DEFAULTS.center,
              zoomLevel: MAP_DEFAULTS.zoomLevel,
            }}
            minZoomLevel={MAP_DEFAULTS.minZoomLevel}
            maxZoomLevel={MAP_DEFAULTS.maxZoomLevel}
          />
          <MLUserLocation visible />

          {/* GeoJSON markers — one ShapeSource, no individual PointAnnotations */}
          <MLShapeSource
            id="spots-source"
            shape={spotsGeoJSON}
            onPress={handleMarkerPress}
          >
            {/* Circle layer: selected = primary color, default = white */}
            <MLCircleLayer
              id="spots-circles"
              style={{
                circleRadius: ['case', ['get', 'selected'], 17, 12],
                circleColor: [
                  'case',
                  ['get', 'selected'],
                  colors.primary,
                  NEUTRAL_COLORS.white,
                ],
                circleStrokeWidth: 2,
                circleStrokeColor: [
                  'case',
                  ['get', 'selected'],
                  colors.primary,
                  NEUTRAL_COLORS.darkGray,
                ],
              }}
            />
            {/* Symbol layer: "P" label inside every circle */}
            <MLSymbolLayer
              id="spots-labels"
              style={{
                textField: 'P',
                textSize: ['case', ['get', 'selected'], 13, 11],
                textColor: [
                  'case',
                  ['get', 'selected'],
                  NEUTRAL_COLORS.white,
                  NEUTRAL_COLORS.black,
                ],
                textAllowOverlap: true,
                textIgnorePlacement: true,
              }}
            />
          </MLShapeSource>
        </MLMapView>
      ) : (
        // Expo Go fallback — map not available
        <View style={[styles.map, styles.mapPlaceholder]}>
          <Icon name="map-outline" size={64} color={NEUTRAL_COLORS.lightGray} />
          <Text style={styles.placeholderText}>Map requires a dev build</Text>
          <Text style={styles.placeholderSub}>Run: npx expo run:android</Text>
        </View>
      )}

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(0).duration(500).springify()}
        style={styles.searchContainer}
      >
        <AnimatedPressable haptic style={styles.searchBar} onPress={handleSearchPress}>
          <Icon name="magnify" size={24} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.searchPlaceholder}>Where do you need parking?</Text>
        </AnimatedPressable>
        <AnimatedPressable haptic style={styles.filterButton} onPress={handleFiltersPress}>
          <Icon name="tune-vertical" size={24} color={colors.primary} />
        </AnimatedPressable>
      </Animated.View>

      {/* ── "Search this zone" button (appears after pan/zoom) ───────────── */}
      {showSearchHere && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.searchHereContainer}
        >
          <AnimatedPressable
            haptic
            style={[styles.searchHereButton, { backgroundColor: colors.primary }]}
            onPress={handleSearchHere}
          >
            <Icon name="magnify" size={16} color={NEUTRAL_COLORS.white} />
            <Text style={styles.searchHereText}>Search this zone</Text>
          </AnimatedPressable>
        </Animated.View>
      )}

      {/* ── My Location button ────────────────────────────────────────────── */}
      <AnimatedPressable
        haptic
        style={[styles.myLocationButton, { bottom: overlayBottom }]}
        onPress={handleMyLocationPress}
      >
        <Icon name="crosshairs-gps" size={24} color={colors.primary} />
      </AnimatedPressable>

      {/* ── Spots count ───────────────────────────────────────────────────── */}
      {!loading && spots.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(100).duration(500).springify()}
          style={[styles.spotsCountContainer, { bottom: overlayBottom }]}
        >
          <Text style={styles.spotsCount}>
            {spots.length} spot{spots.length !== 1 ? 's' : ''}
          </Text>
        </Animated.View>
      )}

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading spots...</Text>
        </View>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={24} color={NEUTRAL_COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <AnimatedPressable
            haptic
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (userLocation) {
                setLoading(true);
                spotApi
                  .search({ latitude: userLocation.latitude, longitude: userLocation.longitude, radius: 10 })
                  .then((r) => { setSpots(r.spots.map(mapSpotSummaryToSpot)); setError(null); })
                  .catch(() => setError('Failed to load parking spots'))
                  .finally(() => setLoading(false));
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </AnimatedPressable>
        </View>
      )}

      {/* ── OSM Attribution ───────────────────────────────────────────────── */}
      <View style={[styles.attribution, { bottom: TAB_BAR_HEIGHT + (selectedSpot ? CARD_HEIGHT + SPACING.lg + 4 : SPACING.lg) }]}>
        <Text style={styles.attributionText}>© OpenStreetMap contributors © CARTO</Text>
      </View>

      {/* ── Bottom 3-slot animated carousel ──────────────────────────────── */}
      {selectedSpot && (
        <Animated.View
          entering={FadeInDown.delay(200).duration(500).springify()}
          style={[styles.bottomContainer, { bottom: TAB_BAR_HEIGHT }]}
        >
          {/* Clipping window — one card wide */}
          <View style={styles.cardSlideContainer}>
            {/* Strip — three slots wide, translated by stripTranslate */}
            <Animated.View style={[styles.cardStrip, stripAnimStyle]}>
              {/* Slot 1 — new selectedSpot (slides in from left) */}
              {renderSpotCard(selectedSpotWithDist)}
              {/* Slot 2 — previous ?? current (visible in idle + animating out) */}
              {renderSpotCard(previousSpotWithDist ?? selectedSpotWithDist)}
              {/* Slot 3 — empty placeholder */}
              <View style={{ width: CARD_WIDTH }} />
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    backgroundColor: NEUTRAL_COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray,
  },
  placeholderSub: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
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
  searchHereContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    alignSelf: 'center',
  },
  searchHereButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    ...SHADOWS.medium,
  },
  searchHereText: {
    color: NEUTRAL_COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  myLocationButton: {
    position: 'absolute',
    right: SPACING.md,
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
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: NEUTRAL_COLORS.white,
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
  // ─── Carousel ───────────────────────────────────────────────────────────────
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  cardSlideContainer: {
    width: CARD_WIDTH,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cardStrip: {
    width: CARD_WIDTH * 3,
    flexDirection: 'row',
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
});

export default MapScreen;
