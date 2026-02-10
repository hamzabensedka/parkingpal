import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { NEUTRAL_COLORS } from '../utils/constants';
import { useNotifications } from '../contexts/NotificationContext';
import { RenterTabParamList, RenterStackParamList } from '../types';

// Renter screens
import MapScreen from '../screens/renter/MapScreen';
import SearchScreen from '../screens/renter/SearchScreen';
import FiltersScreen from '../screens/renter/FiltersScreen';
import SearchResultsScreen from '../screens/renter/SearchResultsScreen';
import BookingHistoryScreen from '../screens/renter/BookingHistoryScreen';
import SavedSpotsScreen from '../screens/renter/SavedSpotsScreen';
import RenterProfileScreen from '../screens/renter/RenterProfileScreen';

// Shared screens
import MessagesScreen from '../screens/shared/MessagesScreen';

const Tab = createBottomTabNavigator<RenterTabParamList>();
const MapStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Map Stack Navigator
const MapStackNavigator: React.FC = () => {
  return (
    <MapStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MapStack.Screen name="MapMain" component={MapScreen} />
      <MapStack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          headerShown: true,
          title: 'Search',
          headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
          headerTintColor: NEUTRAL_COLORS.black,
          animation: 'slide_from_bottom',
        }}
      />
      <MapStack.Screen
        name="Filters"
        component={FiltersScreen}
        options={{
          headerShown: true,
          title: 'Filters',
          headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
          headerTintColor: NEUTRAL_COLORS.black,
          presentation: 'modal',
        }}
      />
      <MapStack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{
          headerShown: true,
          title: 'Search Results',
          headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
          headerTintColor: NEUTRAL_COLORS.black,
        }}
      />
    </MapStack.Navigator>
  );
};

// Bookings Stack Navigator
const BookingsStackNavigator: React.FC = () => {
  return (
    <BookingsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
        headerTintColor: NEUTRAL_COLORS.black,
      }}
    >
      <BookingsStack.Screen
        name="BookingHistoryMain"
        component={BookingHistoryScreen}
        options={{ title: 'My Bookings' }}
      />
      <BookingsStack.Screen
        name="SavedSpots"
        component={SavedSpotsScreen}
        options={{ title: 'Saved Spots' }}
      />
    </BookingsStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator: React.FC = () => {
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
        component={RenterProfileScreen}
        options={{ title: 'Profile' }}
      />
    </ProfileStack.Navigator>
  );
};

const RenterNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ flex: 1, backgroundColor: NEUTRAL_COLORS.white }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: NEUTRAL_COLORS.gray,
          tabBarStyle: {
            backgroundColor: NEUTRAL_COLORS.white,
            borderTopWidth: 1,
            borderTopColor: NEUTRAL_COLORS.lightGray,
            paddingTop: 8,
            paddingBottom: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: string;
            switch (route.name) {
              case 'Map':
                iconName = 'map-outline';
                break;
              case 'Bookings':
                iconName = 'calendar-check-outline';
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
          name="Map"
          component={MapStackNavigator}
          options={{ title: 'Explore' }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingsStackNavigator}
          options={{ title: 'Bookings' }}
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
    </SafeAreaView>
  );
};

export default RenterNavigator;
