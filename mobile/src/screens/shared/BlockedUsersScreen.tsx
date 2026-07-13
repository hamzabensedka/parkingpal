import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../contexts/ThemeContext';
import { useError } from '../../contexts/ErrorContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { safetyApi } from '../../services/api';
import type { UserBlock } from '../../services/api/safetyApi';
import { Card, Loading, EmptyState, AnimatedPressable } from '../../components/common';

const BlockedUsersScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showError } = useError();
  const [blocks, setBlocks] = useState<UserBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchBlocks = useCallback(async (reset: boolean = false) => {
    try {
      const newOffset = reset ? 0 : offset;
      const response = await safetyApi.getBlockedUsers({
        limit: LIMIT,
        offset: newOffset,
      });

      if (reset) {
        setBlocks(response.blocks);
      } else {
        setBlocks(prev => [...prev, ...response.blocks]);
      }

      setHasMore(response.pagination.hasMore);
      setOffset(newOffset + response.blocks.length);
    } catch (error) {
      console.error('Failed to fetch blocked users:', error);
      showError(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchBlocks(true);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setOffset(0);
    fetchBlocks(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchBlocks(false);
    }
  };

  const handleUnblock = (block: UserBlock) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${block.blocked.firstName} ${block.blocked.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              await safetyApi.unblockUser(block.blockedId);
              setBlocks(prev => prev.filter(b => b.id !== block.id));
              Alert.alert('Success', 'User has been unblocked');
            } catch (error) {
              showError(error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderBlockItem = ({ item, index }: { item: UserBlock; index: number }) => (
    <Animated.View entering={FadeInDown.delay(100 + index * 100).duration(500).springify()}>
      <Card style={styles.blockCard}>
        <View style={styles.blockContent}>
          <View style={styles.userInfo}>
            {item.blocked.profilePhoto ? (
              <Image
                source={{ uri: item.blocked.profilePhoto }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icon name="account" size={24} color={NEUTRAL_COLORS.gray} />
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {item.blocked.firstName} {item.blocked.lastName}
              </Text>
              <Text style={styles.blockDate}>
                Blocked on {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <AnimatedPressable
            style={styles.unblockButton}
            onPress={() => handleUnblock(item)}
            haptic
          >
            <Text style={[styles.unblockText, { color: colors.primary }]}>Unblock</Text>
          </AnimatedPressable>
        </View>
      </Card>
    </Animated.View>
  );

  if (isLoading && blocks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={blocks}
        renderItem={renderBlockItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
            <EmptyState
              icon="account-check"
              title="No Blocked Users"
              description="You haven't blocked any users. Blocked users won't be able to contact you or see your listings."
            />
          </Animated.View>
        }
        ListHeaderComponent={
          blocks.length > 0 ? (
            <Animated.View entering={FadeInDown.delay(0).duration(500).springify()}>
              <View style={styles.header}>
                <Text style={styles.headerText}>
                  Blocked users cannot contact you or see your listings.
                </Text>
              </View>
            </Animated.View>
          ) : null
        }
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
    padding: SPACING.md,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  headerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    textAlign: 'center',
  },
  blockCard: {
    marginBottom: SPACING.sm,
    padding: SPACING.md,
  },
  blockContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  avatarPlaceholder: {
    backgroundColor: NEUTRAL_COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
  },
  blockDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
    marginTop: 2,
  },
  unblockButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  unblockText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
});

export default BlockedUsersScreen;
