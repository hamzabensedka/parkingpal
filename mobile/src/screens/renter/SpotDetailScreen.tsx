import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, AMENITIES, SPOT_TYPES } from '../../utils/constants';
import { mockSpots, getSpotById } from '../../data/mockSpots';
import { mockUsers, getUserById } from '../../data/mockUsers';
import { mockReviews, getReviewsBySpot } from '../../data/mockReviews';
import { formatPrice, formatRating, formatRelativeTime } from '../../utils/formatting';
import { getStarArray } from '../../utils/helpers';
import { Button, Card, Avatar, Badge } from '../../components/common';

// CartoDB Voyager - clean style with green parks and subtle colors
const OSM_TILE_URL = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SpotDetailRouteParams = {
  SpotDetail: { spotId: string };
};

const SpotDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<SpotDetailRouteParams, 'SpotDetail'>>();
  const { colors } = useTheme();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const spotId = route.params?.spotId;
  const spot = useMemo(() => getSpotById(spotId) || mockSpots[0], [spotId]);
  const host = useMemo(() => getUserById(spot.hostId), [spot.hostId]);
  const reviews = useMemo(() => getReviewsBySpot(spotId).slice(0, 3), [spotId]);

  const spotType = SPOT_TYPES.find((t) => t.id === spot.spotType);
  const starArray = getStarArray(spot.rating);

  const handleBookNow = useCallback(() => {
    navigation.navigate('BookingDateTime', { 
      spotId: spot.id,
      spotTitle: spot.title,
      hourlyRate: spot.hourlyRate,
    });
  }, [navigation, spot.id, spot.title, spot.hourlyRate]);

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

  const renderPhotoGallery = () => (
    <View style={styles.photoGallery}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentPhotoIndex(index);
        }}
      >
        {spot.photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <View style={[styles.photoPlaceholder, { backgroundColor: NEUTRAL_COLORS.lightGray }]}>
              <Icon name="image" size={48} color={NEUTRAL_COLORS.gray} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Photo indicators */}
      <View style={styles.photoIndicators}>
        {spot.photos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.photoIndicator,
              currentPhotoIndex === index && styles.photoIndicatorActive,
            ]}
          />
        ))}
      </View>

      {/* Header actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
          <Icon name="arrow-left" size={24} color={NEUTRAL_COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Icon name="share-variant" size={24} color={NEUTRAL_COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Icon name="heart-outline" size={24} color={NEUTRAL_COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAmenities = () => (
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

  const renderHost = () => (
    <Card style={styles.hostCard} elevation="small">
      <View style={styles.hostContent}>
        <Avatar
          uri={host?.profilePhoto}
          firstName={host?.firstName}
          lastName={host?.lastName}
          size="large"
          showBadge={host?.isSuperhost}
        />
        <View style={styles.hostInfo}>
          <Text style={styles.hostName}>
            Hosted by {host?.firstName}
          </Text>
          {host?.isSuperhost && (
            <Badge text="Superhost" variant="primary" size="small" icon="star" />
          )}
          <Text style={styles.hostStats}>
            {host?.reviewCount} reviews • Joined {formatRelativeTime(host?.memberSince || '')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.contactButton, { borderColor: colors.primary }]}
          onPress={handleContactHost}
        >
          <Icon name="message-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderReviews = () => (
    <View style={styles.reviewsSection}>
      <View style={styles.reviewsHeader}>
        <View style={styles.ratingOverview}>
          <Icon name="star" size={24} color={NEUTRAL_COLORS.darkGray} />
          <Text style={styles.ratingText}>{spot.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({spot.reviewCount} reviews)</Text>
        </View>
        <TouchableOpacity>
          <Text style={[styles.seeAllLink, { color: colors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>

      {reviews.map((review) => {
        const reviewer = getUserById(review.reviewerId);
        return (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Avatar
                uri={reviewer?.profilePhoto}
                firstName={reviewer?.firstName}
                lastName={reviewer?.lastName}
                size="small"
              />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>
                  {reviewer?.firstName} {reviewer?.lastName?.charAt(0)}.
                </Text>
                <Text style={styles.reviewDate}>
                  {formatRelativeTime(review.createdAt)}
                </Text>
              </View>
              <View style={styles.reviewStars}>
                {getStarArray(review.rating).map((star, i) => (
                  <Icon
                    key={i}
                    name={star === 'full' ? 'star' : star === 'half' ? 'star-half-full' : 'star-outline'}
                    size={14}
                    color={NEUTRAL_COLORS.darkGray}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.reviewText}>{review.comment}</Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderPhotoGallery()}

        <View style={styles.content}>
          {/* Title & Rating */}
          <View style={styles.titleSection}>
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
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
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
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this spot</Text>
            <Text style={styles.description}>{spot.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            {renderAmenities()}
          </View>

          {/* Host */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Host</Text>
            {renderHost()}
          </View>

          {/* House Rules */}
          {spot.houseRules && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>House Rules</Text>
              <Text style={styles.rulesText}>{spot.houseRules}</Text>
            </View>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {renderReviews()}
          </View>

          {/* Location Map Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPreviewContainer}>
              <MapView
                style={styles.mapPreview}
                initialRegion={{
                  latitude: spot.latitude,
                  longitude: spot.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                mapType="none"
              >
                <UrlTile
                  urlTemplate={OSM_TILE_URL}
                  maximumZ={19}
                  minimumZ={1}
                  flipY={false}
                  tileSize={256}
                  zIndex={-1}
                />
                <Marker
                  coordinate={{
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                  }}
                >
                  <View style={[styles.mapMarker, { backgroundColor: colors.primary }]}>
                    <Icon name="parking" size={16} color={NEUTRAL_COLORS.white} />
                  </View>
                </Marker>
              </MapView>
              <View style={styles.mapAttribution}>
                <Text style={styles.mapAttributionText}>&copy; OpenStreetMap contributors</Text>
              </View>
            </View>
          </View>

          {/* Cancellation Policy */}
          <View style={styles.section}>
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
          </View>
        </View>
      </ScrollView>

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
  photoGallery: {
    height: 280,
    position: 'relative',
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIndicators: {
    position: 'absolute',
    bottom: SPACING.md,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: NEUTRAL_COLORS.white,
    width: 20,
  },
  headerActions: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
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
  reviewItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  reviewerName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
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
});

export default SpotDetailScreen;
