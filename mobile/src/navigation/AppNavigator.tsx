import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { NEUTRAL_COLORS } from '../utils/constants';
import AuthNavigator from './AuthNavigator';
import RenterNavigator from './RenterNavigator';
import HostNavigator from './HostNavigator';

// Shared screens
import ChatScreen from '../screens/shared/ChatScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import PaymentMethodsScreen from '../screens/shared/PaymentMethodsScreen';
import AddPaymentCardScreen from '../screens/shared/AddPaymentCardScreen';
import VehiclesScreen from '../screens/shared/VehiclesScreen';
import AddVehicleScreen from '../screens/shared/AddVehicleScreen';
import ReviewScreen from '../screens/shared/ReviewScreen';
import ReportIssueScreen from '../screens/shared/ReportIssueScreen';
import HelpScreen from '../screens/shared/HelpScreen';
import EditProfileScreen from '../screens/shared/EditProfileScreen';
import LegalScreen from '../screens/shared/LegalScreen';

// Renter screens that need to be accessible from anywhere
import SpotDetailScreen from '../screens/renter/SpotDetailScreen';
import BookingDateTimeScreen from '../screens/renter/BookingDateTimeScreen';
import VehicleSelectionScreen from '../screens/renter/VehicleSelectionScreen';
import PaymentReviewScreen from '../screens/renter/PaymentReviewScreen';
import BookingConfirmationScreen from '../screens/renter/BookingConfirmationScreen';
import ActiveBookingScreen from '../screens/renter/ActiveBookingScreen';
import CancelBookingScreen from '../screens/renter/CancelBookingScreen';

// Host screens that need to be accessible from anywhere
import HostActiveBookingScreen from '../screens/host/HostActiveBookingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user, activeUserMode } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return null; // Will show splash from auth navigator
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: theme.colors.primary,
          background: NEUTRAL_COLORS.background,
          card: NEUTRAL_COLORS.white,
          text: NEUTRAL_COLORS.black,
          border: NEUTRAL_COLORS.lightGray,
          notification: NEUTRAL_COLORS.error,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            {/* Main tab navigators based on active UI mode (not user.userType) */}
            {activeUserMode === 'host' ? (
              <Stack.Screen name="HostTabs" component={HostNavigator} />
            ) : (
              <Stack.Screen name="RenterTabs" component={RenterNavigator} />
            )}

            {/* Secondary navigator for opposite mode (for navigation.navigate to work) */}
            {activeUserMode === 'host' ? (
              <Stack.Screen name="RenterTabs" component={RenterNavigator} />
            ) : (
              <Stack.Screen name="HostTabs" component={HostNavigator} />
            )}

            {/* Shared screens accessible from anywhere */}
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                title: 'Chat',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: true,
                title: 'Notifications',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Settings',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="PaymentMethods"
              component={PaymentMethodsScreen}
              options={{
                headerShown: true,
                title: 'Payment Methods',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="AddPaymentCard"
              component={AddPaymentCardScreen}
              options={{
                headerShown: true,
                title: 'Add Card',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="Vehicles"
              component={VehiclesScreen}
              options={{
                headerShown: true,
                title: 'My Vehicles',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="AddVehicle"
              component={AddVehicleScreen}
              options={{
                headerShown: true,
                title: 'Add Vehicle',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="Review"
              component={ReviewScreen}
              options={{
                headerShown: true,
                title: 'Leave Review',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="ReportIssue"
              component={ReportIssueScreen}
              options={{
                headerShown: true,
                title: 'Report Issue',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{
                headerShown: true,
                title: 'Help & Support',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                title: 'Edit Profile',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="Legal"
              component={LegalScreen}
              options={{
                headerShown: true,
                title: 'Terms & Privacy',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />

            {/* Renter booking flow screens */}
            <Stack.Screen
              name="SpotDetail"
              component={SpotDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BookingDateTime"
              component={BookingDateTimeScreen}
              options={{
                headerShown: true,
                title: 'Select Date & Time',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="VehicleSelection"
              component={VehicleSelectionScreen}
              options={{
                headerShown: true,
                title: 'Select Vehicle',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="PaymentReview"
              component={PaymentReviewScreen}
              options={{
                headerShown: true,
                title: 'Review & Pay',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />
            <Stack.Screen
              name="BookingConfirmation"
              component={BookingConfirmationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ActiveBooking"
              component={ActiveBookingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CancelBooking"
              component={CancelBookingScreen}
              options={{
                headerShown: true,
                title: 'Cancel Booking',
                headerStyle: { backgroundColor: NEUTRAL_COLORS.white },
                headerTintColor: NEUTRAL_COLORS.black,
              }}
            />

            {/* Host screens */}
            <Stack.Screen
              name="HostActiveBooking"
              component={HostActiveBookingScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
