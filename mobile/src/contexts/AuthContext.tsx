import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserDTO,
  UserType,
  VehicleDTO,
  PaymentMethodDTO,
  UserProfileDTO,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  CreatePaymentMethodRequest,
} from '@parkingpal/shared-types';
import { STORAGE_KEYS } from '../utils/constants';
import { secureTokenStorage } from '../services/http/secureTokenStorage';
import { authApi, userApi, vehicleApi, paymentApi } from '../services/api';

/** Profile-derived user for screens: UserDTO + optional stats/bio/photo from profile */
export type ProfileUser = UserDTO & {
  avatar?: string | null;
  bio?: string | null;
  stats?: { totalBookings: number; totalSpent: number };
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

/** The UI mode the user is currently viewing – separate from user.userType capability */
export type ActiveMode = 'renter' | 'host';

interface AuthContextType {
  user: ProfileUser | null;
  activeUserMode: ActiveMode;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  vehicles: VehicleDTO[];
  paymentMethods: PaymentMethodDTO[];
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<ProfileUser>) => Promise<void>;
  setUserType: (type: UserType) => Promise<void>;
  /** Switch the active UI mode (does NOT mutate user.userType) */
  switchUserType: (mode: ActiveMode) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addVehicle: (vehicle: CreateVehicleRequest) => Promise<void>;
  updateVehicle: (id: string, vehicle: UpdateVehicleRequest) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  setDefaultVehicle: (id: string) => Promise<void>;
  addPaymentMethod: (method: CreatePaymentMethodRequest) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  sendPhoneCode: (phone: string) => Promise<void>;
  verifyPhone: (code: string) => Promise<boolean>;
  verifyId: (imageUri: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function profileToUser(profile: UserProfileDTO | null): ProfileUser | null {
  if (!profile) return null;
  return {
    ...profile.user,
    avatar: profile.profilePhoto ?? profile.user.profilePhoto,
    bio: profile.bio ?? undefined,
    stats: profile.stats,
  };
}

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Clamp the active UI mode based on the user's actual capability.
 * Only users with capability 'host' or 'superhost' can be in host mode.
 */
function clampMode(mode: ActiveMode, userType: UserType | undefined): ActiveMode {
  if (mode === 'host' && userType !== 'host' && userType !== 'superhost') {
    return 'renter';
  }
  return mode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [activeUserMode, setActiveUserModeState] = useState<ActiveMode>('renter');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const user = profileToUser(profile);
  const vehicles = profile?.vehicles ?? [];
  const paymentMethods = profile?.paymentMethods ?? [];

  const refreshProfile = useCallback(async () => {
    try {
      const p = await userApi.getProfile();
      setProfile(p);
      if (p.user) {
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profileToUser(p)));
        // Clamp active mode: if user lost 'host' capability, fall back to renter
        setActiveUserModeState((prev) => clampMode(prev, p.user.userType as UserType));
      }
    } catch {
      setProfile(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
    }
  }, []);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Restore persisted active mode
        const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.activeUserMode);
        if (savedMode === 'host' || savedMode === 'renter') {
          setActiveUserModeState(savedMode);
        }

        const token = await secureTokenStorage.getAccessToken();
        if (token) {
          await refreshProfile();
        }
        const onboardingStatus = await AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete);
        setIsOnboardingComplete(onboardingStatus === 'true');
      } catch (e) {
        console.error('Error loading auth state:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthState();
  }, [refreshProfile]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user: u, tokens } = await authApi.login(credentials);
      await secureTokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.userType, u.userType);
      const p = await userApi.getProfile();
      setProfile(p);
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profileToUser(p)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      // Placeholder: real implementation would use OAuth and then backend
      throw new Error('Google login not implemented');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    setIsLoading(true);
    try {
      // Placeholder: real implementation would use Sign in with Apple and then backend
      throw new Error('Apple login not implemented');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const { user: u, tokens } = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        userType: 'renter',
      });
      await secureTokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      await AsyncStorage.setItem(STORAGE_KEYS.userType, u.userType);
      const p = await userApi.getProfile();
      setProfile(p);
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profileToUser(p)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      await secureTokenStorage.clearTokens();
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
      await AsyncStorage.removeItem(STORAGE_KEYS.activeUserMode);
      await AsyncStorage.removeItem('vehicles');
      await AsyncStorage.removeItem('payment_methods');
      setProfile(null);
      setActiveUserModeState('renter');
    } catch (e) {
      console.error('Logout error:', e);
      await secureTokenStorage.clearTokens();
      setProfile(null);
      setActiveUserModeState('renter');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<ProfileUser>) => {
    if (!profile) return;
    const updated = await userApi.updateProfile({
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.phone !== undefined && { phone: data.phone ?? undefined }),
      ...(data.profilePhoto !== undefined && { profilePhoto: data.profilePhoto ?? undefined }),
      ...(data.avatar !== undefined && { profilePhoto: data.avatar ?? undefined }),
      ...(data.bio !== undefined && { bio: data.bio }),
    });
    const newProfile: UserProfileDTO = {
      ...profile,
      user: updated,
      bio: data.bio ?? profile.bio,
      profilePhoto: data.profilePhoto ?? data.avatar ?? profile.profilePhoto,
    };
    setProfile(newProfile);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profileToUser(newProfile)));
  }, [profile]);

  const setUserType = useCallback(async (type: UserType) => {
    if (!profile) return;
    setProfile((prev) =>
      prev ? { ...prev, user: { ...prev.user, userType: type } } : null
    );
    await AsyncStorage.setItem(STORAGE_KEYS.userType, type);
  }, [profile]);

  /**
   * Switch the active UI mode. This does NOT change user.userType in the profile –
   * it only changes which navigator is shown. Persisted to AsyncStorage so it
   * survives app restarts.
   */
  const switchUserType = useCallback(async (mode: ActiveMode) => {
    const clamped = clampMode(mode, user?.userType);
    setActiveUserModeState(clamped);
    await AsyncStorage.setItem(STORAGE_KEYS.activeUserMode, clamped);
  }, [user?.userType]);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
    setIsOnboardingComplete(true);
  }, []);

  const addVehicle = useCallback(async (body: CreateVehicleRequest) => {
    const vehicle = await vehicleApi.create(body);
    setProfile((prev) =>
      prev ? { ...prev, vehicles: [...(prev.vehicles ?? []), vehicle] } : null
    );
  }, []);

  const updateVehicle = useCallback(async (id: string, body: UpdateVehicleRequest) => {
    const vehicle = await vehicleApi.update(id, body);
    setProfile((prev) =>
      prev
        ? { ...prev, vehicles: prev.vehicles.map((v) => (v.id === id ? vehicle : v)) }
        : null
    );
  }, []);

  const deleteVehicle = useCallback(async (id: string) => {
    await vehicleApi.delete(id);
    setProfile((prev) =>
      prev ? { ...prev, vehicles: prev.vehicles.filter((v) => v.id !== id) } : null
    );
  }, []);

  const setDefaultVehicle = useCallback(async (id: string) => {
    const vehicle = await vehicleApi.setDefault(id);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            vehicles: prev.vehicles.map((v) =>
              v.id === id ? vehicle : { ...v, isDefault: false }
            ),
          }
        : null
    );
  }, []);

  const addPaymentMethod = useCallback(async (body: CreatePaymentMethodRequest) => {
    const method = await paymentApi.create(body);
    setProfile((prev) =>
      prev ? { ...prev, paymentMethods: [...(prev.paymentMethods ?? []), method] } : null
    );
  }, []);

  const deletePaymentMethod = useCallback(async (id: string) => {
    await paymentApi.delete(id);
    setProfile((prev) =>
      prev ? { ...prev, paymentMethods: prev.paymentMethods.filter((m) => m.id !== id) } : null
    );
  }, []);

  const setDefaultPaymentMethod = useCallback(async (id: string) => {
    const method = await paymentApi.setDefault(id);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            paymentMethods: prev.paymentMethods.map((m) =>
              m.id === id ? method : { ...m, isDefault: false }
            ),
          }
        : null
    );
  }, []);

  const sendPhoneCode = useCallback(async (phone: string): Promise<void> => {
    await authApi.sendPhoneCode({ phone });
  }, []);

  const verifyPhone = useCallback(async (code: string): Promise<boolean> => {
    try {
      await authApi.verifyPhone({ code });
      // Refresh profile to get updated phone verification status
      await refreshProfile();
      return true;
    } catch (error) {
      console.error('Phone verification failed:', error);
      throw error;
    }
  }, []);

  const verifyId = useCallback(async (imageUri: string): Promise<boolean> => {
    if (!profile) return false;
    const formData = new FormData();
    formData.append('idDocument', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'id.jpg',
    } as any);
    const updatedUser = await userApi.verifyId(formData);
    setProfile((prev) => (prev ? { ...prev, user: updatedUser } : null));
    return true;
  }, [profile]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      activeUserMode,
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
      sendPhoneCode,
      verifyPhone,
      verifyId,
      refreshProfile,
    }),
    [
      user,
      activeUserMode,
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
      sendPhoneCode,
      verifyPhone,
      verifyId,
      refreshProfile,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
