// src/theme/themeContext.js

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Appearance } from 'react-native';
import lightColors from './colors';
import darkColors from './darkColors';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isThemeReady, setIsThemeReady] = useState(false);
  const defaultThemeMode = 'light'; // Always have a fallback
  const [themeMode, setThemeMode] = useState(defaultThemeMode);

  useEffect(() => {
    try {
      console.log('🌈 ThemeProvider: Initializing theme...');
      const systemTheme = Appearance?.getColorScheme?.() || defaultThemeMode;
      console.log(`🌈 ThemeProvider: System theme detected: ${systemTheme}`);
      setThemeMode(systemTheme);
    } catch (error) {
      console.error('🌈 Theme detection error:', error);
      // Fallback to default
    } finally {
      setIsThemeReady(true);
      console.log(`🌈 ThemeProvider: Theme ready, using: ${themeMode}`);
    }
    
    const listener = ({ colorScheme }) => {
      try {
        if (colorScheme) {
          setThemeMode(colorScheme);
          console.log(`🌗 System theme changed: ${colorScheme}`);
        }
      } catch (error) {
        console.error('🌈 Theme change listener error:', error);
      }
    };

    const subscription = Appearance?.addChangeListener?.(listener);
    return () => {
      if (subscription?.remove && typeof subscription.remove === 'function') {
        subscription.remove();
      } else if (Appearance?.removeChangeListener && typeof Appearance.removeChangeListener === 'function') {
        Appearance.removeChangeListener(listener);
      }
    };
  }, []);

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? darkColors : lightColors;

  const toggleDarkMode = () => {
    try {
      const newMode = themeMode === 'dark' ? 'light' : 'dark';
      setThemeMode(newMode);
      console.log(`🌓 User toggled theme: ${newMode}`);
    } catch (error) {
      console.error('🌈 Theme toggle error:', error);
    }
  };

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      isDarkMode,
      toggleDarkMode,
    }),
    [themeMode, theme, isDarkMode]
  );

  // Don't render children until theme is ready
  if (!isThemeReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={{ marginTop: 10, color: '#333', fontWeight: '500' }}>
          Initializing theme...
        </Text>
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};