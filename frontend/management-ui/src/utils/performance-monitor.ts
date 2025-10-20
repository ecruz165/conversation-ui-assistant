/**
 * Performance monitoring utility for development
 * Tracks component render times and logs performance metrics
 */

interface PerformanceEntry {
  componentName: string;
  duration: number;
  timestamp: number;
}

const performanceLog: PerformanceEntry[] = [];
const MAX_LOG_SIZE = 100;

/**
 * Measure component performance during renders
 * Only active in development mode
 *
 * @param componentName - Name of the component being measured
 * @returns Cleanup function to call when measurement is complete
 *
 * @example
 * useEffect(() => {
 *   const cleanup = measureComponentPerformance('MyComponent');
 *   return cleanup;
 * }, []);
 */
export const measureComponentPerformance = (componentName: string): (() => void) => {
  if (import.meta.env.DEV) {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;
    const measureName = `${componentName}-render`;

    performance.mark(startMark);

    return () => {
      try {
        performance.mark(endMark);
        performance.measure(measureName, startMark, endMark);

        const measure = performance.getEntriesByName(measureName)[0];
        if (measure) {
          const entry: PerformanceEntry = {
            componentName,
            duration: measure.duration,
            timestamp: Date.now(),
          };

          performanceLog.push(entry);

          // Keep log size manageable
          if (performanceLog.length > MAX_LOG_SIZE) {
            performanceLog.shift();
          }

          // Log slow renders (> 16ms = potential 60fps issue)
          if (measure.duration > 16) {
            console.warn(
              `⚠️ Slow render: ${componentName} took ${measure.duration.toFixed(2)}ms`
            );
          }

          // Cleanup performance marks
          performance.clearMarks(startMark);
          performance.clearMarks(endMark);
          performance.clearMeasures(measureName);
        }
      } catch (error) {
        console.error("Performance measurement error:", error);
      }
    };
  }

  // No-op in production
  return () => {};
};

/**
 * Get performance statistics for a specific component
 * @param componentName - Name of the component
 * @returns Performance statistics
 */
export const getComponentStats = (
  componentName: string
): {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
} => {
  const entries = performanceLog.filter((entry) => entry.componentName === componentName);

  if (entries.length === 0) {
    return { count: 0, avgDuration: 0, minDuration: 0, maxDuration: 0 };
  }

  const durations = entries.map((e) => e.duration);
  const sum = durations.reduce((acc, d) => acc + d, 0);

  return {
    count: entries.length,
    avgDuration: sum / entries.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
  };
};

/**
 * Log all performance statistics to console
 */
export const logPerformanceStats = (): void => {
  if (import.meta.env.DEV && performanceLog.length > 0) {
    const componentNames = Array.from(new Set(performanceLog.map((e) => e.componentName)));

    console.group("🔍 Performance Statistics");
    for (const name of componentNames) {
      const stats = getComponentStats(name);
      console.log(`${name}:`, {
        renders: stats.count,
        avg: `${stats.avgDuration.toFixed(2)}ms`,
        min: `${stats.minDuration.toFixed(2)}ms`,
        max: `${stats.maxDuration.toFixed(2)}ms`,
      });
    }
    console.groupEnd();
  }
};

/**
 * Clear all performance logs
 */
export const clearPerformanceLog = (): void => {
  performanceLog.length = 0;
};

// Auto-log stats every 30 seconds in development
if (import.meta.env.DEV) {
  setInterval(() => {
    if (performanceLog.length > 0) {
      logPerformanceStats();
    }
  }, 30000);
}
