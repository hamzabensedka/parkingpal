import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RENTER_COLORS, HOST_COLORS, NEUTRAL_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, STORAGE_KEYS } from '../utils/constants';
import { UserType } from '../types';

/** Active UI mode stored separately from the backend user.userType */
type ActiveMode = 'renter' | 'host';

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
  const [activeMode, setActiveModeState] = useState<ActiveMode>('renter');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved active mode on mount (theme tracks activeUserMode, not userType)
  useEffect(() => {
    const loadActiveMode = async () => {
      try {
        // Read the active UI mode (persisted by AuthContext)
        const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.activeUserMode);
        if (savedMode === 'host' || savedMode === 'renter') {
          setActiveModeState(savedMode);
        }

        // Also load userType for the theme.userType field
        const savedType = await AsyncStorage.getItem(STORAGE_KEYS.userType);
        if (savedType && (savedType === 'renter' || savedType === 'host' || savedType === 'both')) {
          setUserTypeState(savedType as UserType);
        }
      } catch (error) {
        console.error('Error loading theme mode:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadActiveMode();
  }, []);

  // Listen for changes to activeUserMode storage key (written by AuthContext)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const mode = await AsyncStorage.getItem(STORAGE_KEYS.activeUserMode);
        if (mode === 'host' || mode === 'renter') {
          setActiveModeState((prev) => (prev !== mode ? mode : prev));
        }
      } catch {
        // ignore
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Get colors based on active UI mode
  const getColors = useCallback((): ThemeColors => {
    if (activeMode === 'host') {
      return HOST_COLORS;
    }
    return RENTER_COLORS;
  }, [activeMode]);

  // Set user type and persist (still useful for onboarding etc.)
  const setUserType = useCallback(async (type: UserType) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.userType, type);
      setUserTypeState(type);
    } catch (error) {
      console.error('Error saving user type:', error);
    }
  }, []);

  // Toggle between renter and host active mode
  const toggleUserType = useCallback(async () => {
    const newMode: ActiveMode = activeMode === 'host' ? 'renter' : 'host';
    setActiveModeState(newMode);
    await AsyncStorage.setItem(STORAGE_KEYS.activeUserMode, newMode);
  }, [activeMode]);

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
  }), [getColors, userType, activeMode, systemColorScheme]);

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
