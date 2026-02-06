import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types';

// Auth screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import UserTypeScreen from '../screens/auth/UserTypeScreen';
import IDVerificationScreen from '../screens/auth/IDVerificationScreen';
import OnboardingCompleteScreen from '../screens/auth/OnboardingCompleteScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="UserType"
        component={UserTypeScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="IDVerification"
        component={IDVerificationScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="OnboardingComplete"
        component={OnboardingCompleteScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
