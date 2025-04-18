// src/theme/themeContext.js

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import lightColors from './colors';
import darkColors from './darkColors';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = Appearance.getColorScheme();
  const [themeMode, setThemeMode] = useState(systemColorScheme || 'light');

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? darkColors : lightColors;

  const toggleDarkMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      isDarkMode,
      toggleDarkMode,
    }),
    [themeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
