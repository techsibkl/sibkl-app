// Color palette - use this for programmatic color access
export const Colors = {
  // Primary colors - Red palette (your brand red)
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#d6361e',  // Your suggested brighter red
    600: '#b91c1c',
    700: '#991b1b',
    800: '#7f1d1d',
    900: '#650a0a',
    950: '#450a0a',
  },
  
  // Secondary colors - Blue palette (your provided blue)
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#699EFF',  // Your provided blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  // Custom background and surface colors
  background: {
    light: '#FCFCFC',        // Your provided background
    dark: '#0a0a0a',         // Dark mode background
    secondary: '#f8f9fa',    // Light secondary background
    'secondary-dark': '#1a1a1a', // Dark secondary background
  },
  
  card: {
    light: '#FFFFFF',        // Your provided card color
    dark: '#171717',         // Dark mode card
    hover: '#f9fafb',        // Light mode hover state
    'hover-dark': '#262626', // Dark mode hover state
  },
  
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#699EFF',  // Using your secondary blue
  
  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Text colors
  text: {
    light: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    dark: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      inverse: '#111827',
    },
  },
  
  // Border colors
  border: {
    light: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
    },
    dark: {
      primary: '#374151',
      secondary: '#4b5563',
    },
  },
};

// Typography scale
export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadow definitions (for use with React Native's shadow props)
export const Shadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 6,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
      elevation: 6,
    },
  },
};

// Typography scale
// export const Typography = {
//   sizes: {
//     xs: 12,
//     sm: 14,
//     base: 16,
//     lg: 18,
//     xl: 20,
//     '2xl': 24,
//     '3xl': 30,
//     '4xl': 36,
//     '5xl': 48,
//   },
  
//   weights: {
//     light: '300',
//     normal: '400',
//     medium: '500',
//     semibold: '600',
//     bold: '700',
//   },
  
//   lineHeights: {
//     tight: 1.2,
//     normal: 1.5,
//     relaxed: 1.75,
//   },
// };

// Spacing scale
// export const Spacing = {
//   xs: 4,
//   sm: 8,
//   md: 16,
//   lg: 24,
//   xl: 32,
//   '2xl': 48,
//   '3xl': 64,
//   '4xl': 96,
// };

// // Border radius
// export const BorderRadius = {
//   sm: 4,
//   md: 8,
//   lg: 12,
//   xl: 16,
//   '2xl': 24,
//   '3xl': 32,
//   full: 9999,
// };

// // Shadow definitions (for use with React Native's shadow props)
// export const Shadows = {
//   sm: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   md: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   lg: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 15,
//     elevation: 6,
//   },
//   xl: {
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 20 },
//     shadowOpacity: 0.25,
//     shadowRadius: 25,
//     elevation: 10,
//   },
// };