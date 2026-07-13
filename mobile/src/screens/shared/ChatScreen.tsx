import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useError } from '../../contexts/ErrorContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../utils/constants';
import { formatTime, formatSmartDate } from '../../utils/formatting';
import { Message } from '../../types';
import { Avatar, EmptyState, ReportUserModal, AnimatedPressable } from '../../components/common';
import { safetyApi } from '../../services/api';
import { parseISO, isSameDay } from 'date-fns';
import { messageApi } from '../../services/api';

type ChatRouteParams = {
  Chat: {
    conversationId: string;
    bookingId: string;
    recipientName: string;
    recipientId: string;
  };
};

interface ChatMessage extends Message {
  showAvatar?: boolean;
  showDate?: boolean;
}

const ChatScreen: React.FC = () => {
  const route = useRoute<RouteProp<ChatRouteParams, 'Chat'>>();
  const navigation = useNavigation<any>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { user } = useAuth();
  const { showError } = useError();

  const { conversationId, bookingId, recipientName, recipientId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Set up header with options menu
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AnimatedPressable
          style={{ padding: SPACING.sm, marginRight: SPACING.xs }}
          onPress={() => setShowMenu(true)}
          haptic
        >
          <Icon name="dots-vertical" size={24} color={NEUTRAL_COLORS.black} />
        </AnimatedPressable>
      ),
    });
  }, [navigation]);

  const handleBlockUser = useCallback(() => {
    setShowMenu(false);
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${recipientName}? They won't be able to contact you or see your listings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await safetyApi.blockUser(recipientId);
              Alert.alert('User Blocked', `${recipientName} has been blocked.`);
              navigation.goBack();
            } catch (err) {
              showError(err);
            }
          },
        },
      ]
    );
  }, [recipientName, recipientId, navigation]);

  const handleReportUser = useCallback(() => {
    setShowMenu(false);
    setShowReportModal(true);
  }, []);

  // Load messages on mount
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const conversation = await messageApi.getConversation(conversationId);
      setMessages(conversation.messages);

      // Mark conversation as read
      if (conversation.unreadCount > 0) {
        await messageApi.markConversationRead(conversationId);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Process messages for display: add date separators and avatar grouping
  const processedMessages = useCallback((): ChatMessage[] => {
    const sorted = [...messages].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sorted.map((msg, index) => {
      const nextMsg = sorted[index + 1];
      const showDate =
        !nextMsg ||
        !isSameDay(parseISO(msg.createdAt), parseISO(nextMsg.createdAt));

      // Show avatar for received messages when the next message is from a different sender or is a different date
      const prevMsg = sorted[index - 1];
      const showAvatar =
        msg.senderId !== user?.id &&
        (!prevMsg || prevMsg.senderId !== msg.senderId || !isSameDay(parseISO(msg.createdAt), parseISO(prevMsg.createdAt)));

      return {
        ...msg,
        showAvatar,
        showDate,
      };
    });
  }, [messages, user?.id]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistically add the message to UI
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      bookingId,
      senderId: user?.id || '',
      receiverId: '',
      text: messageText,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const sentMessage = await messageApi.sendMessage(conversationId, messageText, bookingId);
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? sentMessage : m))
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      // Restore input text
      setInputText(messageText);
      // Could show an error toast here
    } finally {
      setSending(false);
    }
  }, [inputText, sending, conversationId, bookingId, user?.id]);

  const renderDateSeparator = (date: string) => (
    <View style={styles.dateSeparator}>
      <View style={[styles.dateLine, { backgroundColor: NEUTRAL_COLORS.lightGray }]} />
      <Text style={[styles.dateText, { color: NEUTRAL_COLORS.gray }]}>
        {formatSmartDate(date)}
      </Text>
      <View style={[styles.dateLine, { backgroundColor: NEUTRAL_COLORS.lightGray }]} />
    </View>
  );

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isSent = item.senderId === user?.id;

    const recipientParts = recipientName.split(' ');
    const firstName = recipientParts[0] || '';
    const lastName = recipientParts.slice(1).join(' ') || '';

    return (
      <View>
        {/* Date separator (shown below since list is inverted) */}
        {item.showDate && renderDateSeparator(item.createdAt)}

        <View
          style={[
            styles.messageRow,
            isSent ? styles.sentRow : styles.receivedRow,
          ]}
        >
          {/* Avatar for received messages */}
          {!isSent && (
            <View style={styles.messageAvatarContainer}>
              {item.showAvatar ? (
                <Avatar
                  firstName={firstName}
                  lastName={lastName}
                  size="small"
                />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
          )}

          {/* Message Bubble */}
          <View
            style={[
              styles.messageBubble,
              isSent
                ? [styles.sentBubble, { backgroundColor: colors.primary }]
                : [
                    styles.receivedBubble,
                    { backgroundColor: NEUTRAL_COLORS.white, borderColor: NEUTRAL_COLORS.lightGray },
                  ],
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isSent ? NEUTRAL_COLORS.white : NEUTRAL_COLORS.black },
              ]}
            >
              {item.text}
            </Text>
            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  {
                    color: isSent
                      ? 'rgba(255, 255, 255, 0.7)'
                      : NEUTRAL_COLORS.gray,
                  },
                ]}
              >
                {formatTime(item.createdAt)}
              </Text>
              {isSent && (
                <Icon
                  name={item.read ? 'check-all' : 'check'}
                  size={14}
                  color="rgba(255, 255, 255, 0.7)"
                  style={styles.readIcon}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="alert-circle-outline"
            title="Unable to load messages"
            description={error}
            actionLabel="Try Again"
            onAction={fetchMessages}
          />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="message-text-outline"
          title="No messages yet"
          description="Start a conversation by sending a message."
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={processedMessages()}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            inverted
          />
        </Animated.View>

        {/* Input Bar */}
        <Animated.View entering={FadeInUp.delay(100).duration(500).springify()}>
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: NEUTRAL_COLORS.white,
                borderTopColor: NEUTRAL_COLORS.lightGray,
              },
            ]}
          >
            <AnimatedPressable style={styles.attachButton} haptic>
              <Icon name="plus-circle-outline" size={24} color={NEUTRAL_COLORS.gray} />
            </AnimatedPressable>

            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: NEUTRAL_COLORS.background,
                  borderColor: NEUTRAL_COLORS.lightGray,
                },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: NEUTRAL_COLORS.black }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor={NEUTRAL_COLORS.gray}
                multiline
                maxLength={1000}
                editable={!sending}
              />
            </View>

            <AnimatedPressable
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && !sending
                    ? colors.primary
                    : NEUTRAL_COLORS.lightGray,
                },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
              haptic
            >
              {sending ? (
                <ActivityIndicator size="small" color={NEUTRAL_COLORS.white} />
              ) : (
                <Icon
                  name="send"
                  size={20}
                  color={
                    inputText.trim()
                      ? NEUTRAL_COLORS.white
                      : NEUTRAL_COLORS.gray
                  }
                />
              )}
            </AnimatedPressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Options Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <AnimatedPressable
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <Animated.View entering={FadeInDown.duration(300).springify()}>
            <View style={styles.menuContainer}>
              <AnimatedPressable
                style={styles.menuItem}
                onPress={handleReportUser}
                haptic
              >
                <Icon name="flag-outline" size={20} color={NEUTRAL_COLORS.black} />
                <Text style={styles.menuItemText}>Report User</Text>
              </AnimatedPressable>
              <View style={styles.menuDivider} />
              <AnimatedPressable
                style={styles.menuItem}
                onPress={handleBlockUser}
                haptic
              >
                <Icon name="account-cancel" size={20} color="#ef4444" />
                <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Block User</Text>
              </AnimatedPressable>
            </View>
          </Animated.View>
        </AnimatedPressable>
      </Modal>

      {/* Report User Modal */}
      <ReportUserModal
        visible={showReportModal}
        userId={recipientId}
        userName={recipientName}
        relatedId={bookingId}
        relatedType="message"
        onClose={() => setShowReportModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scaleY: -1 }],
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    transform: [{ scaleY: -1 }],
  },

  // Date separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '500',
    paddingHorizontal: SPACING.md,
  },

  // Message rows
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    maxWidth: '80%',
  },
  sentRow: {
    alignSelf: 'flex-end',
  },
  receivedRow: {
    alignSelf: 'flex-start',
  },

  // Avatar
  messageAvatarContainer: {
    marginRight: SPACING.sm,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
  },

  // Bubble
  messageBubble: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxWidth: '100%',
  },
  sentBubble: {
    borderRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.xs,
  },
  receivedBubble: {
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.xs,
    borderWidth: 1,
  },
  messageText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  readIcon: {
    marginLeft: 4,
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    ...SHADOWS.small,
  },
  attachButton: {
    padding: SPACING.sm,
    marginBottom: 2,
  },
  inputContainer: {
    flex: 1,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0,
    minHeight: 40,
    maxHeight: 120,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: TYPOGRAPHY.fontSize.base,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'android' ? SPACING.sm : 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    marginBottom: 2,
  },

  // Options Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: NEUTRAL_COLORS.white,
    borderRadius: RADIUS.md,
    marginTop: 60,
    marginRight: SPACING.md,
    minWidth: 180,
    ...SHADOWS.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.black,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
  },
});

export default ChatScreen;
