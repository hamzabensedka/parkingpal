import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Button, Input, Card, AnimatedPressable } from '../../components/common';
import { reviewApi } from '../../services/api';
import { useError } from '../../contexts/ErrorContext';

const REVIEW_CATEGORIES = [
  { id: 'cleanliness', label: 'Cleanliness', icon: 'broom' },
  { id: 'accuracy', label: 'Accuracy', icon: 'check-decagram' },
  { id: 'access', label: 'Easy Access', icon: 'door-open' },
  { id: 'communication', label: 'Communication', icon: 'message-text' },
  { id: 'value', label: 'Value', icon: 'cash' },
];

const QUICK_TAGS = [
  'Easy access',
  'Clean',
  'Well lit',
  'Safe area',
  'Great value',
  'Good communication',
  'As described',
  'Spacious',
];

const ReviewScreen: React.FC<any> = ({ navigation, route }) => {
  const { bookingId, spotTitle, hostName, renterName } = route.params;
  const { colors } = useTheme();
  const { showError, showPopup } = useError();

  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reviewTarget = renterName || hostName || 'Parking Experience';

  const handleStarPress = useCallback((rating: number) => {
    setOverallRating(rating);
  }, []);

  const handleCategoryRating = useCallback((categoryId: string, rating: number) => {
    setCategoryRatings(prev => ({ ...prev, [categoryId]: rating }));
  }, []);

  const handleTagPress = useCallback((tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      }
      return [...prev, tag];
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (overallRating === 0) {
      showPopup({ title: 'Rating Required', message: 'Please select an overall rating.', severity: 'info' });
      return;
    }

    setIsLoading(true);

    try {
      await reviewApi.createReview({
        bookingId,
        rating: overallRating,
        comment: reviewText || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        categoryRatings: Object.keys(categoryRatings).length > 0 ? categoryRatings : undefined,
      });

      Alert.alert(
        'Review Submitted',
        'Thank you for your feedback!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, overallRating, categoryRatings, reviewText, selectedTags, navigation]);

  const renderStars = (
    currentRating: number,
    onPress: (rating: number) => void,
    size: number = 36
  ) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AnimatedPressable key={star} onPress={() => onPress(star)} haptic>
            <Icon
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={size}
              color={star <= currentRating ? NEUTRAL_COLORS.darkGray : NEUTRAL_COLORS.lightGray}
            />
          </AnimatedPressable>
        ))}
      </View>
    );
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Tap to rate';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
          <View style={styles.header}>
            <Text style={styles.title}>Leave a Review</Text>
            <Text style={styles.subtitle}>
              How was your experience with {reviewTarget}?
            </Text>
            {spotTitle && (
              <Text style={styles.spotName}>{spotTitle}</Text>
            )}
          </View>
        </Animated.View>

        {/* Overall Rating */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <Card style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>Overall Rating</Text>
            {renderStars(overallRating, handleStarPress, 44)}
            <Text style={[
              styles.ratingLabel,
              overallRating > 0 && { color: NEUTRAL_COLORS.darkGray },
            ]}>
              {getRatingLabel(overallRating)}
            </Text>
          </Card>
        </Animated.View>

        {/* Category Ratings */}
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
          <Card style={styles.categoriesCard}>
            <Text style={styles.categoriesTitle}>Rate Each Category</Text>
            {REVIEW_CATEGORIES.map((category) => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Icon name={category.icon} size={20} color={colors.primary} />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                </View>
                {renderStars(
                  categoryRatings[category.id] || 0,
                  (rating) => handleCategoryRating(category.id, rating),
                  24
                )}
              </View>
            ))}
          </Card>
        </Animated.View>

        {/* Written Review */}
        <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
          <Card style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Write Your Review</Text>
            <Text style={styles.reviewSubtitle}>
              Share your experience to help others make informed decisions
            </Text>
            <Input
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="What was your experience like? Was the spot easy to find? Was it clean and well-maintained?"
              multiline
              numberOfLines={6}
              maxLength={500}
            />
            <Text style={styles.charCount}>{reviewText.length}/500</Text>
          </Card>
        </Animated.View>

        {/* Quick Tags */}
        <Card style={styles.tagsCard}>
          <Text style={styles.tagsTitle}>Quick Tags</Text>
          <View style={styles.tagsGrid}>
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <AnimatedPressable
                  key={tag}
                  style={[
                    styles.tag,
                    isSelected && { backgroundColor: colors.lightest, borderColor: colors.primary },
                  ]}
                  onPress={() => handleTagPress(tag)}
                  haptic
                >
                  <Text style={[
                    styles.tagText,
                    isSelected && { color: colors.primary },
                  ]}>
                    {tag}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          title="Submit Review"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={overallRating === 0}
          fullWidth
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
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
  },
  spotName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.darkGray,
    marginTop: SPACING.sm,
  },
  ratingCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  ratingLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },
  categoriesCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  categoriesTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
  },
  reviewCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  reviewTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.xs,
  },
  reviewSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'right',
    marginTop: 4,
  },
  tagsCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  tagsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: SPACING.md,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
    backgroundColor: NEUTRAL_COLORS.white,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: NEUTRAL_COLORS.lightGray,
  },
});

export default ReviewScreen;
