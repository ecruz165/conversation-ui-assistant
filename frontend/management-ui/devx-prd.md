# Environment Variable Configuration for DevX Stack

Add this comprehensive environment-based control system to toggle all DevX functionality on/off.

---

## Environment Variables Schema

```bash
# .env.development
# ============================================
# DevX Stack Configuration
# ============================================

# Master switch - disables ALL DevX tools
VITE_DEVX_ENABLED=true

# Individual tool controls
VITE_DEVX_WEB_VITALS=true
VITE_DEVX_REACT_SCAN=true
VITE_DEVX_WDYR=true
VITE_DEVX_PERF_OBSERVER=true
VITE_DEVX_MEMORY_MONITOR=true
VITE_DEVX_NETWORK_LOGGER=true
VITE_DEVX_DASHBOARD=true
VITE_DEVX_MSW=true

# Build-time tools (set to 'false' to disable)
VITE_DEVX_MILLION=true
VITE_DEVX_BUNDLE_VISUALIZER=false  # Only on-demand
VITE_DEVX_INSPECT=true

# Performance test configuration
VITE_DEVX_PERF_RUNS=3
VITE_DEVX_PERF_OUTPUT_DIR=baseline

# Logging verbosity
VITE_DEVX_LOG_LEVEL=info  # debug, info, warn, error, none
```

```bash
# .env.production
# ============================================
# Production - ALL DevX tools disabled
# ============================================
VITE_DEVX_ENABLED=false
```

```bash
# .env.test
# ============================================
# Testing - Selective enablement
# ============================================
VITE_DEVX_ENABLED=true
VITE_DEVX_MSW=true  # Enable mocks for testing
VITE_DEVX_WEB_VITALS=true  # Track test performance

# Disable UI-heavy tools in tests
VITE_DEVX_DASHBOARD=false
VITE_DEVX_REACT_SCAN=false
```

---

## Core Configuration Module

```typescript
// src/config/devx.config.ts

/**
 * DevX Stack Configuration
 * Centralized control for all developer experience tools
 */

export interface DevXConfig {
  // Master switch
  enabled: boolean;
  
  // Runtime tools
  webVitals: boolean;
  reactScan: boolean;
  wdyr: boolean;
  perfObserver: boolean;
  memoryMonitor: boolean;
  networkLogger: boolean;
  dashboard: boolean;
  msw: boolean;
  
  // Build-time tools
  million: boolean;
  bundleVisualizer: boolean;
  inspect: boolean;
  
  // Performance testing
  perfRuns: number;
  perfOutputDir: string;
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'none';
}

/**
 * Parse environment variable to boolean
 */
function parseEnvBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Get DevX configuration from environment variables
 */
export function getDevXConfig(): DevXConfig {
  const masterEnabled = parseEnvBoolean(import.meta.env.VITE_DEVX_ENABLED, import.meta.env.DEV);
  
  return {
    // Master switch overrides all individual settings
    enabled: masterEnabled,
    
    // Individual tools (only enabled if master switch is on)
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
    
    // Performance testing
    perfRuns: Number(import.meta.env.VITE_DEVX_PERF_RUNS) || 3,
    perfOutputDir: import.meta.env.VITE_DEVX_PERF_OUTPUT_DIR || 'baseline',
    
    // Logging
    logLevel: (import.meta.env.VITE_DEVX_LOG_LEVEL as any) || 'info',
  };
}

/**
 * Singleton config instance
 */
export const devxConfig = getDevXConfig();

/**
 * Logger with configurable levels
 */
export const devxLogger = {
  debug: (...args: any[]) => {
    if (devxConfig.logLevel === 'debug') {
      console.log('[DevX Debug]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(devxConfig.logLevel)) {
      console.log('[DevX]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(devxConfig.logLevel)) {
      console.warn('[DevX Warning]', ...args);
    }
  },
  error: (...args: any[]) => {
    if (devxConfig.logLevel !== 'none') {
      console.error('[DevX Error]', ...args);
    }
  },
};

/**
 * Runtime check for feature availability
 */
export function isDevXEnabled(feature?: keyof DevXConfig): boolean {
  if (!devxConfig.enabled) return false;
  if (!feature) return true;
  return devxConfig[feature] as boolean;
}
```

---

## Updated Component Implementations

### 1. Web Vitals with Environment Control

