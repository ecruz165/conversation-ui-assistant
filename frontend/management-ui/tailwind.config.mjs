/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Color Palette - Capital Group Brand Blues
      colors: {
        primary: {
          50: '#E6F4F9',   // Lightest - backgrounds, hover states
          100: '#CCE9F3',  // Very light - subtle backgrounds
          200: '#99D3E7',  // Light - borders, dividers
          300: '#66BDDB',  // Light-medium - secondary elements
          400: '#33A7CF',  // Medium - interactive elements
          500: '#0099D8',  // Main brand - buttons, links, primary actions
          600: '#007AB0',  // Medium-dark - hover states
          700: '#006BA6',  // Dark - headers, primary text
          800: '#00558C',  // Darker - emphasis
          900: '#003F72',  // Darkest - high contrast text
        },
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
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      // Spacing Scale - Based on Capital Group mockups
      spacing: {
        // Page horizontal padding
        'page': '2rem',           // 32px - Desktop
        'page-tablet': '1.5rem',  // 24px - Tablet
        'page-mobile': '1rem',    // 16px - Mobile

        // Section vertical padding
        'section': '5rem',        // 80px - Desktop sections
        'section-tablet': '4rem', // 64px - Tablet sections
        'section-mobile': '2.5rem', // 40px - Mobile sections

        // Hero section padding
        'hero': '6rem',           // 96px - Desktop hero
        'hero-tablet': '5rem',    // 80px - Tablet hero
        'hero-mobile': '3rem',    // 48px - Mobile hero

        // Card/Component padding
        'card': '2rem',           // 32px - Desktop cards
        'card-tablet': '1.5rem',  // 24px - Tablet cards
        'card-mobile': '1rem',    // 16px - Mobile cards

        // Element spacing
        'element': '2.5rem',      // 40px - Between major elements
        'element-sm': '1.5rem',   // 24px - Between related elements
        'element-xs': '1rem',     // 16px - Between small elements
      },
      // Typography Scale - Based on Capital Group mockups
      fontSize: {
        // Small text and labels
        'label': ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.05em', textTransform: 'uppercase' }], // 11px - "SERVICE & SUPPORT", "WHO WE ARE"
        'xs': ['0.75rem', { lineHeight: '1.5' }],     // 12px
        'sm': ['0.875rem', { lineHeight: '1.5' }],    // 14px

        // Body text
        'base': ['1rem', { lineHeight: '1.7' }],      // 16px - Main body text
        'lg': ['1.125rem', { lineHeight: '1.7' }],    // 18px - Large body

        // Headlines and titles
        'xl': ['1.25rem', { lineHeight: '1.4' }],     // 20px - Small headlines
        '2xl': ['1.5rem', { lineHeight: '1.3' }],     // 24px - Card titles
        '3xl': ['2rem', { lineHeight: '1.2' }],       // 32px - Section headlines (mobile)
        '4xl': ['2.5rem', { lineHeight: '1.2' }],     // 40px - Section headlines (tablet)
        '5xl': ['3rem', { lineHeight: '1.1' }],       // 48px - Hero headlines (desktop)
        '6xl': ['3.5rem', { lineHeight: '1.1' }],     // 56px - Large hero headlines
      },
      fontFamily: {
        sans: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      // Border Radius (PRD Section 5.2.5)
      borderRadius: {
        none: '0',
        sm: '0.125rem',   // 2px
        DEFAULT: '0.25rem', // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        full: '9999px',   // Pills/circles
      },
      // Shadows (PRD Section 5.2.6)
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      },
      // Responsive breakpoints
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    // Add custom button utilities
    function({ addComponents }) {
      addComponents({
        '.btn-primary': {
          '@apply bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 hover:shadow-md': {},
        },
        '.btn-secondary': {
          '@apply bg-white hover:bg-gray-50 text-primary-600 font-semibold px-8 py-4 rounded-lg border-2 border-primary-600 transition-all duration-200': {},
        },
      })
    }
  ],
};
