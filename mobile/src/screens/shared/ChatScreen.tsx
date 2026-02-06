import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../utils/constants';
import { formatTime, formatSmartDate } from '../../utils/formatting';
import { Message } from '../../types';
import { Avatar, EmptyState } from '../../components/common';
import { parseISO, isSameDay } from 'date-fns';

type ChatRouteParams = {
  Chat: {
    conversationId: string;
    recipientName: string;
  };
};

interface ChatMessage extends Message {
  showAvatar?: boolean;
  showDate?: boolean;
}

// Mock messages for display
const generateMockMessages = (conversationId: string): Message[] => [
  {
    id: 'msg_1',
    bookingId: 'booking_1',
    senderId: 'other_user',
    receiverId: 'current_user',
    text: 'Bonjour ! Welcome to ParkingPal. Your booking has been confirmed.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'msg_2',
    bookingId: 'booking_1',
    senderId: 'current_user',
    receiverId: 'other_user',
    text: 'Thank you! What is the gate code?',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
  },
  {
    id: 'msg_3',
    bookingId: 'booking_1',
    senderId: 'other_user',
    receiverId: 'current_user',
    text: 'The gate code is 4521. Please make sure to close the gate behind you when entering and leaving.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: 'msg_4',
    bookingId: 'booking_1',
    senderId: 'current_user',
    receiverId: 'other_user',
    text: 'Got it, thanks!',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    id: 'msg_5',
    bookingId: 'booking_1',
    senderId: 'other_user',
    receiverId: 'current_user',
    text: 'The parking spot is the second one on the left as you enter. It has a blue marker on the ground.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'msg_6',
    bookingId: 'booking_1',
    senderId: 'other_user',
    receiverId: 'current_user',
    text: 'Let me know if you need anything else!',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ChatRouteParams, 'Chat'>>();
  const { colors, NEUTRAL_COLORS } = useTheme();
  const { user } = useAuth();

  const { conversationId, recipientName } = route.params;

  const [messages, setMessages] = useState<Message[]>(
    generateMockMessages(conversationId)
  );
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

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

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      bookingId: 'booking_1',
      senderId: user?.id || 'current_user',
      receiverId: 'other_user',
      text: inputText.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  }, [inputText, user?.id]);

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
    const isSent = item.senderId === user?.id || item.senderId === 'current_user';

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

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon="message-text-outline"
        title="No messages yet"
        description="Start a conversation by sending a message."
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages List */}
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

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: NEUTRAL_COLORS.white,
              borderTopColor: NEUTRAL_COLORS.lightGray,
            },
          ]}
        >
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="plus-circle-outline" size={24} color={NEUTRAL_COLORS.gray} />
          </TouchableOpacity>

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
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? colors.primary
                  : NEUTRAL_COLORS.lightGray,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon
              name="send"
              size={20}
              color={
                inputText.trim()
                  ? NEUTRAL_COLORS.white
                  : NEUTRAL_COLORS.gray
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
});

export default ChatScreen;