```typescript
// src/main.tsx
import { devxConfig, devxLogger, isDevXEnabled } from './config/devx.config';
import { WebVitalsTracker } from './utils/web-vitals-tracker';

// Web Vitals - Controlled by env
if (isDevXEnabled('webVitals')) {
  devxLogger.info('Initializing Web Vitals tracking');
  
  const tracker = new WebVitalsTracker({
    reportToConsole: import.meta.env.DEV,
    reportToAnalytics: import.meta.env.PROD,
    analyticsEndpoint: '/api/analytics',
  });
  
  tracker.init();
} else {
  devxLogger.debug('Web Vitals tracking disabled');
}
```

### 2. Performance Observer with Environment Control

```typescript
// src/main.tsx
import { PerformanceMonitor } from './utils/performance-observer';

if (isDevXEnabled('perfObserver')) {
  devxLogger.info('Initializing Performance Observer');
  
  const monitor = new PerformanceMonitor();
  monitor.init();
  
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      monitor.cleanup();
    });
  }
} else {
  devxLogger.debug('Performance Observer disabled');
}
```

### 3. React Scan with Environment Control

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { scan } from 'react-scan/vite';

export default defineConfig(({ mode }) => {
  // Load env vars
  const env = loadEnv(mode, process.cwd(), '');
  const devxEnabled = env.VITE_DEVX_ENABLED !== 'false';
  const reactScanEnabled = env.VITE_DEVX_REACT_SCAN !== 'false';
  
  const plugins = [react()];
  
  // Conditionally add React Scan
  if (devxEnabled && reactScanEnabled && mode === 'development') {
    console.log('✓ React Scan enabled');
    plugins.push(scan({
      enabled: true,
      showRenderCount: true,
      highlightSlowComponents: true,
    }));
  }
  
  return { plugins };
});
```

Or manual initialization:

```typescript
// src/main.tsx
import { scan } from 'react-scan';

if (isDevXEnabled('reactScan')) {
  devxLogger.info('Initializing React Scan');
  scan({
    enabled: true,
    log: devxConfig.logLevel === 'debug',
  });
}
```

### 4. Why Did You Render with Environment Control

```typescript
// src/wdyr.ts
import React from 'react';
import { isDevXEnabled, devxLogger } from './config/devx.config';

if (isDevXEnabled('wdyr')) {
  devxLogger.info('Initializing Why Did You Render');
  
  import('@welldone-software/why-did-you-render').then((module) => {
    module.default(React, {
      trackAllPureComponents: false,
      trackHooks: true,
      logOnDifferentValues: true,
      collapseGroups: true,
      exclude: [/^Mui/, /^ForwardRef/, /^Styled/, /^Emotion/],
    });
  });
} else {
  devxLogger.debug('Why Did You Render disabled');
}

export {};
```

### 5. Bundle Visualizer with Environment Control

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const visualizerEnabled = 
    env.VITE_DEVX_BUNDLE_VISUALIZER === 'true' || 
    process.env.ANALYZE === 'true';
  
  const plugins = [react()];
  
  if (visualizerEnabled) {
    console.log('✓ Bundle Visualizer enabled');
    plugins.push(visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }));
  }
  
  return { plugins };
});
```

### 6. Vite Plugin Inspect with Environment Control

```typescript
// vite.config.ts
import Inspect from 'vite-plugin-inspect';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devxEnabled = env.VITE_DEVX_ENABLED !== 'false';
  const inspectEnabled = env.VITE_DEVX_INSPECT !== 'false';
  
  const plugins = [react()];
  
  if (devxEnabled && inspectEnabled && mode === 'development') {
    console.log('✓ Vite Inspect enabled');
    plugins.push(Inspect({
      enabled: true,
      build: false,
    }));
  }
  
  return { plugins };
});
```

### 7. Memory Monitor with Environment Control

```typescript
// src/main.tsx
import { MemoryMonitor } from './utils/memory-monitor';

if (isDevXEnabled('memoryMonitor')) {
  devxLogger.info('Initializing Memory Monitor');
  
  const memoryMonitor = new MemoryMonitor();
  memoryMonitor.init();
  
  // Expose globally for debugging
  (window as any).__memoryMonitor = memoryMonitor;
  
  // Cleanup
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      memoryMonitor.cleanup();
    });
  }
} else {
  devxLogger.debug('Memory Monitor disabled');
}
```

### 8. Network Logger with Environment Control

