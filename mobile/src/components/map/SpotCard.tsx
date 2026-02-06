import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Spot } from '../../types';
import { Badge } from '../common';

interface SpotCardProps {
  spot: Spot;
  onPress: (spot: Spot) => void;
  compact?: boolean;
}

const SpotCard: React.FC<SpotCardProps> = memo(({ spot, onPress, compact = false }) => {
  const { colors } = useTheme();

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={() => onPress(spot)}
        activeOpacity={0.8}
      >
        <View style={[styles.compactImage, { backgroundColor: colors.lightest }]}>
          <Icon name="parking" size={24} color={colors.primary} />
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>{spot.title}</Text>
          <View style={styles.compactMeta}>
            <Icon name="star" size={12} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.compactRating}>{spot.rating.toFixed(1)}</Text>
            <Text style={styles.compactDistance}>{spot.distance || '0.3'} km</Text>
          </View>
        </View>
        <Text style={[styles.compactPrice, { color: colors.primary }]}>
          €{spot.hourlyRate}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(spot)}
      activeOpacity={0.8}
    >
      {/* Image Placeholder */}
      <View style={[styles.imageContainer, { backgroundColor: colors.lightest }]}>
        <Icon name="parking" size={36} color={colors.primary} />
        {spot.instantBook && (
          <View style={[styles.instantBadge, { backgroundColor: colors.primary }]}>
            <Icon name="lightning-bolt" size={10} color={NEUTRAL_COLORS.white} />
            <Text style={styles.instantText}>Instant</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{spot.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.ratingText}>
              {spot.rating.toFixed(1)} ({spot.reviewCount})
            </Text>
          </View>
          <Text style={styles.distance}>{spot.distance || '0.3'} km</Text>
        </View>

        <View style={styles.amenitiesRow}>
          {spot.amenities.slice(0, 2).map((amenity, index) => (
            <Badge key={index} text={amenity} variant="default" size="small" />
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            €{spot.hourlyRate}
          </Text>
          <Text style={styles.priceUnit}>/hour</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  instantBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: 2,
  },
  instantText: {
    fontSize: 10,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
  infoContainer: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  distance: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginLeft: 2,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  compactRating: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.darkGray,
  },
  compactDistance: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
  },
  compactPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
  },
});

export default SpotCard;
