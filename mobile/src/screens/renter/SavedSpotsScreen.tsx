import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Spot } from '../../types';
import { Card, Badge, EmptyState } from '../../components/common';
import { favoriteApi } from '../../services/api';
import { useError } from '../../contexts/ErrorContext';
import { mapSpotSummaryToSpot } from '../../utils/spotMappers';

const SWIPE_THRESHOLD = -80;

interface SwipeableSpotCardProps {
  item: Spot;
  onRemove: (spotId: string) => void;
  onPress: (spot: Spot) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}

const SwipeableSpotCard: React.FC<SwipeableSpotCardProps> = ({
  item,
  onRemove,
  onPress,
  colors,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -100,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.swipeableContainer}>
      <View style={styles.deleteAction}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onRemove(item.id)}
        >
          <Icon name="trash-can-outline" size={24} color={NEUTRAL_COLORS.white} />
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[styles.animatedCard, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Card
          style={styles.spotCard}
          onPress={() => onPress(item)}
          elevation="small"
        >
          <View style={styles.cardContent}>
            <View style={[styles.spotImage, { backgroundColor: colors.lightest }]}>
              <Icon name="parking" size={32} color={colors.primary} />
            </View>

            <View style={styles.spotInfo}>
              <Text style={styles.spotTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.spotAddress} numberOfLines={1}>{item.address}</Text>

              <View style={styles.spotMeta}>
                <View style={styles.ratingContainer}>
                  <Icon name="star" size={14} color={NEUTRAL_COLORS.darkGray} />
                  <Text style={styles.ratingText}>
                    {item.rating.toFixed(1)} ({item.reviewCount})
                  </Text>
                </View>
                <Text style={[styles.spotPrice, { color: colors.primary }]}>
                  €{item.hourlyRate}/hr
                </Text>
              </View>

              <View style={styles.amenitiesRow}>
                {item.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge
                    key={index}
                    text={amenity}
                    variant="default"
                    size="small"
                  />
                ))}
                {item.amenities.length > 3 && (
                  <Text style={styles.moreAmenities}>
                    +{item.amenities.length - 3}
                  </Text>
                )}
              </View>
            </View>

            <Icon name="chevron-right" size={20} color={NEUTRAL_COLORS.gray} />
          </View>
        </Card>
      </Animated.View>
    </View>
  );
};

const SavedSpotsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { showError } = useError();

  const [savedSpots, setSavedSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      setError(null);
      const spotDTOs = await favoriteApi.getFavorites();
      const mappedSpots = spotDTOs.map(mapSpotSummaryToSpot);
      setSavedSpots(mappedSpots);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Failed to load saved spots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch favorites on mount and when screen comes into focus
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites();
  }, [fetchFavorites]);

  const handleSpotPress = useCallback((spot: Spot) => {
    navigation.navigate('SpotDetail', { spotId: spot.id });
  }, [navigation]);

  const handleRemoveSaved = useCallback((spotId: string) => {
    Alert.alert(
      'Remove from Saved',
      'Are you sure you want to remove this spot from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoriteApi.removeFavorite(spotId);
              setSavedSpots(prev => prev.filter(spot => spot.id !== spotId));
            } catch (err) {
              console.error('Failed to remove favorite:', err);
              showError(err);
            }
          },
        },
      ]
    );
  }, []);

  const renderSpotCard = ({ item }: { item: Spot }) => (
    <SwipeableSpotCard
      item={item}
      onRemove={handleRemoveSaved}
      onPress={handleSpotPress}
      colors={colors}
    />
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading saved spots...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Icon name="alert-circle" size={48} color={NEUTRAL_COLORS.error} />
          <Text style={styles.errorTitle}>Failed to load saved spots</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchFavorites}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <EmptyState
        icon="heart-outline"
        title="No saved spots"
        description="Save parking spots you like to quickly find them later."
        actionLabel="Explore Spots"
        onAction={() => navigation.navigate('Map')}
      />
    );
  };

  const renderListHeader = () =>
    savedSpots.length > 0 ? (
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.lightest }]}>
          <Icon name="heart" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{savedSpots.length}</Text>
          <Text style={styles.statLabel}>Saved Spots</Text>
        </View>
        <Text style={styles.swipeHint}>
          <Icon name="gesture-swipe-left" size={14} color={NEUTRAL_COLORS.gray} />{' '}
          Swipe left to remove
        </Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={savedSpots}
        renderItem={renderSpotCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={!loading && !error ? renderListHeader : undefined}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  statsContainer: {
    padding: SPACING.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  swipeHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  swipeableContainer: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NEUTRAL_COLORS.error,
    borderRadius: RADIUS.lg,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.white,
    fontWeight: '600',
  },
  animatedCard: {
    backgroundColor: NEUTRAL_COLORS.background,
  },
  spotCard: {
    marginBottom: 0,
    padding: SPACING.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  spotInfo: {
    flex: 1,
  },
  spotTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 2,
  },
  spotAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.xs,
  },
  spotMeta: {
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
  spotPrice: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  moreAmenities: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.xxl * 3,
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

export default SavedSpotsScreen;
