import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import MapLibreGL from '@maplibre/maplibre-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, AMENITIES, SPOT_TYPES, MAPLIBRE_STYLE } from '../../utils/constants';
import { formatPrice, formatRating, formatRelativeTime } from '../../utils/formatting';
import { getStarArray } from '../../utils/helpers';
import {
  Button,
  Card,
  Avatar,
  Badge,
  IDVerificationModal,
  AnimatedPressable,
  ParallaxPhotoHeader,
  AnimatedHeader,
  Loading,
} from '../../components/common';
import { spotApi } from '../../services/api';
import { mapSpotDTOToSpot } from '../../utils/spotMappers';
import { Spot } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = 300;

type SpotDetailRouteParams = {
  SpotDetail: { spotId: string };
};

const SpotDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<SpotDetailRouteParams, 'SpotDetail'>>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIDVerificationModal, setShowIDVerificationModal] = useState(false);

  const spotId = route.params?.spotId;

  // Scroll tracking for parallax + animated header
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Fetch spot details from API
  useEffect(() => {
    const fetchSpot = async () => {
      if (!spotId) return;
      try {
        setLoading(true);
        setError(null);
        const spotDTO = await spotApi.getById(spotId);
        const mappedSpot = mapSpotDTOToSpot(spotDTO);
        setSpot(mappedSpot);
      } catch (err) {
        console.error('Failed to fetch spot:', err);
        setError('Failed to load spot details');
      } finally {
        setLoading(false);
      }
    };
    fetchSpot();
  }, [spotId]);

  const spotType = useMemo(() => {
    if (!spot) return null;
    return SPOT_TYPES.find((t) => t.id === spot.spotType);
  }, [spot]);

  const handleBookNow = useCallback(() => {
    if (!spot) return;
    if (user && !user.verified?.id) {
      setShowIDVerificationModal(true);
      return;
    }
    navigation.navigate('BookingDateTime', {
      spotId: spot.id,
      spotTitle: spot.title,
      hourlyRate: spot.hourlyRate,
    });
  }, [navigation, spot, user]);

  const handleVerifyID = useCallback(() => {
    setShowIDVerificationModal(false);
    navigation.navigate('IDVerification');
  }, [navigation]);

  const handleContactHost = useCallback(() => {
    // Navigate to chat
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleShare = useCallback(() => {
    // Share functionality
  }, []);

  const handleSave = useCallback(() => {
    // Save to favorites
  }, []);

  const renderAmenities = () => {
    if (!spot) return null;
    return (
      <View style={styles.amenitiesGrid}>
        {spot.amenities.map((amenityId) => {
          const amenity = AMENITIES.find((a) => a.id === amenityId);
          if (!amenity) return null;
          return (
            <View key={amenityId} style={styles.amenityItem}>
              <View style={[styles.amenityIcon, { backgroundColor: colors.lightest }]}>
                <Icon name={amenity.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.amenityLabel}>{amenity.label}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderHost = () => {
    const host = spot?.host;
    const hostName = host?.firstName ? `Hosted by ${host.firstName}` : 'Host details coming soon';
    const joinedText = host?.memberSince ? `Joined ${formatRelativeTime(host.memberSince)}` : null;
    const reviewsText =
      typeof host?.reviewCount === 'number' ? `${host.reviewCount} reviews` : null;

    return (
      <Card style={styles.hostCard} elevation="small">
        <View style={styles.hostContent}>
          <Avatar
            uri={host?.profilePhoto}
            firstName={host?.firstName ?? 'Host'}
            lastName={host?.lastName ?? ''}
            size="large"
            showBadge={host?.isSuperhost}
          />
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>{hostName}</Text>
            {host?.isSuperhost && (
              <Badge text="Superhost" variant="primary" size="small" icon="star" />
            )}
            <Text style={styles.hostStats}>
              {[reviewsText, joinedText].filter(Boolean).join(' • ') || '—'}
            </Text>
          </View>
          <AnimatedPressable
            style={[styles.contactButton, { borderColor: colors.primary }]}
            onPress={handleContactHost}
            haptic
          >
            <Icon name="message-outline" size={20} color={colors.primary} />
          </AnimatedPressable>
        </View>
      </Card>
    );
  };

  const renderReviews = () => {
    if (!spot) return null;
    return (
      <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeader}>
          <View style={styles.ratingOverview}>
            <Icon name="star" size={24} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({spot.reviewCount} reviews)</Text>
          </View>
          <AnimatedPressable>
            <Text style={[styles.seeAllLink, { color: colors.primary }]}>See all</Text>
          </AnimatedPressable>
        </View>
        <Text style={styles.reviewPlaceholder}>Reviews coming soon</Text>
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Loading />
        <Text style={styles.loadingText}>Loading spot details...</Text>
      </View>
    );
  }

  // Error state
  if (error || !spot) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Icon name="alert-circle" size={64} color={NEUTRAL_COLORS.error} />
        <Text style={styles.errorTitle}>Failed to load spot</Text>
        <Text style={styles.errorText}>{error || 'Spot not found'}</Text>
        <AnimatedPressable
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
          haptic
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scroll-tracking animated header (transparent → solid) */}
      <AnimatedHeader
        scrollY={scrollY}
        title={spot.title}
        threshold={PHOTO_HEIGHT - 60}
        onBack={handleGoBack}
      />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Parallax photo header */}
        <ParallaxPhotoHeader
          photos={spot.photos}
          scrollY={scrollY}
          height={PHOTO_HEIGHT}
          onBack={handleGoBack}
          onShare={handleShare}
          onSave={handleSave}
        />

        <View style={styles.content}>
          {/* Title & Rating — staggered entrance */}
          <Animated.View entering={FadeInDown.delay(0).duration(500).springify()} style={styles.titleSection}>
            <Text style={styles.title}>{spot.title}</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.spotTypeTag}>
                <Icon name={spotType?.icon || 'parking'} size={14} color={colors.primary} />
                <Text style={[styles.spotTypeText, { color: colors.primary }]}>
                  {spotType?.label}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Icon name="star" size={16} color={NEUTRAL_COLORS.darkGray} />
                <Text style={styles.ratingSmall}>{spot.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCountSmall}>({spot.reviewCount})</Text>
              </View>
            </View>
            <Text style={styles.address}>
              <Icon name="map-marker-outline" size={14} color={NEUTRAL_COLORS.darkGray} />
              {' '}{spot.address}
            </Text>
          </Animated.View>

          {/* Quick Info */}
          <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.quickInfo}>
            {spot.instantBook && (
              <View style={styles.quickInfoItem}>
                <Icon name="flash" size={20} color={NEUTRAL_COLORS.success} />
                <Text style={styles.quickInfoText}>Instant Book</Text>
              </View>
            )}
            <View style={styles.quickInfoItem}>
              <Icon name="car" size={20} color={NEUTRAL_COLORS.darkGray} />
              <Text style={styles.quickInfoText}>
                Fits {spot.vehicleSizes.join(', ')}
              </Text>
            </View>
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>About this spot</Text>
            <Text style={styles.description}>{spot.description}</Text>
          </Animated.View>

          {/* Amenities */}
          <Animated.View entering={FadeInDown.delay(300).duration(500).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            {renderAmenities()}
          </Animated.View>

          {/* Host */}
          <Animated.View entering={FadeInDown.delay(400).duration(500).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Your Host</Text>
            {renderHost()}
          </Animated.View>

          {/* House Rules */}
          {spot.houseRules && (
            <Animated.View entering={FadeInDown.delay(500).duration(500).springify()} style={styles.section}>
              <Text style={styles.sectionTitle}>House Rules</Text>
              <Text style={styles.rulesText}>{spot.houseRules}</Text>
            </Animated.View>
          )}

          {/* Reviews */}
          <Animated.View entering={FadeInDown.delay(550).duration(500).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {renderReviews()}
          </Animated.View>

          {/* Location Map Preview */}
          <Animated.View entering={FadeInDown.delay(600).duration(500).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPreviewContainer}>
              <MapLibreGL.MapView
                style={styles.mapPreview}
                mapStyle={MAPLIBRE_STYLE}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                logoEnabled={false}
                attributionEnabled={false}
              >
                <MapLibreGL.Camera
                  defaultSettings={{
                    centerCoordinate: [spot.longitude, spot.latitude],
                    zoomLevel: 15,
                  }}
                />
                <MapLibreGL.MarkerView
                  id="spot-marker"
                  coordinate={[spot.longitude, spot.latitude]}
                >
                  <View style={[styles.mapMarker, { backgroundColor: colors.primary }]}>
                    <Icon name="parking" size={16} color={NEUTRAL_COLORS.white} />
                  </View>
                </MapLibreGL.MarkerView>
              </MapLibreGL.MapView>
              <View style={styles.mapAttribution}>
                <Text style={styles.mapAttributionText}>&copy; OpenStreetMap contributors</Text>
              </View>
            </View>
          </Animated.View>

          {/* Cancellation Policy */}
          <Animated.View entering={FadeInDown.delay(650).duration(500).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <View style={styles.policyCard}>
              <Icon name="calendar-remove" size={20} color={colors.primary} />
              <View style={styles.policyInfo}>
                <Text style={styles.policyTitle}>
                  {spot.cancellationPolicy === 'flexible' ? 'Flexible' :
                   spot.cancellationPolicy === 'moderate' ? 'Moderate' : 'Strict'}
                </Text>
                <Text style={styles.policyText}>
                  {spot.cancellationPolicy === 'flexible'
                    ? 'Full refund if cancelled 2+ hours before start'
                    : spot.cancellationPolicy === 'moderate'
                    ? 'Full refund if cancelled 24+ hours before start'
                    : 'Full refund only if cancelled 72+ hours before start'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatPrice(spot.hourlyRate)}
          </Text>
          {spot.dailyRate && (
            <Text style={styles.dailyPrice}>
              {formatPrice(spot.dailyRate, 'day')}
            </Text>
          )}
        </View>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          icon="calendar-check"
          style={styles.bookButton}
        />
      </SafeAreaView>

      {/* ID Verification Modal */}
      <IDVerificationModal
        visible={showIDVerificationModal}
        onClose={() => setShowIDVerificationModal(false)}
        onVerifyPress={handleVerifyID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: SPACING.lg,
  },
  titleSection: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  spotTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spotTypeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingSmall: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  reviewCountSmall: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  quickInfo: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickInfoText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    gap: SPACING.sm,
  },
  amenityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  hostCard: {
    padding: SPACING.md,
  },
  hostContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  hostName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  hostStats: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: 4,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 24,
  },
  reviewsSection: {},
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
  },
  reviewCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  seeAllLink: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
  },
  policyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: NEUTRAL_COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  policyInfo: {
    flex: 1,
  },
  policyTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  policyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  mapPreviewContainer: {
    height: 180,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPreview: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: NEUTRAL_COLORS.white,
  },
  mapAttribution: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  mapAttributionText: {
    fontSize: 9,
    color: NEUTRAL_COLORS.darkGray,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.medium,
  },
  priceContainer: {},
  price: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
  },
  dailyPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  bookButton: {
    minWidth: 140,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  errorTitle: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  errorText: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: NEUTRAL_COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  reviewPlaceholder: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
});

export default SpotDetailScreen;