```typescript
// src/main.tsx
import { NetworkLogger } from './utils/network-logger';

if (isDevXEnabled('networkLogger')) {
  devxLogger.info('Initializing Network Logger');
  
  const networkLogger = new NetworkLogger();
  networkLogger.init();
  
  // Expose globally
  (window as any).__networkLogger = networkLogger;
  
  // Cleanup
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      networkLogger.clear();
    });
  }
} else {
  devxLogger.debug('Network Logger disabled');
}
```

### 9. Dev Dashboard with Environment Control

```tsx
// src/components/DevDashboard.tsx
import { isDevXEnabled } from '../config/devx.config';

export function DevDashboard() {
  // Early return if disabled
  if (!isDevXEnabled('dashboard')) {
    return null;
  }
  
  if (import.meta.env.PROD) {
    return null;
  }
  
  // ... rest of component implementation
}
```

### 10. Million.js with Environment Control

```typescript
// vite.config.ts
import million from 'million/compiler';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devxEnabled = env.VITE_DEVX_ENABLED !== 'false';
  const millionEnabled = env.VITE_DEVX_MILLION !== 'false';
  
  const plugins = [];
  
  if (devxEnabled && millionEnabled) {
    console.log('✓ Million.js enabled');
    plugins.push(million.vite({ 
      auto: true,
      mode: 'react',
    }));
  }
  
  plugins.push(react());
  
  return { plugins };
});
```

### 11. MSW with Environment Control

```typescript
// src/main.tsx
import { worker } from './mocks/browser';

async function enableMocking() {
  if (isDevXEnabled('msw')) {
    devxLogger.info('Initializing MSW (Mock Service Worker)');
    
    return worker.start({
      onUnhandledRequest: 'warn',
    });
  } else {
    devxLogger.debug('MSW disabled');
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

---

## Complete Vite Config with All Environment Controls

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import million from 'million/compiler';
import { visualizer } from 'rollup-plugin-visualizer';
import Inspect from 'vite-plugin-inspect';
import { scan } from 'react-scan/vite';
import styleX from '@stylexjs/vite-plugin';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Parse DevX configuration
  const devxEnabled = env.VITE_DEVX_ENABLED !== 'false';
  const isDev = mode === 'development';
  
  const devxConfig = {
    million: devxEnabled && env.VITE_DEVX_MILLION !== 'false',
    bundleVisualizer: env.VITE_DEVX_BUNDLE_VISUALIZER === 'true' || process.env.ANALYZE === 'true',
    inspect: devxEnabled && env.VITE_DEVX_INSPECT !== 'false' && isDev,
    reactScan: devxEnabled && env.VITE_DEVX_REACT_SCAN !== 'false' && isDev,
  };
  
  // Log configuration
  console.log('\n🔧 DevX Configuration:');
  console.log(`   Master Switch: ${devxEnabled ? '✓ Enabled' : '✗ Disabled'}`);
  console.log(`   Million.js: ${devxConfig.million ? '✓' : '✗'}`);
  console.log(`   Bundle Visualizer: ${devxConfig.bundleVisualizer ? '✓' : '✗'}`);
  console.log(`   Vite Inspect: ${devxConfig.inspect ? '✓' : '✗'}`);
  console.log(`   React Scan: ${devxConfig.reactScan ? '✓' : '✗'}\n`);
  
  // Build plugins array conditionally
  const plugins = [];
  
  // Million.js (must come before react plugin)
  if (devxConfig.million) {
    plugins.push(million.vite({ 
      auto: true,
      mode: 'react',
    }));
  }
  
  // React
  plugins.push(react());
  
  // StyleX
  plugins.push(styleX({
    dev: isDev,
    unstable_moduleResolution: {
      type: 'commonJS',
      rootDir: process.cwd(),
    },
  }));
  
  // React Scan
  if (devxConfig.reactScan) {
    plugins.push(scan({
      enabled: true,
      showRenderCount: true,
      highlightSlowComponents: true,
    }));
  }
  
  // Vite Inspect
  if (devxConfig.inspect) {
    plugins.push(Inspect({
      enabled: true,
      build: false,
    }));
  }
  
  // Bundle Visualizer
  if (devxConfig.bundleVisualizer) {
    plugins.push(visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }));
  }
  
  return {
    plugins,
    
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor-react';
              if (id.includes('@mui')) return 'vendor-mui';
              if (id.includes('@stylexjs')) return 'vendor-stylex';
              return 'vendor';
            }
          },
        },
      },
      sourcemap: isDev,
    },
    
    server: {
      port: 5173,
    },
  };
});
```

---

