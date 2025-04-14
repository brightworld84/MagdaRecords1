import { Platform } from 'react-native';
import colors from './colors';

// Font family based on platform
const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
});

// Typography styles for the application
const typography = {
  // Headings
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
    color: colors.text,
    letterSpacing: 0.25,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
    color: colors.text,
    letterSpacing: 0.15,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.text,
    letterSpacing: 0.15,
  },
  h4: {
    fontFamily: fontFamily.medium,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    color: colors.text,
    letterSpacing: 0.1,
  },

  // Body text
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
    color: colors.text,
    letterSpacing: 0.5,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
    color: colors.text,
    letterSpacing: 0.25,
  },

  // Subtitle
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: colors.text,
    letterSpacing: 0.15,
  },

  // Caption
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
    color: colors.secondaryText,
    letterSpacing: 0.4,
  },

  // Labels
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.text,
    letterSpacing: 0.1,
  },

  // Buttons
  button: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.primary,
    letterSpacing: 0.1,
  },

  // Small text
  small: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
    color: colors.secondaryText,
    letterSpacing: 0.4,
  },

  // Input text
  input: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
    color: colors.text,
    letterSpacing: 0.5,
  },
  
  // Regular text
  regular: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
    color: colors.text,
    letterSpacing: 0.25,
  },

  // Large numbers
  number: {
    fontFamily: fontFamily.medium,
    fontSize: 48,
    fontWeight: '500',
    lineHeight: 56,
    color: colors.text,
    letterSpacing: -0.5,
  },

  // Font sizes for dynamic text sizing
  fontSize: {
    small: {
      h1: 24,
      h2: 20,
      h3: 18,
      h4: 16,
      body: 14,
      subtitle: 14,
      button: 14,
      label: 12,
      small: 10,
    },
    medium: {
      h1: 28,
      h2: 24,
      h3: 20,
      h4: 18,
      body: 16,
      subtitle: 16,
      button: 16,
      label: 14,
      small: 12,
    },
    large: {
      h1: 32,
      h2: 28,
      h3: 24,
      h4: 20,
      body: 18,
      subtitle: 18,
      button: 18,
      label: 16,
      small: 14,
    },
  },
};

export default typography;
