/**
 * DevX Stack Configuration
 * Centralized control for all developer experience tools
 *
 * This module provides environment-based configuration for:
 * - Runtime monitoring tools (Web Vitals, Performance Observer, Memory Monitor, Network Logger)
 * - React debugging tools (React Scan, Why Did You Render, React Query DevTools)
 * - Build-time optimization tools (Million.js, Bundle Visualizer, Vite Inspect)
 * - Development utilities (MSW, Dashboard, Keyboard Shortcuts)
 */

/**
 * DevX Configuration Interface
 * Defines all available developer experience tool flags
 */
export interface DevXConfig {
  // Master switch - when false, disables ALL DevX tools
  enabled: boolean;

  // Runtime monitoring tools
  webVitals: boolean;
  reactScan: boolean;
  wdyr: boolean; // Why Did You Render
  perfObserver: boolean; // Performance Observer
  memoryMonitor: boolean;
  networkLogger: boolean;
  dashboard: boolean;
  msw: boolean; // Mock Service Worker

  // Build-time tools
  million: boolean; // Million.js React optimization
  bundleVisualizer: boolean;
  inspect: boolean; // Vite Plugin Inspect

  // Performance testing configuration
  perfRuns: number;
  perfOutputDir: string;

  // Logging configuration
  logLevel: "debug" | "info" | "warn" | "error" | "none";
}

/**
 * Parse environment variable string to boolean
 *
 * @param value - Environment variable value (string or undefined)
 * @param defaultValue - Fallback value if env var is not set
 * @returns Parsed boolean value
 *
 * @example
 * parseEnvBoolean('true', false) // returns true
 * parseEnvBoolean('false', true) // returns false
 * parseEnvBoolean(undefined, true) // returns true
 */
function parseEnvBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
}

/**
 * Get DevX configuration from environment variables
 *
 * Reads VITE_DEVX_* environment variables and constructs the configuration object.
 * The master switch (VITE_DEVX_ENABLED) overrides all individual tool settings.
 *
 * @returns Complete DevX configuration object
 */
export function getDevXConfig(): DevXConfig {
  // Master switch defaults to true in dev, false in prod
  const masterEnabled = parseEnvBoolean(import.meta.env.VITE_DEVX_ENABLED, import.meta.env.DEV);

  return {
    // Master switch - controls everything
    enabled: masterEnabled,

    // Runtime tools - only enabled if master switch is on
    webVitals: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_WEB_VITALS, true),
    reactScan: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_REACT_SCAN, true),
    wdyr: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_WDYR, true),
    perfObserver: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_PERF_OBSERVER, true),
    memoryMonitor: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_MEMORY_MONITOR, true),
    networkLogger: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_NETWORK_LOGGER, true),
    dashboard: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_DASHBOARD, true),
    msw: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_MSW, true),

    // Build-time tools
    million: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_MILLION, true),
    bundleVisualizer: parseEnvBoolean(import.meta.env.VITE_DEVX_BUNDLE_VISUALIZER, false),
    inspect: masterEnabled && parseEnvBoolean(import.meta.env.VITE_DEVX_INSPECT, true),

    // Performance testing configuration
    perfRuns: Number(import.meta.env.VITE_DEVX_PERF_RUNS) || 3,
    perfOutputDir: import.meta.env.VITE_DEVX_PERF_OUTPUT_DIR || "baseline",

    // Logging level
    logLevel: (import.meta.env.VITE_DEVX_LOG_LEVEL as DevXConfig["logLevel"]) || "info",
  };
}

/**
 * Singleton configuration instance
 * Import this to access the current DevX configuration
 */
export const devxConfig = getDevXConfig();

/**
 * DevX Logger
 * Provides structured logging with configurable verbosity levels
 *
 * Respects the VITE_DEVX_LOG_LEVEL environment variable:
 * - debug: All messages (debug, info, warn, error)
 * - info: Info, warn, and error messages
 * - warn: Only warn and error messages
 * - error: Only error messages
 * - none: No logging
 */
export const devxLogger = {
  /**
   * Debug-level logging - most verbose
   * Only shown when logLevel is 'debug'
   */
  debug: (...args: unknown[]): void => {
    if (devxConfig.logLevel === "debug") {
      console.log("[DevX Debug]", ...args);
    }
  },

  /**
   * Info-level logging - general information
   * Shown when logLevel is 'debug' or 'info'
   */
  info: (...args: unknown[]): void => {
    if (["debug", "info"].includes(devxConfig.logLevel)) {
      console.log("[DevX]", ...args);
    }
  },

  /**
   * Warning-level logging - potential issues
   * Shown when logLevel is 'debug', 'info', or 'warn'
   */
  warn: (...args: unknown[]): void => {
    if (["debug", "info", "warn"].includes(devxConfig.logLevel)) {
      console.warn("[DevX Warning]", ...args);
    }
  },

  /**
   * Error-level logging - critical issues
   * Shown unless logLevel is 'none'
   */
  error: (...args: unknown[]): void => {
    if (devxConfig.logLevel !== "none") {
      console.error("[DevX Error]", ...args);
    }
  },
};

/**
 * Runtime check for DevX feature availability
 *
 * @param feature - Optional specific feature to check (e.g., 'webVitals', 'dashboard')
 * @returns true if DevX is enabled and the specific feature (if provided) is enabled
 *
 * @example
 * if (isDevXEnabled('webVitals')) {
 *   // Initialize Web Vitals tracking
 * }
 *
 * @example
 * if (isDevXEnabled()) {
 *   // DevX is enabled (master switch is on)
 * }
 */
export function isDevXEnabled(feature?: keyof DevXConfig): boolean {
  // If master switch is off, nothing is enabled
  if (!devxConfig.enabled) return false;

  // If no specific feature requested, just return master switch status
  if (!feature) return true;

  // Return the specific feature's status
  return devxConfig[feature] as boolean;
}

// Expose configuration globally for debugging (dev mode only)
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as Window & { __devxConfig?: DevXConfig }).__devxConfig = devxConfig;
}
