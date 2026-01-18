import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { storage, STORAGE_KEYS } from '../storage';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  border: string;
  error: string;
  success: string;
  tabBarBackground: string;
  tabBarInactive: string;
}

const lightColors: ThemeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#2E7D32',
  primaryLight: '#81C784',
  primaryDark: '#1B5E20',
  border: '#e0e0e0',
  error: '#c62828',
  success: '#2E7D32',
  tabBarBackground: '#ffffff',
  tabBarInactive: '#666666',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  card: '#2c2c2c',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#2E7D32',
  border: '#3c3c3c',
  error: '#ef5350',
  success: '#4CAF50',
  tabBarBackground: '#1e1e1e',
  tabBarInactive: '#888888',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme() || 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const stored = await storage.get<ThemeMode>(STORAGE_KEYS.THEME_MODE);
      if (stored) {
        setThemeModeState(stored);
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    } finally {
      setIsReady(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await storage.set(STORAGE_KEYS.THEME_MODE, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const getActiveColorScheme = (): ColorScheme => {
    if (themeMode === 'system') {
      return systemColorScheme;
    }
    return themeMode as ColorScheme;
  };

  const activeScheme = getActiveColorScheme();
  const colors = activeScheme === 'dark' ? darkColors : lightColors;
  const isDark = activeScheme === 'dark';

  // Don't block rendering - use default theme if not ready
  const value: ThemeContextType = {
    colors,
    isDark,
    themeMode,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
