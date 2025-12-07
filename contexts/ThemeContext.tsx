/**
 * Theme Context
 * 
 * Manages app-wide theme state (light/dark mode) with persistence.
 * Provides theme toggle functionality and notification on theme change.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  themePreference: ColorScheme;
  setThemePreference: (theme: ColorScheme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = '@app_theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ColorScheme>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (value && (value === 'light' || value === 'dark' || value === 'auto')) {
          setThemePreferenceState(value as ColorScheme);
        }
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  const colorScheme: 'light' | 'dark' = 
    themePreference === 'auto' 
      ? (systemColorScheme ?? 'light')
      : themePreference;

  const setThemePreference = useCallback(async (theme: ColorScheme) => {
    setThemePreferenceState(theme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    await setThemePreference(newTheme);
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: newTheme === 'dark' ? 'Dark Mode Enabled' : 'Dark Mode Off',
          body: newTheme === 'dark' 
            ? 'Dark mode has been enabled. Your app is now using a dark theme.'
            : 'Dark mode has been disabled. Your app is now using a light theme.',
          sound: true,
        },
        trigger: {
          seconds: 0.5,
        } as Notifications.TimeIntervalTriggerInput,
      });
    } catch (error) {
      console.error('Error showing theme change notification:', error);
    }
  }, [colorScheme, setThemePreference]);

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        themePreference,
        setThemePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
