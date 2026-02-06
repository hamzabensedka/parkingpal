import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Spot } from '../../types';
import { Card, Badge, EmptyState } from '../../components/common';
import { mockSpots } from '../../data/mockSpots';

const SavedSpotsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();

  // Simulating saved spots (in real app, this would come from context/API)
  const [savedSpots, setSavedSpots] = useState<Spot[]>(mockSpots.slice(0, 5));

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
          onPress: () => {
            setSavedSpots(prev => prev.filter(spot => spot.id !== spotId));
          },
        },
      ]
    );
  }, []);

  const renderSpotCard = ({ item }: { item: Spot }) => {
    return (
      <Card
        style={styles.spotCard}
        onPress={() => handleSpotPress(item)}
        elevation="small"
      >
        <View style={styles.cardContent}>
          {/* Spot Image Placeholder */}
          <View style={[styles.spotImage, { backgroundColor: colors.lightest }]}>
            <Icon name="parking" size={32} color={colors.primary} />
          </View>

          {/* Spot Info */}
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

          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveSaved(item.id)}
          >
            <Icon name="heart" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="heart-outline"
      title="No saved spots"
      description="Save parking spots you like to quickly find them later."
      actionLabel="Explore Spots"
      onAction={() => navigation.navigate('Map')}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.lightest }]}>
          <Icon name="heart" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{savedSpots.length}</Text>
          <Text style={styles.statLabel}>Saved Spots</Text>
        </View>
      </View>

      {/* Spots List */}
      <FlatList
        data={savedSpots}
        renderItem={renderSpotCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
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
  spotCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  cardContent: {
    flexDirection: 'row',
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
  removeButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
});

export default SavedSpotsScreen;