## Complete Main.tsx with All Environment Controls

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { devxConfig, devxLogger, isDevXEnabled } from './config/devx.config';

// ============================================
// DevX Stack Initialization
// ============================================

// Log DevX status
if (devxConfig.enabled) {
  devxLogger.info('DevX Stack Enabled');
  devxLogger.debug('Configuration:', devxConfig);
} else {
  console.log('DevX Stack: Disabled');
}

// ============================================
// 1. Why Did You Render (must be first)
// ============================================
if (isDevXEnabled('wdyr')) {
  import('./wdyr');
}

// ============================================
// 2. Web Vitals
// ============================================
if (isDevXEnabled('webVitals')) {
  import('./utils/web-vitals-tracker').then(({ WebVitalsTracker }) => {
    const tracker = new WebVitalsTracker({
      reportToConsole: import.meta.env.DEV,
      reportToAnalytics: import.meta.env.PROD,
      analyticsEndpoint: '/api/analytics',
    });
    tracker.init();
    devxLogger.info('Web Vitals initialized');
  });
}

// ============================================
// 3. Performance Observer
// ============================================
if (isDevXEnabled('perfObserver')) {
  import('./utils/performance-observer').then(({ PerformanceMonitor }) => {
    const monitor = new PerformanceMonitor();
    monitor.init();
    devxLogger.info('Performance Observer initialized');
    
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        monitor.cleanup();
      });
    }
  });
}

// ============================================
// 4. Memory Monitor
// ============================================
if (isDevXEnabled('memoryMonitor')) {
  import('./utils/memory-monitor').then(({ MemoryMonitor }) => {
    const memoryMonitor = new MemoryMonitor();
    memoryMonitor.init();
    devxLogger.info('Memory Monitor initialized');
    
    // Expose globally
    (window as any).__memoryMonitor = memoryMonitor;
    
    // Log report periodically
    setInterval(() => {
      const report = memoryMonitor.getReport();
      if (report && report.possibleLeak) {
        devxLogger.warn('Memory Report:', report);
      }
    }, 30000);
    
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        memoryMonitor.cleanup();
      });
    }
  });
}

// ============================================
// 5. Network Logger
// ============================================
if (isDevXEnabled('networkLogger')) {
  import('./utils/network-logger').then(({ NetworkLogger }) => {
    const networkLogger = new NetworkLogger();
    networkLogger.init();
    devxLogger.info('Network Logger initialized');
    
    // Expose globally
    (window as any).__networkLogger = networkLogger;
    
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        networkLogger.clear();
      });
    }
  });
}

// ============================================
// 6. React Scan (manual mode)
// ============================================
if (isDevXEnabled('reactScan') && !import.meta.env.VITE_REACT_SCAN_PLUGIN) {
  import('react-scan').then(({ scan }) => {
    scan({
      enabled: true,
      log: devxConfig.logLevel === 'debug',
    });
    devxLogger.info('React Scan initialized (manual mode)');
  });
}

// ============================================
// 7. MSW (Mock Service Worker)
// ============================================
async function enableMocking() {
  if (isDevXEnabled('msw')) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'warn',
    });
    devxLogger.info('MSW initialized');
    
    // Expose globally
    (window as any).__msw = {
      enable: () => worker.start(),
      disable: () => worker.stop(),
      resetHandlers: () => worker.resetHandlers(),
    };
  }
}

// ============================================
// 8. Keyboard Shortcuts
// ============================================
if (devxConfig.enabled && import.meta.env.DEV) {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+D: Toggle DevDashboard
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      const event = new CustomEvent('devx:toggle-dashboard');
      window.dispatchEvent(event);
      devxLogger.info('DevDashboard toggled');
    }
    
    // Ctrl+Shift+L: Log DevX status
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      console.table({
        'DevX Enabled': devxConfig.enabled,
        'Web Vitals': devxConfig.webVitals,
        'React Scan': devxConfig.reactScan,
        'WDYR': devxConfig.wdyr,
        'Perf Observer': devxConfig.perfObserver,
        'Memory Monitor': devxConfig.memoryMonitor,
        'Network Logger': devxConfig.networkLogger,
        'Dashboard': devxConfig.dashboard,
        'MSW': devxConfig.msw,
      });
    }
    
    // Ctrl+Shift+M: Log Memory Report
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      if ((window as any).__memoryMonitor) {
        console.log((window as any).__memoryMonitor.getReport());
      }
    }
    
    // Ctrl+Shift+N: Log Network Stats
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      if ((window as any).__networkLogger) {
        console.log((window as any).__networkLogger.getStats());
      }
    }
  });
  
  devxLogger.info('Keyboard shortcuts enabled:');
  devxLogger.info('  Ctrl+Shift+D: Toggle DevDashboard');
  devxLogger.info('  Ctrl+Shift+L: Log DevX status');
  devxLogger.info('  Ctrl+Shift+M: Log Memory report');
  devxLogger.info('  Ctrl+Shift+N: Log Network stats');
}

