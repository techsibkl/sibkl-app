/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, Shadows } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ColorScheme = 'light' | 'dark';

interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // Card colors
  card: {
    primary: string;
    hover: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // Brand colors (consistent across themes, but may have different shades)
  primary: typeof Colors.primary;
  secondary: typeof Colors.secondary;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Neutral colors
  gray: typeof Colors.gray;
  border: {
    primary: string;
    secondary: string;
  };
  
  // Special colors
  white: string;
  black: string;
}

const lightTheme: ThemeColors = {
  background: {
    primary: Colors.background.light,      // #FCFCFC
    secondary: Colors.background.secondary, // #f8f9fa
    tertiary: Colors.gray[100],            // #f3f4f6
  },
  card: {
    primary: Colors.card.light,     // #FFFFFF
    hover: Colors.card.hover,       // #f9fafb
  },
  text: {
    primary: Colors.text.light.primary,      // #111827
    secondary: Colors.text.light.secondary,  // #6b7280
    tertiary: Colors.text.light.tertiary,    // #9ca3af
    inverse: Colors.text.light.inverse,      // #ffffff
  },
  primary: Colors.primary,
  secondary: Colors.secondary,
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
  info: Colors.info,
  gray: Colors.gray,
  border: {
    primary: Colors.border.light.primary,    // #e5e7eb
    secondary: Colors.border.light.secondary, // #d1d5db
  },
  white: Colors.white,
  black: Colors.black,
};

const darkTheme: ThemeColors = {
  background: {
    primary: Colors.background.dark,           // #0a0a0a
    secondary: Colors.background['secondary-dark'], // #1a1a1a
    tertiary: Colors.gray[800],               // #1f2937
  },
  card: {
    primary: Colors.card.dark,        // #171717
    hover: Colors.card['hover-dark'], // #262626
  },
  text: {
    primary: Colors.text.dark.primary,      // #f9fafb
    secondary: Colors.text.dark.secondary,  // #d1d5db
    tertiary: Colors.text.dark.tertiary,    // #9ca3af
    inverse: Colors.text.dark.inverse,      // #111827
  },
  primary: Colors.primary,
  secondary: Colors.secondary,
  success: Colors.success,
  warning: Colors.warning,
  error: Colors.error,
  info: Colors.info,
  gray: Colors.gray,
  border: {
    primary: Colors.border.dark.primary,     // #374151
    secondary: Colors.border.dark.secondary, // #4b5563
  },
  white: Colors.white,
  black: Colors.black,
};

export function useThemeColors() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  
  const colors = isDark ? darkTheme : lightTheme;
  
  // Helper functions for common patterns
  const getBackgroundStyle = (level: 'primary' | 'secondary' | 'tertiary' = 'primary') => ({
    backgroundColor: colors.background[level],
  });
  
  const getCardStyle = (variant: 'primary' | 'hover' = 'primary') => ({
    backgroundColor: colors.card[variant],
  });
  
  const getTextStyle = (variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary') => ({
    color: colors.text[variant],
  });
  
  const getBorderStyle = (variant: 'primary' | 'secondary' = 'primary') => ({
    borderColor: colors.border[variant],
  });
  
  // Get theme-aware shadow
  const getShadow = (size: 'sm' | 'md' | 'lg' = 'md') => {
    return isDark ? Shadows?.dark?.[size] || {} : Shadows?.light?.[size] || {};
  };
  
  return {
    colors,
    colorScheme,
    isDark,
    // Helper functions
    getBackgroundStyle,
    getCardStyle,
    getTextStyle,
    getBorderStyle,
    getShadow,
  };
}