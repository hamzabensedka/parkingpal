import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types';
import { useAuth } from './AuthContext';
import { generateId } from '../utils/helpers';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
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
}

// Mock notifications
const getMockNotifications = (userId: string): Notification[] => [
  {
    id: '1',
    userId,
    type: 'booking',
    title: 'Booking Confirmed!',
    body: 'Your booking at "Garage near Louvre" has been confirmed. See you at 2:00 PM!',
    data: { bookingId: 'booking_1' },
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
  },
  {
    id: '2',
    userId,
    type: 'message',
    title: 'New Message',
    body: 'Marie sent you a message about your upcoming booking.',
    data: { conversationId: 'conv_1' },
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    userId,
    type: 'payment',
    title: 'Payment Received',
    body: 'You received €38.40 from your booking. It will be transferred to your bank account.',
    data: { transactionId: 'txn_1' },
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '4',
    userId,
    type: 'review',
    title: 'New Review',
    body: 'Thomas left you a 5-star review! Check it out.',
    data: { reviewId: 'review_1' },
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '5',
    userId,
    type: 'system',
    title: 'Welcome to ParkingPal!',
    body: 'Start exploring parking spots near you or list your own space to earn.',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
];

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user?.id]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Try to load from storage first
      const stored = await AsyncStorage.getItem(`notifications_${user.id}`);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        // Use mock data if no stored notifications
        const mockNotifs = getMockNotifications(user.id);
        setNotifications(mockNotifs);
        await AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(mockNotifs));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Save notifications to storage
  const saveNotifications = useCallback(async (notifs: Notification[]) => {
    if (user) {
      await AsyncStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifs));
    }
  }, [user?.id]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    await saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    const updated = notifications.filter((n) => n.id !== notificationId);
    setNotifications(updated);
    await saveNotifications(updated);
  }, [notifications, saveNotifications]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    setNotifications([]);
    if (user) {
      await AsyncStorage.removeItem(`notifications_${user.id}`);
    }
  }, [user?.id]);

  // Add notification (for local/push notifications)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Calculate unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const contextValue = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      addNotification,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      addNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
