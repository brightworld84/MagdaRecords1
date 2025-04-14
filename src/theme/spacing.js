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
    
    // Helper functions for consistent spacing
    getSpacing: (multiplier = 1) => {
      return 8 * multiplier;
    },
  };
  
  export default spacing;
  // Spacing values for consistent layout
  const spacing = {
    // Base spacing unit (4px)
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
    
    // Specific use cases
    padding: {
      screen: 16,
      card: 16,
      input: 12,
      button: 16,
    },
    
    margin: {
      screen: 16,
      section: 24,
      item: 12,
    },
    
    // Border radius
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
      round: 999,
    },
    
    // Icon sizes
    icon: {
      small: 16,
      medium: 24,
      large: 32,
    },
    
    // Avatar sizes
    avatar: {
      small: 32,
      medium: 48,
      large: 64,
    },
  };
  
  export default spacing;
  