// ============================================
// 9. React App Initialization
// ============================================
enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  if (devxConfig.enabled) {
    devxLogger.info('App initialized with DevX Stack');
  }
});
```

---

## Updated Performance Test Script

```typescript
// tests/performance-suite.spec.ts
import { devxConfig } from '../src/config/devx.config';

const CONFIG = {
  apps: [
    { name: 'dashboard', url: process.env.DASHBOARD_URL || 'http://localhost:5173/dashboard' },
    { name: 'reports', url: process.env.REPORTS_URL || 'http://localhost:5174/reports' },
    { name: 'accounts', url: process.env.ACCOUNTS_URL || 'http://localhost:5175/accounts' },
    { name: 'settings', url: process.env.SETTINGS_URL || 'http://localhost:5176/settings' },
  ],
  // Use env var or default
  runsPerApp: devxConfig.perfRuns,
  outputDir: devxConfig.perfOutputDir,
  budgets: {
    fcp: Number(process.env.VITE_DEVX_BUDGET_FCP) || 1500,
    lcp: Number(process.env.VITE_DEVX_BUDGET_LCP) || 2500,
    cls: Number(process.env.VITE_DEVX_BUDGET_CLS) || 0.1,
    tbt: Number(process.env.VITE_DEVX_BUDGET_TBT) || 300,
    ttfb: Number(process.env.VITE_DEVX_BUDGET_TTFB) || 800,
  },
};

// Rest of test implementation...
```

---

## Package.json Scripts with Environment Control

```json
{
  "scripts": {
    "dev": "vite",
    "dev:no-devx": "VITE_DEVX_ENABLED=false vite",
    "dev:minimal": "VITE_DEVX_DASHBOARD=false VITE_DEVX_REACT_SCAN=false vite",
    
    "build": "tsc && vite build",
    "build:analyze": "VITE_DEVX_BUNDLE_VISUALIZER=true vite build",
    "build:no-devx": "VITE_DEVX_ENABLED=false vite build",
    
    "perf:test": "playwright test tests/performance-suite.spec.ts",
    "perf:test:quick": "VITE_DEVX_PERF_RUNS=1 playwright test tests/performance-suite.spec.ts",
    "perf:test:thorough": "VITE_DEVX_PERF_RUNS=10 playwright test tests/performance-suite.spec.ts",
    
    "preview": "vite preview",
    "preview:no-devx": "VITE_DEVX_ENABLED=false vite preview"
  }
}
```

---

## VS Code Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Dev (Full DevX)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "env": {
        "VITE_DEVX_ENABLED": "true"
      }
    },
    {
      "name": "Dev (No DevX)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "env": {
        "VITE_DEVX_ENABLED": "false"
      }
    },
    {
      "name": "Dev (Minimal DevX)",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "env": {
        "VITE_DEVX_ENABLED": "true",
        "VITE_DEVX_DASHBOARD": "false",
        "VITE_DEVX_REACT_SCAN": "false",
        "VITE_DEVX_WDYR": "false"
      }
    }
  ]
}
```

---

## Runtime Toggle UI (Optional)

Add a UI control panel for toggling tools at runtime:

```tsx
// src/components/DevXControlPanel.tsx
import { useState, useEffect } from 'react';
import { isDevXEnabled, devxConfig } from '../config/devx.config';

export function DevXControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(devxConfig);
  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'X') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  
  if (!devxConfig.enabled || import.meta.env.PROD) return null;
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10000,
        }}
      >
        ⚙️ DevX
      </button>
    );
  }
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.95)',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 10000,
        minWidth: '280px',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
      }}>
        <strong>DevX Control Panel</strong>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '12px' }}>
        Environment variables control these settings.
        Restart dev server to apply changes.
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Object.entries(config).map(([key, value]) => {
          if (typeof value !== 'boolean') return null;
          
          return (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '4px',
            }}>
              <span style={{ textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span style={{ 
                color: value ? '#0cce6b' : '#888',
                fontWeight: 600,
              }}>
                {value ? '✓' : '✗'}
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        marginTop: '12px',
        paddingTop: '8px',
        borderTop: '1px solid rgba(255,255,255,0.2)',
        fontSize: '10px',
        opacity: 0.5,
      }}>
        Press Ctrl+Shift+X to toggle this panel
      </div>
    </div>
  );
}
```

