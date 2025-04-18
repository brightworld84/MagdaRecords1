// src/theme/themeContext.js

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import lightColors from './colors';
import darkColors from './darkColors';
import { Appearance } from 'react-native';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = Appearance?.getColorScheme?.() || 'light';
  const [themeMode, setThemeMode] = useState(systemColorScheme);

  useEffect(() => {
    const listener = ({ colorScheme }) => {
      if (colorScheme) {
        setThemeMode(colorScheme);
      }
    };

    const subscription = Appearance?.addChangeListener?.(listener);
    return () => subscription?.remove?.();
  }, []);

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? darkColors : lightColors;

  const toggleDarkMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
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
