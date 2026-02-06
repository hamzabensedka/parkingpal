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
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../utils/constants';
import { Card, EmptyState } from '../../components/common';
import { format, isToday, isYesterday, subDays, subHours } from 'date-fns';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'system' | 'promo';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  data?: Record<string, any>;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    body: 'Your booking at City Center Garage has been confirmed for tomorrow at 10:00.',
    timestamp: new Date().toISOString(),
    isRead: false,
    data: { bookingId: 'b1' },
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message from Jean',
    body: 'Hi! The gate code for entrance is 1234. See you tomorrow!',
    timestamp: subHours(new Date(), 2).toISOString(),
    isRead: false,
    data: { conversationId: 'c1' },
  },
  {
    id: '3',
    type: 'system',
    title: 'Booking Reminder',
    body: 'Your parking session starts in 1 hour at Opera Parking.',
    timestamp: subHours(new Date(), 5).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    type: 'promo',
    title: 'Weekend Special!',
    body: 'Get 20% off your next booking with code WEEKEND20. Valid this weekend only.',
    timestamp: subDays(new Date(), 1).toISOString(),
    isRead: true,
  },
  {
    id: '5',
    type: 'booking',
    title: 'Booking Completed',
    body: 'Your parking session at Marais Parking has ended. Don\'t forget to leave a review!',
    timestamp: subDays(new Date(), 1).toISOString(),
    isRead: true,
    data: { bookingId: 'b2' },
  },
  {
    id: '6',
    type: 'system',
    title: 'Account Verified',
    body: 'Your ID has been verified successfully. You now have full access to all features.',
    timestamp: subDays(new Date(), 3).toISOString(),
    isRead: true,
  },
];

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return 'calendar-check';
      case 'message': return 'message-text';
      case 'system': return 'bell';
      case 'promo': return 'tag';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return colors.primary;
      case 'message': return NEUTRAL_COLORS.darkGray;
      case 'system': return NEUTRAL_COLORS.gray;
      case 'promo': return NEUTRAL_COLORS.darkGray;
    }
  };

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d');
  };

  const handleNotificationPress = useCallback((notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );

    // Navigate based on type
    switch (notification.type) {
      case 'booking':
        if (notification.data?.bookingId) {
          navigation.navigate('ActiveBooking', { bookingId: notification.data.bookingId });
        }
        break;
      case 'message':
        if (notification.data?.conversationId) {
          navigation.navigate('Chat', { conversationId: notification.data.conversationId });
        }
        break;
    }
  }, [navigation]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  // Group notifications by date
  const groupedNotifications = notifications.reduce<Record<string, Notification[]>>(
    (groups, notification) => {
      const label = getDateLabel(notification.timestamp);
      if (!groups[label]) groups[label] = [];
      groups[label].push(notification);
      return groups;
    },
    {}
  );

  const sections = Object.entries(groupedNotifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = (notification: Notification) => {
    const iconColor = getNotificationColor(notification.type);

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.isRead && { backgroundColor: colors.lightest },
        ]}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Icon name={getNotificationIcon(notification.type)} size={22} color={iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationTitle,
            !notification.isRead && { fontWeight: '700' },
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {notification.body}
          </Text>
          <Text style={styles.notificationTime}>
            {format(new Date(notification.timestamp), 'HH:mm')}
          </Text>
        </View>
        {!notification.isRead && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Actions */}
      {unreadCount > 0 && (
        <View style={styles.headerActions}>
          <Text style={styles.unreadText}>{unreadCount} unread</Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon="bell-off"
          title="No notifications"
          description="You're all caught up! New notifications will appear here."
        />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={([label]) => label}
          renderItem={({ item: [label, items] }) => (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{label}</Text>
              <Card style={styles.sectionCard}>
                {items.map((notification, index) => (
                  <View key={notification.id}>
                    {renderNotification(notification)}
                    {index < items.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
              </Card>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL_COLORS.background,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: NEUTRAL_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.lightGray,
  },
  unreadText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.gray,
  },
  markAllRead: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: NEUTRAL_COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: NEUTRAL_COLORS.black,
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: NEUTRAL_COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: NEUTRAL_COLORS.gray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: SPACING.sm,
    marginTop: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: NEUTRAL_COLORS.lightGray,
    marginLeft: 60 + SPACING.md,
  },
});

export default NotificationsScreen;
