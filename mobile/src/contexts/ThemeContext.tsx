import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RENTER_COLORS, HOST_COLORS, NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, STORAGE_KEYS } from '../utils/constants';
import { UserType } from '../types';

// Theme colors type
export type ThemeColors = typeof RENTER_COLORS | typeof HOST_COLORS;

// Combined theme type
export interface Theme {
  colors: ThemeColors;
  NEUTRAL_COLORS: typeof NEUTRAL_COLORS;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  shadows: typeof SHADOWS;
  userType: UserType | null;
  isDark: boolean;
}

// Context type
interface ThemeContextType {
  theme: Theme;
  userType: UserType | null;
  setUserType: (type: UserType) => Promise<void>;
  toggleUserType: () => Promise<void>;
  colors: ThemeColors;
  NEUTRAL_COLORS: typeof NEUTRAL_COLORS;
}

// Default value so consumers never get undefined NEUTRAL_COLORS (e.g. before provider is ready)
const defaultThemeContextValue: ThemeContextType = {
  theme: {
    colors: RENTER_COLORS,
    NEUTRAL_COLORS: NEUTRAL_COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    userType: null,
    isDark: false,
  },
  userType: null,
  setUserType: async () => {},
  toggleUserType: async () => {},
  colors: RENTER_COLORS,
  NEUTRAL_COLORS: NEUTRAL_COLORS,
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContextValue);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  return context ?? defaultThemeContextValue;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [userType, setUserTypeState] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved user type on mount
  useEffect(() => {
    const loadUserType = async () => {
      try {
        const savedType = await AsyncStorage.getItem(STORAGE_KEYS.userType);
        if (savedType && (savedType === 'renter' || savedType === 'host' || savedType === 'both')) {
          setUserTypeState(savedType as UserType);
        }
      } catch (error) {
        console.error('Error loading user type:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserType();
  }, []);

  // Get colors based on user type
  const getColors = useCallback((): ThemeColors => {
    if (userType === 'host') {
      return HOST_COLORS;
    }
    // Default to renter colors
    return RENTER_COLORS;
  }, [userType]);

  // Set user type and persist
  const setUserType = useCallback(async (type: UserType) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.userType, type);
      setUserTypeState(type);
    } catch (error) {
      console.error('Error saving user type:', error);
    }
  }, []);

  // Toggle between renter and host
  const toggleUserType = useCallback(async () => {
    const newType: UserType = userType === 'host' ? 'renter' : 'host';
    await setUserType(newType);
  }, [userType, setUserType]);

  // Build complete theme object
  const theme = useMemo<Theme>(() => ({
    colors: getColors(),
    NEUTRAL_COLORS: NEUTRAL_COLORS,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
    userType,
    isDark: systemColorScheme === 'dark',
  }), [getColors, userType, systemColorScheme]);

  const contextValue = useMemo<ThemeContextType>(() => ({
    theme,
    userType,
    setUserType,
    toggleUserType,
    colors: getColors(),
    NEUTRAL_COLORS: NEUTRAL_COLORS,
  }), [theme, userType, setUserType, toggleUserType, getColors]);

  // Always render the Provider so NEUTRAL_COLORS (and theme) are always available.
  // When loading, still provide context and render children so no "NEUTRAL_COLORS doesn't exist" error.
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