Add to App.tsx:

```tsx
// src/App.tsx
import { DevXControlPanel } from './components/DevXControlPanel';

export function App() {
  return (
    <>
      {/* Your app */}
      <YourAppContent />
      
      {/* DevX Control Panel */}
      <DevXControlPanel />
    </>
  );
}
```

---

## Documentation

Create a quick reference guide:

```markdown
# DevX Environment Variables

## Quick Start

### Disable All DevX Tools
```bash
VITE_DEVX_ENABLED=false npm run dev
```

### Disable Specific Tool
```bash
VITE_DEVX_DASHBOARD=false npm run dev
```

### Enable Bundle Analysis
```bash
npm run build:analyze
# or
VITE_DEVX_BUNDLE_VISUALIZER=true npm run build
```

## All Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DEVX_ENABLED` | `true` (dev), `false` (prod) | Master switch for all DevX tools |
| `VITE_DEVX_WEB_VITALS` | `true` | Track Core Web Vitals |
| `VITE_DEVX_REACT_SCAN` | `true` | Visual component render tracking |
| `VITE_DEVX_WDYR` | `true` | Why Did You Render alerts |
| `VITE_DEVX_PERF_OBSERVER` | `true` | Performance Observer monitoring |
| `VITE_DEVX_MEMORY_MONITOR` | `true` | JavaScript heap tracking |
| `VITE_DEVX_NETWORK_LOGGER` | `true` | API request logging |
| `VITE_DEVX_DASHBOARD` | `true` | Real-time metrics dashboard |
| `VITE_DEVX_MSW` | `true` | Mock Service Worker |
| `VITE_DEVX_MILLION` | `true` | Million.js React optimization |
| `VITE_DEVX_BUNDLE_VISUALIZER` | `false` | Bundle size visualization |
| `VITE_DEVX_INSPECT` | `true` | Vite inspect tool |
| `VITE_DEVX_LOG_LEVEL` | `info` | Logging verbosity (debug/info/warn/error/none) |

## Keyboard Shortcuts

- `Ctrl+Shift+D` - Toggle DevDashboard
- `Ctrl+Shift+X` - Toggle DevX Control Panel
- `Ctrl+Shift+L` - Log DevX status to console
- `Ctrl+Shift+M` - Log memory report
- `Ctrl+Shift+N` - Log network stats

## Common Scenarios

### Development - Full Tools
```bash
# Default - all tools enabled
npm run dev
```

### Development - Performance Focus
```bash
# Only monitoring tools, no UI overlays
VITE_DEVX_DASHBOARD=false \
VITE_DEVX_REACT_SCAN=false \
npm run dev
```

### Testing - Mocks Only
```bash
# Only MSW for API mocking
VITE_DEVX_WEB_VITALS=true \
VITE_DEVX_MSW=true \
npm run test
```

### CI/CD - Disabled
```bash
# All DevX tools off
VITE_DEVX_ENABLED=false npm run build
```

## Troubleshooting

### Tools not loading?
Check environment variables:
```bash
# In browser console
console.table(window.__devxConfig)
```

### Performance impact?
Disable heavy tools:
```bash
VITE_DEVX_REACT_SCAN=false \
VITE_DEVX_WDYR=false \
npm run dev
```

### Clean state?
```bash
rm -rf node_modules/.vite
npm run dev
```
```

---

## Validation

After implementing environment controls:

- [ ] Master switch (`VITE_DEVX_ENABLED=false`) disables all tools
- [ ] Individual tool switches work independently
- [ ] Production builds exclude all DevX code
- [ ] Environment variables load correctly in all modes
- [ ] Vite config conditionally includes plugins
- [ ] Console shows which tools are enabled
- [ ] Keyboard shortcuts work
- [ ] Runtime toggles function correctly
- [ ] No errors when tools are disabled
- [ ] Performance impact minimal when tools disabled
- [ ] CI/CD respects environment settings
- [ ] Documentation accurate and complete

---

**This gives you complete, granular control over the DevX stack through environment variables, allowing teams to customize their setup based on preferences, performance requirements, or specific debugging needs.**