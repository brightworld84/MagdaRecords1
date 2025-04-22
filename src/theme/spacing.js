// Spacing values for consistent layout throughout the app
const spacing = {
  // Basic spacing units
  extraSmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,

  // Extended spacing
  xxl: 48,
  xxxl: 64,

  // Common layout spacing
  screenPadding: 16,
  sectionGap: 24,
  cardPadding: 16,
  inputPadding: 12,
  buttonPadding: 16,
  itemSpacing: 12,

  // Form layout spacing
  inputVertical: 10,
  inputHorizontal: 16,
  formSpacing: 20,

  // Layout constants
  headerHeight: 56,
  tabBarHeight: 60,
  modalPadding: 20,
  borderRadius: 8,
  borderWidth: 1,

  // Utility function for custom spacing
  getSpacing: (multiplier = 1) => 8 * multiplier,
};

export default spacing;
