// ============================================
// Why Did You Render - MUST be imported first
// ============================================
// WDYR needs to be imported before React to properly track components
import './wdyr';

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/app.css";
import { devxConfig, devxLogger, isDevXEnabled } from "./config/devx.config";

// ============================================
// DevX Stack Initialization
// ============================================

// Log DevX status
if (devxConfig.enabled) {
  devxLogger.info('DevX Stack Enabled');
  devxLogger.debug('Configuration:', devxConfig);
} else {
  devxLogger.info('DevX Stack: Disabled');
}

// ============================================
// Web Vitals Tracking
// ============================================
if (isDevXEnabled('webVitals')) {
  import('./utils/web-vitals-tracker').then(({ WebVitalsTracker }) => {
    const tracker = new WebVitalsTracker({
      reportToConsole: import.meta.env.DEV,
      reportToAnalytics: import.meta.env.PROD,
      analyticsEndpoint: '/api/analytics',
    });
    tracker.init();
    devxLogger.info('Web Vitals tracking initialized');

    // Expose globally for debugging
    if (import.meta.env.DEV) {
      (window as Window & { __webVitals?: WebVitalsTracker }).__webVitals = tracker;
    }
  }).catch((error) => {
    devxLogger.error('Failed to load Web Vitals tracker:', error);
  });
}

// ============================================
// Performance Observer
// ============================================
if (isDevXEnabled('perfObserver')) {
  import('./utils/performance-observer').then(({ PerformanceMonitor }) => {
    const monitor = new PerformanceMonitor();
    monitor.init();
    devxLogger.info('Performance Observer initialized');

    // Expose globally for debugging
    if (import.meta.env.DEV) {
      (window as Window & { __perfMonitor?: PerformanceMonitor }).__perfMonitor = monitor;
    }

    // Cleanup on HMR
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        monitor.cleanup();
        devxLogger.debug('Performance Observer cleaned up (HMR)');
      });
    }
  }).catch((error) => {
    devxLogger.error('Failed to load Performance Observer:', error);
  });
}

// ============================================
// React Scan - Manual Mode
// ============================================
// Only initialize if not already loaded via Vite plugin
// Check for VITE_REACT_SCAN_PLUGIN env var to avoid double initialization
if (isDevXEnabled('reactScan') && !import.meta.env.VITE_REACT_SCAN_PLUGIN) {
  import('react-scan')
    .then(({ scan }) => {
      scan({
        enabled: true,
        log: devxConfig.logLevel === 'debug',
        // Show render count overlay
        showToolbar: true,
        // Highlight components that render slowly
        renderCountThreshold: 10,
      });
      devxLogger.info('React Scan initialized (manual mode)');
    })
    .catch((error) => {
      devxLogger.debug('React Scan not available:', error);
      devxLogger.debug('Install with: npm install -D react-scan');
    });
}

// ============================================
// Memory Monitor
// ============================================
if (isDevXEnabled('memoryMonitor')) {
  import('./utils/memory-monitor').then(({ MemoryMonitor }) => {
    const memoryMonitor = new MemoryMonitor();
    memoryMonitor.init();
    devxLogger.info('Memory Monitor initialized');

    // Expose globally for debugging
    (window as Window & { __memoryMonitor?: MemoryMonitor }).__memoryMonitor = memoryMonitor;

    // Log periodic reports
    setInterval(() => {
      const report = memoryMonitor.getReport();
      if (report?.possibleLeak) {
        devxLogger.warn('Memory Report:', report);
      }
    }, 60000); // Every minute

    // Cleanup on HMR
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        memoryMonitor.cleanup();
        devxLogger.debug('Memory Monitor cleaned up (HMR)');
      });
    }
  }).catch((error) => {
    devxLogger.error('Failed to load Memory Monitor:', error);
  });
}

