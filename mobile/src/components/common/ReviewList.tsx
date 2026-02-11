import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Review } from '../../types';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, Avatar } from './index';

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  onEndReached?: () => void;
  ListEmptyComponent?: React.ReactElement;
}

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? NEUTRAL_COLORS.darkGray : NEUTRAL_COLORS.lightGray}
          />
        ))}
      </View>
    );
  };

  return (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Avatar
            source={review.reviewer?.profilePhoto}
            name={`${review.reviewer?.firstName} ${review.reviewer?.lastName}`}
            size={40}
          />
          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>
              {review.reviewer?.firstName} {review.reviewer?.lastName}
            </Text>
            <Text style={styles.reviewDate}>
              {format(new Date(review.createdAt), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>
        {renderStars(review.rating)}
      </View>

      {review.comment && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}

      {review.tags && review.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {review.response && (
        <View style={styles.responseContainer}>
          <View style={styles.responseHeader}>
            <Icon name="reply" size={16} color={NEUTRAL_COLORS.gray} />
            <Text style={styles.responseLabel}>Host Response</Text>
          </View>
          <Text style={styles.responseText}>{review.response}</Text>
          {review.respondedAt && (
            <Text style={styles.responseDate}>
              {format(new Date(review.respondedAt), 'MMM d, yyyy')}
            </Text>
          )}
        </View>
      )}
    </Card>
  );
};

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  loading,
  onEndReached,
  ListEmptyComponent,
}) => {
  return (
    <FlatList
      data={reviews}
      renderItem={({ item }) => <ReviewItem review={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: SPACING.md,
  },
  reviewCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewerDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  reviewerName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: NEUTRAL_COLORS.background,
    borderWidth: 1,
    borderColor: NEUTRAL_COLORS.lightGray,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.darkGray,
  },
  responseContainer: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: NEUTRAL_COLORS.background,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: NEUTRAL_COLORS.gray,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  responseLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray,
    marginLeft: 4,
  },
  responseText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
  },
  responseDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
    marginTop: 4,
  },
});
