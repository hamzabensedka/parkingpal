import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatting';
import { Conversation } from '../../types';
import { Card, Avatar, EmptyState } from '../../components/common';
import { messageApi } from '../../services/api';

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await messageApi.listConversations({ limit: 50, offset: 0 });
      setConversations(result.conversations);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations(true);
    }, [fetchConversations])
  );

  const handleRefresh = useCallback(() => {
    fetchConversations(true);
  }, [fetchConversations]);

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      const otherParticipant = conversation.participants.find(
        (p) => p.id !== user?.id
      ) || conversation.participants[0];

      navigation.navigate('Chat', {
        conversationId: conversation.id,
        bookingId: conversation.bookingId,
        recipientName: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
      });
    },
    [navigation, user]
  );

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants.find(
      (p) => p.id !== user?.id
    ) || item.participants[0];

    const isUnread = item.unreadCount > 0;
    const isSentByMe = item.lastMessage?.senderId === user?.id;

    return (
      <Card
        style={styles.conversationCard}
        onPress={() => handleConversationPress(item)}
        elevation="small"
      >
        <View style={styles.conversationRow}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Avatar
              firstName={otherParticipant.firstName}
              lastName={otherParticipant.lastName}
              uri={otherParticipant.profilePhoto}
              size="medium"
              showBadge={otherParticipant.verified?.id}
              badgeIcon="check-decagram"
              badgeColor={colors.primary}
            />
            {/* Online indicator */}
            {isUnread && (
              <View
                style={[
                  styles.onlineIndicator,
                  { backgroundColor: colors.primary, borderColor: NEUTRAL_COLORS.white },
                ]}
              />
            )}
          </View>

          {/* Content */}
          <View style={styles.conversationContent}>
            <View style={styles.conversationHeader}>
              <Text
                style={[
                  styles.participantName,
                  isUnread && styles.unreadText,
                ]}
                numberOfLines={1}
              >
                {otherParticipant.firstName} {otherParticipant.lastName}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  isUnread && { color: colors.primary },
                ]}
              >
                {item.lastMessage
                  ? formatRelativeTime(item.lastMessage.createdAt)
                  : ''}
              </Text>
            </View>

            <View style={styles.messagePreviewRow}>
              <Text
                style={[
                  styles.messagePreview,
                  isUnread && styles.unreadText,
                ]}
                numberOfLines={2}
              >
                {isSentByMe ? 'You: ' : ''}
                {item.lastMessage?.text || 'No messages yet'}
              </Text>

              {isUnread && (
                <View
                  style={[
                    styles.unreadBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.unreadBadgeText}>
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Chevron */}
          <Icon
            name="chevron-right"
            size={20}
            color={NEUTRAL_COLORS.gray}
            style={styles.chevron}
          />
        </View>
      </Card>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title="Unable to load messages"
          description={error}
          actionLabel="Try Again"
          onAction={() => fetchConversations()}
        />
      );
    }

    return (
      <EmptyState
        icon="message-text-outline"
        title="No messages yet"
        description="When you book a parking spot or receive a booking, you can chat with the other party here."
      />
    );
  };

  const totalUnread = conversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Stats */}
      {conversations.length > 0 && totalUnread > 0 && (
        <View style={styles.headerBar}>
          <View style={[styles.unreadSummary, { backgroundColor: colors.lightest }]}>
            <Icon name="email-outline" size={20} color={colors.primary} />
            <Text style={[styles.unreadSummaryText, { color: colors.dark }]}>
              {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
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
  headerBar: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  unreadSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  unreadSummaryText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  separator: {
    height: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  conversationCard: {
    padding: SPACING.md,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  onlineIndicator: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: NEUTRAL_COLORS.black,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
  },
  messagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messagePreview: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    flex: 1,
    lineHeight: 20,
  },
  unreadText: {
    fontWeight: '700',
    color: NEUTRAL_COLORS.black,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: SPACING.sm,
  },
  unreadBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
    color: NEUTRAL_COLORS.white,
  },
  chevron: {
    marginLeft: SPACING.sm,
  },
});

export default MessagesScreen;