// ============================================
// Network Logger
// ============================================
if (isDevXEnabled('networkLogger')) {
  import('./utils/network-logger').then(({ NetworkLogger }) => {
    const networkLogger = new NetworkLogger();
    networkLogger.init();
    devxLogger.info('Network Logger initialized');

    // Expose globally for debugging
    (window as Window & { __networkLogger?: NetworkLogger }).__networkLogger = networkLogger;

    // Cleanup on HMR
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        networkLogger.cleanup();
        devxLogger.debug('Network Logger cleaned up (HMR)');
      });
    }
  }).catch((error) => {
    devxLogger.error('Failed to load Network Logger:', error);
  });
}

// ============================================
// Keyboard Shortcuts
// ============================================
if (devxConfig.enabled && import.meta.env.DEV) {
  document.addEventListener('keydown', (e) => {
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
        'Million.js': devxConfig.million,
        'Bundle Visualizer': devxConfig.bundleVisualizer,
        'Vite Inspect': devxConfig.inspect,
        'Log Level': devxConfig.logLevel,
      });
      devxLogger.info('DevX configuration logged to console');
    }

    // Ctrl+Shift+M: Log Memory Report
    if (e.ctrlKey && e.shiftKey && e.key === 'M') {
      e.preventDefault();
      const memoryMonitor = (window as Window & { __memoryMonitor?: { getReport: () => unknown } }).__memoryMonitor;
      if (memoryMonitor) {
        const report = memoryMonitor.getReport();
        console.log('Memory Report:', report);
        devxLogger.info('Memory report logged to console');
      } else {
        devxLogger.warn('Memory Monitor not initialized');
      }
    }

    // Ctrl+Shift+N: Log Network Stats
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      const networkLogger = (window as Window & { __networkLogger?: { getStats: () => unknown; getRequests: () => unknown } }).__networkLogger;
      if (networkLogger) {
        const stats = networkLogger.getStats();
        const requests = networkLogger.getRequests();
        console.log('Network Stats:', stats);
        console.table(requests);
        devxLogger.info('Network stats logged to console');
      } else {
        devxLogger.warn('Network Logger not initialized');
      }
    }
  });

  devxLogger.info('Keyboard shortcuts enabled:');
  devxLogger.info('  Ctrl+Shift+X: Toggle DevX Control Panel');
  devxLogger.info('  Ctrl+Shift+L: Log DevX configuration');
  devxLogger.info('  Ctrl+Shift+M: Log Memory report');
  devxLogger.info('  Ctrl+Shift+N: Log Network stats');
}

// ============================================
// MSW (Mock Service Worker)
// ============================================
async function enableMocking() {
  if (!isDevXEnabled('msw')) {
    devxLogger.debug('MSW disabled via environment config');
    return;
  }

  try {
    devxLogger.info('Initializing MSW (Mock Service Worker)');
    const { worker } = await import('./mocks/browser');

    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });

    // Expose globally for debugging
    if (import.meta.env.DEV) {
      (window as Window & {
        __msw?: {
          enable: () => Promise<void>;
          disable: () => void;
          resetHandlers: () => void;
        };
      }).__msw = {
        enable: async () => {
          await worker.start();
          devxLogger.info('MSW enabled');
        },
        disable: () => {
          worker.stop();
          devxLogger.info('MSW disabled');
        },
        resetHandlers: () => {
          worker.resetHandlers();
          devxLogger.info('MSW handlers reset');
        },
      };
    }

    devxLogger.info('MSW initialized successfully');
  } catch (error) {
    devxLogger.error('Failed to initialize MSW:', error);
    devxLogger.warn('Continuing without MSW - real API calls will be made');
  }
}

// ============================================
// React App Initialization
// ============================================
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Failed to find root element. Ensure index.html contains <div id="root"></div>');
}

// Initialize MSW first, then render the app
enableMocking()
  .then(() => {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    if (devxConfig.enabled) {
      devxLogger.info('App initialized with DevX Stack');
    }
  })
  .catch((error) => {
    devxLogger.error('Failed to initialize app:', error);
    // Render app anyway even if MSW fails
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });
