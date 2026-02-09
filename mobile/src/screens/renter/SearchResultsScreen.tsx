import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { RenterStackParamList, Spot } from '../../types';
import { Card, Badge, EmptyState, Chip } from '../../components/common';
import { spotApi } from '../../services/api';
import { mapSpotSummaryToSpot } from '../../utils/spotMappers';

type Props = NativeStackScreenProps<RenterStackParamList, 'SearchResults'>;

type SortOption = 'distance' | 'price_low' | 'price_high' | 'rating';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'distance', label: 'Nearest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const SearchResultsScreen = ({ navigation, route }: Props) => {
  const { query, filters } = route.params || {};
  const { colors, NEUTRAL_COLORS } = useTheme();

  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch spots from API
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        setLoading(true);
        setError(null);

        // Default to Toulouse coordinates if no location provided
        const latitude = filters?.location?.latitude || 43.604652;
        const longitude = filters?.location?.longitude || 1.444209;

        const result = await spotApi.search({
          latitude,
          longitude,
          radius: filters?.radius || 10,
          spotType: filters?.spotTypes?.[0],
          vehicleSize: filters?.vehicleSize,
          minPrice: filters?.minPrice,
          maxPrice: filters?.maxPrice,
          amenities: filters?.amenities,
          instantBook: filters?.instantBook,
        });

        let mappedSpots = result.spots.map(mapSpotSummaryToSpot);

        // Apply text search query (client-side filter)
        if (query) {
          const lowerQuery = query.toLowerCase();
          mappedSpots = mappedSpots.filter(
            spot =>
              spot.title.toLowerCase().includes(lowerQuery) ||
              spot.address.toLowerCase().includes(lowerQuery)
          );
        }

        setSpots(mappedSpots);
      } catch (err) {
        console.error('Failed to fetch spots:', err);
        setError('Failed to load search results');
        setSpots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [query, filters]);

  // Sort spots
  const filteredSpots = useMemo(() => {
    let sorted = [...spots];

    switch (sortBy) {
      case 'price_low':
        sorted.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
      default:
        // Keep default order from API (already sorted by distance)
        break;
    }

    return sorted;
  }, [spots, sortBy]);

  const handleSpotPress = useCallback((spot: Spot) => {
    navigation.navigate('SpotDetail', { spotId: spot.id });
  }, [navigation]);

  const handleFilterPress = useCallback(() => {
    navigation.navigate('Filters', { currentFilters: filters });
  }, [navigation, filters]);

  const activeFiltersCount = useMemo(() => {
    if (!filters) return 0;
    let count = 0;
    if (filters.maxPrice) count++;
    if (filters.spotTypes?.length) count++;
    if (filters.amenities?.length) count++;
    if (filters.minRating) count++;
    return count;
  }, [filters]);

  const renderSpotCard = ({ item }: { item: Spot }) => {
    return (
      <Card
        style={styles.spotCard}
        onPress={() => handleSpotPress(item)}
        elevation="small"
      >
        {/* Image Placeholder */}
        <View style={[styles.spotImage, { backgroundColor: colors.lightest }]}>
          <Icon name="parking" size={40} color={colors.primary} />
          {item.isInstantBook && (
            <View style={[styles.instantBadge, { backgroundColor: colors.primary }]}>
              <Icon name="lightning-bolt" size={12} color={NEUTRAL_COLORS.white} />
              <Text style={styles.instantText}>Instant</Text>
            </View>
          )}
        </View>

        {/* Spot Details */}
        <View style={styles.spotDetails}>
          <View style={styles.spotHeader}>
            <Text style={styles.spotTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color={NEUTRAL_COLORS.darkGray} />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text style={styles.spotAddress} numberOfLines={1}>{item.address}</Text>

          <View style={styles.spotMeta}>
            <View style={styles.distanceContainer}>
              <Icon name="map-marker-distance" size={14} color={NEUTRAL_COLORS.gray} />
              <Text style={styles.distanceText}>{item.distance || '0.3'} km</Text>
            </View>
            <View style={styles.typeContainer}>
              <Icon
                name={item.type === 'garage' ? 'garage' : item.type === 'covered' ? 'home-roof' : 'car-parking-lights'}
                size={14}
                color={NEUTRAL_COLORS.gray}
              />
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          </View>

          <View style={styles.amenitiesRow}>
            {item.amenities.slice(0, 2).map((amenity, index) => (
              <Badge key={index} text={amenity} variant="default" size="small" />
            ))}
          </View>

          <View style={styles.priceRow}>
            <Text style={[styles.spotPrice, { color: colors.primary }]}>
              €{item.hourlyRate}
            </Text>
            <Text style={styles.priceUnit}>/hour</Text>
            {item.dailyRate && (
              <Text style={styles.dailyPrice}>€{item.dailyRate}/day</Text>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsCount}>
          {filteredSpots.length} spot{filteredSpots.length !== 1 ? 's' : ''} found
        </Text>
        {query && (
          <Text style={styles.searchQuery}>for "{query}"</Text>
        )}
      </View>

      <View style={styles.headerActions}>
        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <Icon name="sort" size={18} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.sortButtonText}>
            {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
          </Text>
          <Icon name="chevron-down" size={16} color={NEUTRAL_COLORS.gray} />
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && { borderColor: colors.primary }]}
          onPress={handleFilterPress}
        >
          <Icon
            name="filter-variant"
            size={18}
            color={activeFiltersCount > 0 ? colors.primary : NEUTRAL_COLORS.gray}
          />
          {activeFiltersCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && { backgroundColor: colors.lightest },
              ]}
              onPress={() => {
                setSortBy(option.value);
                setShowSortMenu(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.value && { color: colors.primary, fontWeight: '600' },
              ]}>
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Icon name="check" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Searching for spots...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle" size={48} color={NEUTRAL_COLORS.error} />
          <Text style={styles.errorTitle}>Failed to load spots</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.replace('SearchResults', { query, filters })}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <EmptyState
        icon="map-marker-off"
        title="No spots found"
        description="Try adjusting your search or filters to find more parking spots."
        actionLabel="Clear Filters"
        onAction={() => navigation.setParams({ filters: undefined })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredSpots}
        renderItem={renderSpotCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={!loading ? renderHeader : undefined}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
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
  header: {
    marginBottom: SPACING.md,
  },
  resultsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resultsCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  searchQuery: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    gap: SPACING.xs,
  },
  sortButtonText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
    color: NEUTRAL_COLORS.white,
  },
  sortMenu: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 48,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  sortOptionText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  spotCard: {
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  spotImage: {
    height: 140,
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
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  instantText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
  spotDetails: {
    padding: SPACING.md,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginRight: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
  },
  spotAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.sm,
  },
  spotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    textTransform: 'capitalize',
  },
  amenitiesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spotPrice: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
  },
  priceUnit: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginLeft: 2,
  },
  dailyPrice: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginLeft: SPACING.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  errorTitle: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  errorText: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
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
});

export default SearchResultsScreen;
