/**
 * Theme Context
 * 
 * Manages app-wide theme state (light/dark mode) with persistence.
 * Provides theme toggle functionality and notification on theme change.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform, useColorScheme as useRNColorScheme } from 'react-native';

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
  // Default theme is set to 'dark' instead of 'auto'
  const [themePreference, setThemePreferenceState] = useState<ColorScheme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (value && (value === 'light' || value === 'dark' || value === 'auto')) {
          setThemePreferenceState(value as ColorScheme);
        }
        // If no saved preference, default to dark mode
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, []);

  const colorScheme: 'light' | 'dark' = 
    themePreference === 'auto' 
      ? (systemColorScheme ?? 'dark') // Default to dark instead of light
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
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') {
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
      }
    } catch (error) {
      if (__DEV__ && Platform.OS === 'android') {
        console.warn('Local notifications may have limitations in Expo Go on Android');
      }
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
