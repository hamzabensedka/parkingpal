import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatting';
import { Conversation } from '../../types';
import { Card, Avatar, Badge, EmptyState } from '../../components/common';

// Mock conversations for display
const mockConversations: Conversation[] = [
  {
    id: 'conv_1',
    bookingId: 'booking_1',
    participants: [
      {
        id: 'user_1',
        email: 'jean@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0612345678',
        userType: 'host',
        verified: { phone: true, id: true },
        rating: 4.8,
        reviewCount: 23,
        memberSince: '2024-01-15',
      },
    ],
    lastMessage: {
      id: 'msg_1',
      bookingId: 'booking_1',
      senderId: 'user_1',
      receiverId: 'current_user',
      text: 'Bonjour ! The parking spot is ready for you. The gate code is 4521.',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'conv_2',
    bookingId: 'booking_2',
    participants: [
      {
        id: 'user_2',
        email: 'marie@example.com',
        firstName: 'Marie',
        lastName: 'Laurent',
        phone: '0698765432',
        userType: 'renter',
        verified: { phone: true, id: false },
        rating: 4.5,
        reviewCount: 12,
        memberSince: '2024-03-20',
      },
    ],
    lastMessage: {
      id: 'msg_2',
      bookingId: 'booking_2',
      senderId: 'current_user',
      receiverId: 'user_2',
      text: 'Thank you! I just left the spot. Everything was perfect.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'conv_3',
    bookingId: 'booking_3',
    participants: [
      {
        id: 'user_3',
        email: 'pierre@example.com',
        firstName: 'Pierre',
        lastName: 'Martin',
        phone: '0655443322',
        userType: 'host',
        verified: { phone: true, id: true },
        rating: 4.9,
        reviewCount: 45,
        memberSince: '2023-11-10',
      },
    ],
    lastMessage: {
      id: 'msg_3',
      bookingId: 'booking_3',
      senderId: 'user_3',
      receiverId: 'current_user',
      text: 'Sure, you can extend your booking until 18h. I will update it now.',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { user } = useAuth();

  const [conversations] = useState<Conversation[]>(mockConversations);

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      const otherParticipant = conversation.participants.find(
        (p) => p.id !== user?.id
      ) || conversation.participants[0];

      navigation.navigate('Chat', {
        conversationId: conversation.id,
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
              showBadge={otherParticipant.verified.id}
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

  const renderEmptyState = () => (
    <EmptyState
      icon="message-text-outline"
      title="No messages yet"
      description="When you book a parking spot or receive a booking, you can chat with the other party here."
    />
  );

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
