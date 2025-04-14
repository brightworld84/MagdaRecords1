// Spacing values for consistent layout throughout the app
const spacing = {
  // Basic spacing units
  extraSmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,

  // Additional spacing values
  xxl: 48,
  xxxl: 64,

  // Specific usage spacing
  screenPadding: 16,
  sectionGap: 24,
  cardPadding: 16,
  inputPadding: 12,
  buttonPadding: 16,
  itemSpacing: 12,

  // Form-specific spacing
  inputVertical: 10,
  inputHorizontal: 16,
  formSpacing: 20,

  // Layout constants
  headerHeight: 56,
  tabBarHeight: 60,
  modalPadding: 20,
  borderRadius: 8,
  borderWidth: 1,

  // Helper function
  getSpacing: (multiplier = 1) => {
    return 8 * multiplier;
  },
};

export default spacing;
