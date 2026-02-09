import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { NEUTRAL_COLORS } from '../utils/constants';
import { useNotifications } from '../contexts/NotificationContext';
import { HostTabParamList } from '../types';

// Host screens
import HostDashboardScreen from '../screens/host/HostDashboardScreen';
import AddListingLocationScreen from '../screens/host/AddListingLocationScreen';
import AddListingPhotosScreen from '../screens/host/AddListingPhotosScreen';
import AddListingDetailsScreen from '../screens/host/AddListingDetailsScreen';
import AddListingAccessScreen from '../screens/host/AddListingAccessScreen';
import AddListingPricingScreen from '../screens/host/AddListingPricingScreen';
import AddListingAvailabilityScreen from '../screens/host/AddListingAvailabilityScreen';
import AddListingDescriptionScreen from '../screens/host/AddListingDescriptionScreen';
import AddListingPreviewScreen from '../screens/host/AddListingPreviewScreen';
import ListingManagementScreen from '../screens/host/ListingManagementScreen';
import EarningsScreen from '../screens/host/EarningsScreen';
import HostProfileScreen from '../screens/host/HostProfileScreen';

// Shared screens
import MessagesScreen from '../screens/shared/MessagesScreen';

const Tab = createBottomTabNavigator<HostTabParamList>();
const DashboardStack = createNativeStackNavigator();
const ListingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Dashboard Stack Navigator
const DashboardStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
        headerTintColor: NEUTRAL_COLORS.black,
      }}
    >
      <DashboardStack.Screen
        name="DashboardMain"
        component={HostDashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <DashboardStack.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ title: 'Earnings' }}
      />
    </DashboardStack.Navigator>
  );
};

// Listings Stack Navigator
const ListingsStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ListingsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
        headerTintColor: NEUTRAL_COLORS.black,
      }}
    >
      <ListingsStack.Screen
        name="ListingsMain"
        component={ListingManagementScreen}
        options={{ title: 'My Listings' }}
      />
      <ListingsStack.Screen
        name="AddListingLocation"
        component={AddListingLocationScreen}
        options={{ title: 'Add Listing' }}
      />
      <ListingsStack.Screen
        name="AddListingPhotos"
        component={AddListingPhotosScreen}
        options={{ title: 'Add Photos' }}
      />
      <ListingsStack.Screen
        name="AddListingDetails"
        component={AddListingDetailsScreen}
        options={{ title: 'Spot Details' }}
      />
      <ListingsStack.Screen
        name="AddListingAccess"
        component={AddListingAccessScreen}
        options={{ title: 'Access Instructions' }}
      />
      <ListingsStack.Screen
        name="AddListingPricing"
        component={AddListingPricingScreen}
        options={{ title: 'Set Pricing' }}
      />
      <ListingsStack.Screen
        name="AddListingAvailability"
        component={AddListingAvailabilityScreen}
        options={{ title: 'Availability' }}
      />
      <ListingsStack.Screen
        name="AddListingDescription"
        component={AddListingDescriptionScreen}
        options={{ title: 'Description' }}
      />
      <ListingsStack.Screen
        name="AddListingPreview"
        component={AddListingPreviewScreen}
        options={{ title: 'Preview' }}
      />
    </ListingsStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
        headerTintColor: NEUTRAL_COLORS.black,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={HostProfileScreen}
        options={{ title: 'Profile' }}
      />
    </ProfileStack.Navigator>
  );
};

/**
 * Returns true when the focused route inside the Listings stack
 * is one of the AddListing* wizard screens.
 */
function isOnAddListingRoute(route: RouteProp<HostTabParamList, 'Listings'>): boolean {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'ListingsMain';
  return routeName.startsWith('AddListing');
}

const defaultTabBarStyle = {
  backgroundColor: NEUTRAL_COLORS.white,
  borderTopWidth: 1,
  borderTopColor: NEUTRAL_COLORS.lightGray,
  borderTopStyle: 'solid' as const,
  paddingBottom: 8,
  paddingTop: 8,
  height: 60,
};

const hiddenTabBarStyle = {
  ...defaultTabBarStyle,
  display: 'none' as const,
};

const HostNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: NEUTRAL_COLORS.gray,
        tabBarStyle: defaultTabBarStyle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500' as const,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          // Always outline icons (Airbnb-style)
          switch (route.name) {
            case 'Dashboard':
              iconName = 'view-dashboard-outline';
              break;
            case 'Listings':
              iconName = 'home-city-outline';
              break;
            case 'Messages':
              iconName = 'message-outline';
              break;
            case 'Profile':
              iconName = 'account-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Listings"
        component={ListingsStackNavigator}
        options={({ route }) => ({
          title: 'Listings',
          // Hide the tab bar on AddListing* routes for renter users
          // (hosts/both keep the tab bar visible throughout)
          tabBarStyle:
            user?.userType === 'renter' && isOnAddListingRoute(route as RouteProp<HostTabParamList, 'Listings'>)
              ? hiddenTabBarStyle
              : defaultTabBarStyle,
        })}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Messages',
          headerShown: true,
          headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
          headerTintColor: NEUTRAL_COLORS.black,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: NEUTRAL_COLORS.error,
            fontSize: 10,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default HostNavigator;
