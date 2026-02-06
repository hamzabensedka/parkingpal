import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { HostStackParamList } from '../../types';
import { Button, Card, Badge, Chip } from '../../components/common';

type Props = NativeStackScreenProps<HostStackParamList, 'AddListingPreview'>;

const AddListingPreviewScreen = ({ navigation, route }: Props) => {
  const { location, photos, spotType, amenities, vehicleSizes, accessInstructions, accessType, hourlyRate, dailyRate, availability, title, description, houseRules } = route.params;
  const { colors } = useTheme();

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsPublishing(false);

    Alert.alert(
      'Listing Published!',
      'Your parking spot is now live and visible to renters.',
      [
        {
          text: 'View Dashboard',
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'HostTabs' }],
              })
            );
          },
        },
      ]
    );
  };

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your listing has been saved as a draft.');
    navigation.goBack();
  };

  const getSpotTypeIcon = (type: string) => {
    switch (type) {
      case 'garage': return 'garage';
      case 'driveway': return 'home';
      case 'street': return 'road';
      case 'lot': return 'parking';
      case 'covered': return 'home-roof';
      case 'underground': return 'arrow-down-bold-box';
      default: return 'parking';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={[styles.header, { backgroundColor: colors.lightest }]}>
          <Icon name="check-circle" size={48} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.dark }]}>
            Your Listing is Ready!
          </Text>
          <Text style={styles.headerSubtitle}>
            Review your listing before publishing
          </Text>
        </View>

        {/* Photo Preview */}
        <View style={styles.photoSection}>
          {photos[0] && (
            <Image
              source={{ uri: photos[0] }}
              style={styles.mainPhoto}
            />
          )}
          {photos.length > 1 && (
            <View style={styles.photoCount}>
              <Icon name="image-multiple" size={16} color={NEUTRAL_COLORS.white} />
              <Text style={styles.photoCountText}>+{photos.length - 1}</Text>
            </View>
          )}
        </View>

        {/* Basic Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.listingTitle}>{title}</Text>
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color={NEUTRAL_COLORS.gray} />
            <Text style={styles.locationText}>{location.address}</Text>
          </View>

          <View style={styles.badges}>
            <View style={[styles.typeBadge, { backgroundColor: colors.lightest }]}>
              <Icon name={getSpotTypeIcon(spotType)} size={16} color={colors.primary} />
              <Text style={[styles.typeBadgeText, { color: colors.primary }]}>
                {spotType.charAt(0).toUpperCase() + spotType.slice(1)}
              </Text>
            </View>
          </View>

          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </Card>

        {/* Pricing Card */}
        <Card style={styles.pricingCard}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.priceGrid}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Hourly</Text>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                €{hourlyRate}
              </Text>
            </View>
            {dailyRate && (
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Daily</Text>
                <Text style={styles.priceValue}>€{dailyRate}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Icon name="car" size={20} color={NEUTRAL_COLORS.gray} />
            <Text style={styles.detailLabel}>Vehicle Size</Text>
            <Text style={styles.detailValue}>
              {vehicleSizes[0].charAt(0).toUpperCase() + vehicleSizes[0].slice(1)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="key" size={20} color={NEUTRAL_COLORS.gray} />
            <Text style={styles.detailLabel}>Access Type</Text>
            <Text style={styles.detailValue}>
              {accessType.charAt(0).toUpperCase() + accessType.slice(1)}
            </Text>
          </View>
        </Card>

        {/* Amenities Card */}
        {amenities.length > 0 && (
          <Card style={styles.amenitiesCard}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesList}>
              {amenities.map((amenity: string, index: number) => (
                <Chip
                  key={index}
                  label={amenity.replace(/_/g, ' ')}
                  selected
                />
              ))}
            </View>
          </Card>
        )}

        {/* Earnings Estimate */}
        <Card style={[styles.earningsCard, { backgroundColor: colors.lightest }]}>
          <Icon name="cash-multiple" size={32} color={colors.primary} />
          <View style={styles.earningsContent}>
            <Text style={[styles.earningsTitle, { color: colors.dark }]}>
              Estimated Monthly Earnings
            </Text>
            <Text style={[styles.earningsAmount, { color: colors.primary }]}>
              €{(hourlyRate * 20 * 0.85).toFixed(0)} - €{(hourlyRate * 60 * 0.85).toFixed(0)}
            </Text>
            <Text style={styles.earningsNote}>
              Based on 20-60 hours of bookings per month
            </Text>
          </View>
        </Card>

        {/* Edit Notice */}
        <View style={styles.editNotice}>
          <Icon name="information" size={16} color={NEUTRAL_COLORS.gray} />
          <Text style={styles.editNoticeText}>
            You can edit your listing anytime from the Listings tab
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Save as Draft"
          onPress={handleSaveDraft}
          variant="outline"
          style={styles.draftButton}
        />
        <Button
          title="Publish Listing"
          onPress={handlePublish}
          loading={isPublishing}
          style={styles.publishButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  photoSection: {
    position: 'relative',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  mainPhoto: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
  },
  photoCount: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  photoCountText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.white,
    fontWeight: '600',
  },
  infoCard: {
    margin: SPACING.md,
    padding: SPACING.md,
  },
  listingTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 22,
  },
  pricingCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  priceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  priceItem: {
    minWidth: '45%',
  },
  priceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
  },
  detailsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    marginLeft: SPACING.sm,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  amenitiesCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  earningsCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.md,
  },
  earningsContent: {
    flex: 1,
  },
  earningsTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    marginBottom: 4,
  },
  earningsNote: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  editNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  editNoticeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
    gap: SPACING.sm,
  },
  draftButton: {
    flex: 1,
  },
  publishButton: {
    flex: 2,
  },
});

export default AddListingPreviewScreen;
