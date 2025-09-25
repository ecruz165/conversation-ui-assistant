import { Theme } from '../types';

const lightTheme: Theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    error: '#dc2626',
    success: '#16a34a',
  },
  borderRadius: '8px',
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  transitions: {
    fast: 'all 0.15s ease-in-out',
    normal: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out',
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    shadow: 'rgba(0, 0, 0, 0.3)',
    error: '#ef4444',
    success: '#22c55e',
  },
  borderRadius: '8px',
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  },
  transitions: {
    fast: 'all 0.15s ease-in-out',
    normal: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out',
  },
};

/**
 * Get theme based on theme preference
 */
export const getTheme = (themeType: 'light' | 'dark' | 'auto'): Theme => {
  if (themeType === 'auto') {
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? darkTheme : lightTheme;
    }
    return lightTheme;
  }
  
  return themeType === 'dark' ? darkTheme : lightTheme;
};

/**
 * Create custom theme with overrides
 */
export const createTheme = (baseTheme: 'light' | 'dark', overrides: Partial<Theme> = {}): Theme => {
  const base = baseTheme === 'dark' ? darkTheme : lightTheme;
  
  return {
    ...base,
    ...overrides,
    colors: {
      ...base.colors,
      ...overrides.colors,
    },
    spacing: {
      ...base.spacing,
      ...overrides.spacing,
    },
    typography: {
      ...base.typography,
      ...overrides.typography,
      fontSize: {
        ...base.typography.fontSize,
        ...overrides.typography?.fontSize,
      },
      fontWeight: {
        ...base.typography.fontWeight,
        ...overrides.typography?.fontWeight,
      },
    },
    shadows: {
      ...base.shadows,
      ...overrides.shadows,
    },
    transitions: {
      ...base.transitions,
      ...overrides.transitions,
    },
  };
};

export { lightTheme, darkTheme };
