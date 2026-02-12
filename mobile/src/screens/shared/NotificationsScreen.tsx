import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { NEUTRAL_COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';
import { Card, EmptyState } from '../../components/common';
import { format, isToday, isYesterday } from 'date-fns';
import { Notification } from '../../types';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return 'calendar-check';
      case 'message': return 'message-text';
      case 'payment': return 'credit-card';
      case 'review': return 'star';
      case 'system': return 'bell';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking': return colors.primary;
      case 'message': return NEUTRAL_COLORS.darkGray;
      case 'payment': return colors.primary;
      case 'review': return NEUTRAL_COLORS.darkGray;
      case 'system': return NEUTRAL_COLORS.gray;
      default: return NEUTRAL_COLORS.gray;
    }
  };

  const getDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d');
  };

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on type and data
    const data = notification.data as Record<string, unknown> | undefined;

    switch (notification.type) {
      case 'booking':
        if (data?.bookingId) {
          navigation.navigate('ActiveBooking', { bookingId: data.bookingId });
        }
        break;
      case 'message':
        if (data?.conversationId) {
          navigation.navigate('Chat', {
            conversationId: data.conversationId,
            bookingId: data.bookingId,
            recipientName: data.recipientName || 'User',
          });
        }
        break;
      case 'review':
        if (data?.bookingId) {
          navigation.navigate('ActiveBooking', { bookingId: data.bookingId });
        }
        break;
      case 'payment':
        if (data?.bookingId) {
          navigation.navigate('ActiveBooking', { bookingId: data.bookingId });
        }
        break;
    }
  }, [navigation, markAsRead]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleRefresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Group notifications by date
  const groupedNotifications = notifications.reduce<Record<string, Notification[]>>(
    (groups, notification) => {
      const label = getDateLabel(notification.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(notification);
      return groups;
    },
    {}
  );

  const sections = Object.entries(groupedNotifications);

  const renderNotification = (notification: Notification) => {
    const iconColor = getNotificationColor(notification.type);

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.read && { backgroundColor: colors.lightest },
        ]}
        onPress={() => handleNotificationPress(notification)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
          <Icon name={getNotificationIcon(notification.type)} size={22} color={iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationTitle,
            !notification.read && { fontWeight: '700' },
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationBody} numberOfLines={2}>
            {notification.body}
          </Text>
          <Text style={styles.notificationTime}>
            {format(new Date(notification.createdAt), 'HH:mm')}
          </Text>
        </View>
        {!notification.read && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  // Show loading state
  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          icon="alert-circle"
          title="Unable to load notifications"
          description={error}
        />
      </SafeAreaView>
    );
  }

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
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: NEUTRAL_COLORS.gray,
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
