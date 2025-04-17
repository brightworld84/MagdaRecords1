// src/theme/themeContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import lightColors from './colors';
import darkColors from './darkColors';
import { Appearance } from 'react-native';

// Create the context
const ThemeContext = createContext();

// Hook for consuming the theme context
export const useTheme = () => useContext(ThemeContext);

// Provider for wrapping the app
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const [themeMode, setThemeMode] = useState(systemColorScheme || 'light');

  const isDark = themeMode === 'dark';
  const theme = isDark ? darkColors : lightColors;

  // Optional: keep in sync with system appearance
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // You can auto-switch here, or keep it manual based on user settings
      // setThemeMode(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
