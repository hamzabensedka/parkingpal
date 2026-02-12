import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, Badge, EmptyState } from '../../components/common';
import { spotApi } from '../../services/api';
import type { SpotSummaryDTO } from '@parkingpal/shared-types';

type ListingItem = SpotSummaryDTO & { isActive: boolean };

interface ListingItemProps {
  listing: ListingItem;
  onToggleActive: (id: string, active: boolean) => void;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ListingItemCard: React.FC<ListingItemProps> = ({
  listing,
  onToggleActive,
  onPress,
  onEdit,
  onDelete,
}) => {
  const { colors, NEUTRAL_COLORS } = useTheme();

  return (
    <Card style={styles.listingCard} onPress={onPress}>
      {/* Listing Image Placeholder */}
      <View style={[styles.listingImage, { backgroundColor: colors.lightest }]}>
        <Icon name="parking" size={32} color={colors.primary} />
      </View>

      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
          <Badge
            text={listing.isActive ? 'Active' : 'Paused'}
            variant={listing.isActive ? 'success' : 'default'}
            size="small"
          />
        </View>

        <Text style={styles.listingAddress} numberOfLines={1}>{listing.address}</Text>

        <View style={styles.listingStats}>
          <View style={styles.statItem}>
            <Icon name="star" size={14} color={NEUTRAL_COLORS.darkGray} />
            <Text style={styles.statText}>
              {listing.rating.toFixed(1)} ({listing.reviewCount})
            </Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="cash" size={14} color={colors.primary} />
            <Text style={styles.statText}>€{listing.hourlyRate}/hr</Text>
          </View>
        </View>

        <View style={styles.listingActions}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {listing.isActive ? 'Active' : 'Paused'}
            </Text>
            <Switch
              value={listing.isActive}
              onValueChange={(value) => onToggleActive(listing.id, value)}
              trackColor={{ false: NEUTRAL_COLORS.lightGray, true: colors.light }}
              thumbColor={listing.isActive ? colors.primary : NEUTRAL_COLORS.gray}
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Icon name="pencil" size={18} color={colors.primary} />
              <Text style={[styles.editText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Icon name="delete" size={18} color={NEUTRAL_COLORS.error} />
              <Text style={[styles.deleteText, { color: NEUTRAL_COLORS.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
};

const ListingManagementScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();

  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true);
      const spots = await spotApi.getMyListings();
      setListings(
        spots.map((spot) => ({
          ...spot,
          isActive: spot.status === 'active',
        })),
      );
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      // Fall back to empty list on error
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh listings every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [fetchListings]),
  );

  const handleToggleActive = useCallback(async (id: string, active: boolean) => {
    // Optimistically update UI
    setListings(prev =>
      prev.map(listing =>
        listing.id === id ? { ...listing, isActive: active } : listing
      )
    );

    try {
      if (active) {
        await spotApi.activate(id);
      } else {
        await spotApi.pause(id);
      }

      const message = active
        ? 'Your listing is now visible to renters.'
        : 'Your listing is paused and hidden from renters.';

      Alert.alert(active ? 'Listing Activated' : 'Listing Paused', message);
    } catch (error: any) {
      // Revert optimistic update on error
      setListings(prev =>
        prev.map(listing =>
          listing.id === id ? { ...listing, isActive: !active } : listing
        )
      );

      Alert.alert(
        'Error',
        error.message || `Failed to ${active ? 'activate' : 'pause'} listing. Please try again.`
      );
    }
  }, []);

  const handleListingPress = useCallback((listing: ListingItem) => {
    navigation.navigate('SpotDetail', { spotId: listing.id });
  }, [navigation]);

  const handleEditListing = useCallback((listing: ListingItem) => {
    navigation.navigate('EditListing', { listingId: listing.id });
  }, [navigation]);

  const handleDeleteListing = useCallback(async (listing: ListingItem) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listing.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await spotApi.delete(listing.id);
              // Remove from local state
              setListings(prev => prev.filter(l => l.id !== listing.id));
              Alert.alert('Success', 'Listing deleted successfully');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to delete listing. Please try again.'
              );
            }
          },
        },
      ]
    );
  }, []);

  const handleAddListing = useCallback(() => {
    if (listings.length > 0) {
      Alert.alert(
        'One Listing Allowed',
        'You can only have one active listing at a time. Edit or remove your current listing to create a new one.',
      );
      return;
    }
    navigation.navigate('AddListingLocation');
  }, [navigation, listings.length]);

  const hasListing = listings.length > 0;
  const activeCount = listings.filter(l => l.isActive).length;
  const pausedCount = listings.filter(l => !l.isActive).length;

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Icon name="home-check" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="home-off" size={24} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.statNumber}>{pausedCount}</Text>
          <Text style={styles.statLabel}>Paused</Text>
        </Card>
        <Card style={styles.statCard}>
          <Icon name="home-group" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{listings.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </Card>
      </View>

      {/* Add Button – hidden when a listing already exists */}
      {!hasListing && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleAddListing}
        >
          <Icon name="plus" size={20} color={NEUTRAL_COLORS.white} />
          <Text style={styles.addButtonText}>Add New Listing</Text>
        </TouchableOpacity>
      )}

      {hasListing && (
        <View style={styles.oneListingNotice}>
          <Icon name="information-outline" size={16} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.oneListingText}>
            You can have one listing at a time. Edit your listing below.
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="home-plus"
      title="No listings yet"
      description="List your parking space and start earning today!"
      actionLabel="Add Your First Listing"
      onAction={handleAddListing}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={listings}
        renderItem={({ item }) => (
          <ListingItemCard
            listing={item}
            onToggleActive={handleToggleActive}
            onPress={() => handleListingPress(item)}
            onEdit={() => handleEditListing(item)}
            onDelete={() => handleDeleteListing(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
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
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.white,
  },
  listingCard: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listingTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginRight: SPACING.sm,
  },
  listingAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.sm,
  },
  listingStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  listingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  toggleLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: SPACING.sm,
  },
  editText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: SPACING.sm,
  },
  deleteText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oneListingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  oneListingText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
});

export default ListingManagementScreen;
