import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import type { Subscription, NotificationResponse } from 'expo-notifications';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { notificationApi } from '../services/api';
import {
  registerForPushNotificationsAsync,
  setupAndroidNotificationChannel,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getLastNotificationResponse,
  setBadgeCount,
} from '../services/pushNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pushEnabled: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  handleNotificationResponse: (response: NotificationResponse) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
  onNotificationPress?: (data: Record<string, unknown>) => void;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  onNotificationPress,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);

  const notificationReceivedListener = useRef<Subscription | null>(null);
  const notificationResponseListener = useRef<Subscription | null>(null);
  const appState = useRef(AppState.currentState);

  // Handle notification response (user taps notification)
  const handleNotificationResponse = useCallback((response: NotificationResponse) => {
    const data = response.notification.request.content.data as Record<string, unknown>;
    console.log('Notification tapped:', data);

    if (onNotificationPress && data) {
      onNotificationPress(data);
    }
  }, [onNotificationPress]);

  // Setup push notifications
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (!isAuthenticated || !user) return;

      try {
        // Setup Android channels
        await setupAndroidNotificationChannel();

        // Register for push notifications
        const token = await registerForPushNotificationsAsync();

        if (token) {
          // Send token to backend
          await notificationApi.registerPushToken(token, true);
          setPushEnabled(true);
          console.log('Push token registered:', token);
        }
      } catch (err) {
        console.error('Error setting up push notifications:', err);
        setPushEnabled(false);
      }
    };

    setupPushNotifications();
  }, [isAuthenticated, user?.id]);

  // Setup notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationReceivedListener.current = addNotificationReceivedListener((_notification) => {
      // Refresh notifications when a push is received
      fetchNotifications();
    });

    // Listener for notification responses (user taps notification)
    notificationResponseListener.current = addNotificationResponseReceivedListener(handleNotificationResponse);

    // Check for notification response that opened the app
    getLastNotificationResponse().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => {
      if (notificationReceivedListener.current) {
        notificationReceivedListener.current.remove();
      }
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
    };
  }, [handleNotificationResponse]);

  // Refresh notifications when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        if (isAuthenticated) {
          refreshUnreadCount();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user?.id]);

  // Update badge count when unread count changes
  useEffect(() => {
    setBadgeCount(unreadCount);
  }, [unreadCount]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await notificationApi.list({ limit: 50, offset: 0 });
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Refresh just the unread count (lighter operation)
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error refreshing unread count:', err);
    }
  }, [isAuthenticated]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const notificationToDelete = notifications.find((n) => n.id === notificationId);

      await notificationApi.delete(notificationId);

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // Update unread count if the deleted notification was unread
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [notifications]);

  const contextValue = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      pushEnabled,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshUnreadCount,
      handleNotificationResponse,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      pushEnabled,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshUnreadCount,
      handleNotificationResponse,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
