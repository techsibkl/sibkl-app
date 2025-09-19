/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary - Red palette (using brighter red as suggested)
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#d6361e',  // Your suggested brighter red
          600: '#b91c1c',  // Slightly darker for contrast
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#650a0a',
          950: '#450a0a',
        },
        
        // Secondary - Blue palette (using your provided #699EFF)
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
          DEFAULT: '#F5F5F5',        // Your provided background
          dark: '#0a0a0a',           // Dark mode background
          secondary: '#f8f9fa',      // Light secondary background
          'secondary-dark': '#1a1a1a', // Dark secondary background
        },
        
        card: {
          DEFAULT: '#FFFFFF',        // Your provided card color
          dark: '#171717',           // Dark mode card
          hover: '#f9fafb',          // Light mode hover state
          'hover-dark': '#262626',   // Dark mode hover state
        },
        
        // Semantic colors that work in both light and dark
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
          950: '#052e16',
        },
        
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          900: '#78350f',
          950: '#451a03',
        },
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        
        // Enhanced gray scale for better dark mode support
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
        
        // Text colors for light and dark modes
        text: {
          DEFAULT: '#111827',        // Default dark text
          secondary: '#6b7280',     // Secondary text
          tertiary: '#9ca3af',      // Tertiary text
          inverse: '#ffffff',       // White text
          'dark-primary': '#f9fafb',    // Dark mode primary text
          'dark-secondary': '#d1d5db',  // Dark mode secondary text
          'dark-tertiary': '#9ca3af',   // Dark mode tertiary text
        },
        
        // Border colors
        border: {
          DEFAULT: '#e5e7eb',       // Default border
          secondary: '#d1d5db',     // Secondary border
          dark: '#374151',          // Dark mode border
          'dark-secondary': '#4b5563', // Dark mode secondary border
        },
      },
      
      // Custom font families
      fontFamily: {
        'primary': ['System'],
        'heading': ['System'],
      },
      
      // Custom spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      
      // Custom border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // Custom shadows for light and dark modes
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'dark-card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
