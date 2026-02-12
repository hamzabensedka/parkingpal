import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { BookingProvider } from './src/contexts/BookingContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { STRIPE_PUBLISHABLE_KEY, STRIPE_MERCHANT_NAME } from './src/utils/constants';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Opaque status bar – app content starts below the bar */}
        <StatusBar
          translucent={false}
          backgroundColor="#FFFFFF"
          barStyle="dark-content"
        />
        <StripeProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          merchantIdentifier="merchant.com.parkingpal"
          urlScheme="parkingpal"
        >
          <ThemeProvider>
            <AuthProvider>
              <BookingProvider>
                <NotificationProvider>
                  <AppNavigator />
                </NotificationProvider>
              </BookingProvider>
            </AuthProvider>
          </ThemeProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
