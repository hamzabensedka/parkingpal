import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, UserType, Vehicle, PaymentMethod } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { mockUsers } from '../data/mockUsers';

const DEFAULT_VEHICLE: Vehicle = {
  id: 'vehicle_default',
  make: 'Toyota',
  model: 'Yaris',
  licensePlate: 'AB-123-CD',
  color: 'Silver',
  type: 'sedan',
  isDefault: true,
};

const DEFAULT_PAYMENT_CARD: PaymentMethod = {
  id: 'payment_default',
  type: 'card',
  last4: '4242',
  brand: 'Visa',
  expiryMonth: 12,
  expiryYear: 2028,
  isDefault: true,
};

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  vehicles: Vehicle[];
  paymentMethods: PaymentMethod[];
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUserType: (type: UserType) => Promise<void>;
  switchUserType: (type: UserType) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setDefaultVehicle: (id: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<boolean>;
  verifyId: (imageUri: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  // Load auth state on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Check for stored token
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.authToken);

        if (token) {
          // Load user data
          const userData = await AsyncStorage.getItem(STORAGE_KEYS.user);
          if (userData) {
            setUser(JSON.parse(userData));
          }

          // Load vehicles (seed default if none)
          const vehiclesData = await AsyncStorage.getItem('vehicles');
          if (vehiclesData) {
            const parsed = JSON.parse(vehiclesData);
            setVehicles(Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_VEHICLE]);
            if (!parsed?.length) {
              await AsyncStorage.setItem('vehicles', JSON.stringify([DEFAULT_VEHICLE]));
            }
          } else {
            setVehicles([DEFAULT_VEHICLE]);
            await AsyncStorage.setItem('vehicles', JSON.stringify([DEFAULT_VEHICLE]));
          }

          // Load payment methods (seed default card if none)
          const paymentsData = await AsyncStorage.getItem('payment_methods');
          if (paymentsData) {
            const parsed = JSON.parse(paymentsData);
            setPaymentMethods(Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_PAYMENT_CARD]);
            if (!parsed?.length) {
              await AsyncStorage.setItem('payment_methods', JSON.stringify([DEFAULT_PAYMENT_CARD]));
            }
          } else {
            setPaymentMethods([DEFAULT_PAYMENT_CARD]);
            await AsyncStorage.setItem('payment_methods', JSON.stringify([DEFAULT_PAYMENT_CARD]));
          }
        }

        // Check onboarding status
        const onboardingStatus = await AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete);
        setIsOnboardingComplete(onboardingStatus === 'true');
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Save user to storage
  const saveUser = useCallback(async (userData: User | null) => {
    if (userData) {
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
    }
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find user in mock data
      const foundUser = mockUsers.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // In real app, validate password here
      // For mock, accept any password

      // Generate mock token
      const token = `mock_token_${Date.now()}`;
      await SecureStore.setItemAsync(STORAGE_KEYS.authToken, token);

      // Save user
      setUser(foundUser);
      await saveUser(foundUser);

      // Set user type
      await AsyncStorage.setItem(STORAGE_KEYS.userType, foundUser.userType);

      // Seed default vehicle if account has none (so user can proceed to payment)
      if (vehicles.length === 0) {
        setVehicles([DEFAULT_VEHICLE]);
        await AsyncStorage.setItem('vehicles', JSON.stringify([DEFAULT_VEHICLE]));
      }

      // Seed default payment card if account has none
      if (paymentMethods.length === 0) {
        setPaymentMethods([DEFAULT_PAYMENT_CARD]);
        await AsyncStorage.setItem('payment_methods', JSON.stringify([DEFAULT_PAYMENT_CARD]));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUser, vehicles, paymentMethods]);

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Use first mock user for demo
      const googleUser = mockUsers[0];

      const token = `google_token_${Date.now()}`;
      await SecureStore.setItemAsync(STORAGE_KEYS.authToken, token);

      setUser(googleUser);
      await saveUser(googleUser);
      await AsyncStorage.setItem(STORAGE_KEYS.userType, googleUser.userType);
      if (vehicles.length === 0) {
        setVehicles([DEFAULT_VEHICLE]);
        await AsyncStorage.setItem('vehicles', JSON.stringify([DEFAULT_VEHICLE]));
      }
      if (paymentMethods.length === 0) {
        setPaymentMethods([DEFAULT_PAYMENT_CARD]);
        await AsyncStorage.setItem('payment_methods', JSON.stringify([DEFAULT_PAYMENT_CARD]));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUser, vehicles, paymentMethods]);

  // Login with Apple
  const loginWithApple = useCallback(async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const appleUser = mockUsers[1];

      const token = `apple_token_${Date.now()}`;
      await SecureStore.setItemAsync(STORAGE_KEYS.authToken, token);

      setUser(appleUser);
      await saveUser(appleUser);
      await AsyncStorage.setItem(STORAGE_KEYS.userType, appleUser.userType);
      if (vehicles.length === 0) {
        setVehicles([DEFAULT_VEHICLE]);
        await AsyncStorage.setItem('vehicles', JSON.stringify([DEFAULT_VEHICLE]));
      }
      if (paymentMethods.length === 0) {
        setPaymentMethods([DEFAULT_PAYMENT_CARD]);
        await AsyncStorage.setItem('payment_methods', JSON.stringify([DEFAULT_PAYMENT_CARD]));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUser, vehicles, paymentMethods]);

  // Sign up
  const signup = useCallback(async (data: SignUpData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newUser: User = {
        id: `user_${Date.now()}`,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        userType: 'renter',
        verified: {
          phone: false,
          id: false,
        },
        rating: 0,
        reviewCount: 0,
        memberSince: new Date().toISOString(),
      };

      const token = `signup_token_${Date.now()}`;
      await SecureStore.setItemAsync(STORAGE_KEYS.authToken, token);

      setUser(newUser);
      await saveUser(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.userType, newUser.userType);
      setVehicles([DEFAULT_VEHICLE]);
      await AsyncStorage.setItem('vehicles', JSON.stringify([DEFAULT_VEHICLE]));
      setPaymentMethods([DEFAULT_PAYMENT_CARD]);
      await AsyncStorage.setItem('payment_methods', JSON.stringify([DEFAULT_PAYMENT_CARD]));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [saveUser]);

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
      await AsyncStorage.removeItem('vehicles');
      await AsyncStorage.removeItem('payment_methods');

      setUser(null);
      setVehicles([]);
      setPaymentMethods([]);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      await saveUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }, [user, saveUser]);

  // Set user type
  const setUserType = useCallback(async (type: UserType) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, userType: type };
      setUser(updatedUser);
      await saveUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEYS.userType, type);
    } catch (error) {
      throw error;
    }
  }, [user, saveUser]);

  // Switch user type (alias for setUserType for backwards compatibility)
  const switchUserType = useCallback(async (type: UserType) => {
    await setUserType(type);
  }, [setUserType]);

  // Complete onboarding
  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
    setIsOnboardingComplete(true);
  }, []);

  // Add vehicle
  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `vehicle_${Date.now()}`,
    };

    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  }, [vehicles]);

  // Update vehicle
  const updateVehicle = useCallback(async (id: string, data: Partial<Vehicle>) => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === id ? { ...v, ...data } : v
    );
    setVehicles(updatedVehicles);
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  }, [vehicles]);

  // Delete vehicle
  const deleteVehicle = useCallback(async (id: string) => {
    const updatedVehicles = vehicles.filter((v) => v.id !== id);
    setVehicles(updatedVehicles);
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  }, [vehicles]);

  // Set default vehicle
  const setDefaultVehicle = useCallback(async (id: string) => {
    const updatedVehicles = vehicles.map((v) => ({
      ...v,
      isDefault: v.id === id,
    }));
    setVehicles(updatedVehicles);
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
  }, [vehicles]);

  // Add payment method
  const addPaymentMethod = useCallback(async (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: `payment_${Date.now()}`,
    };

    const updatedMethods = [...paymentMethods, newMethod];
    setPaymentMethods(updatedMethods);
    await AsyncStorage.setItem('payment_methods', JSON.stringify(updatedMethods));
  }, [paymentMethods]);

  // Delete payment method
  const deletePaymentMethod = useCallback(async (id: string) => {
    const updatedMethods = paymentMethods.filter((m) => m.id !== id);
    setPaymentMethods(updatedMethods);
    await AsyncStorage.setItem('payment_methods', JSON.stringify(updatedMethods));
  }, [paymentMethods]);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    const updatedMethods = paymentMethods.map((m) => ({
      ...m,
      isDefault: m.id === id,
    }));
    setPaymentMethods(updatedMethods);
    await AsyncStorage.setItem('payment_methods', JSON.stringify(updatedMethods));
  }, [paymentMethods]);

  // Verify phone
  const verifyPhone = useCallback(async (code: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Accept any 6-digit code for demo
    if (code.length === 6 && user) {
      const updatedUser = {
        ...user,
        verified: { ...user.verified, phone: true },
      };
      setUser(updatedUser);
      await saveUser(updatedUser);
      return true;
    }
    return false;
  }, [user, saveUser]);

  // Verify ID
  const verifyId = useCallback(async (imageUri: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Accept any image for demo
    if (imageUri && user) {
      const updatedUser = {
        ...user,
        verified: { ...user.verified, id: true },
      };
      setUser(updatedUser);
      await saveUser(updatedUser);
      return true;
    }
    return false;
  }, [user, saveUser]);

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    isOnboardingComplete,
    vehicles,
    paymentMethods,
    login,
    loginWithGoogle,
    loginWithApple,
    signup,
    logout,
    updateProfile,
    setUserType,
    switchUserType,
    completeOnboarding,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setDefaultVehicle,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    verifyPhone,
    verifyId,
  }), [
    user,
    isLoading,
    isOnboardingComplete,
    vehicles,
    paymentMethods,
    login,
    loginWithGoogle,
    loginWithApple,
    signup,
    logout,
    updateProfile,
    setUserType,
    switchUserType,
    completeOnboarding,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setDefaultVehicle,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    verifyPhone,
    verifyId,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
