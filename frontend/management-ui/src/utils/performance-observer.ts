/**
 * Performance Monitor
 *
 * Monitors browser performance using the Performance Observer API.
 * Tracks various performance entry types:
 * - Navigation: Page load timing
 * - Resource: Resource loading timing
 * - Measure: Custom performance measurements
 * - Paint: First Paint and First Contentful Paint
 * - Largest Contentful Paint (LCP)
 * - Layout Shift: Visual stability
 */

import { devxLogger } from '../config/devx.config';

export interface PerformanceReport {
  slowResources: PerformanceResourceTiming[];
  longTasks: PerformanceEntry[];
  layoutShifts: PerformanceEntry[];
  navigation?: PerformanceNavigationTiming;
  paints: PerformanceEntry[];
}

export class PerformanceMonitor {
  private observers: PerformanceObserver[] = [];
  private slowResourceThreshold = 1000; // ms
  private layoutShiftThreshold = 0.1; // CLS score
  private slowResources: PerformanceResourceTiming[] = [];
  private longTasks: PerformanceEntry[] = [];
  private layoutShifts: PerformanceEntry[] = [];
  private paints: PerformanceEntry[] = [];

  /**
   * Initialize performance monitoring
   */
  init(): void {
    try {
      // Check if Performance Observer is supported
      if (typeof PerformanceObserver === 'undefined') {
        devxLogger.warn('Performance Observer API not supported in this browser');
        return;
      }

      // Observe resource timing
      this.observeResources();

      // Observe layout shifts
      this.observeLayoutShifts();

      // Observe paint timing
      this.observePaintTiming();

      // Observe largest contentful paint
      this.observeLargestContentfulPaint();

      // Observe long tasks (if supported)
      this.observeLongTasks();

      // Log navigation timing
      this.logNavigationTiming();

      devxLogger.info('Performance Observer initialized');
    } catch (error) {
      devxLogger.error('Failed to initialize Performance Observer:', error);
    }
  }

  /**
   * Observe resource loading performance
   */
  private observeResources(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;

          // Track slow resources
          if (resource.duration > this.slowResourceThreshold) {
            this.slowResources.push(resource);
            devxLogger.warn(
              `Slow resource: ${resource.name} took ${resource.duration.toFixed(2)}ms`
            );
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      devxLogger.debug('Failed to observe resources:', error);
    }
  }

  /**
   * Observe layout shifts for CLS tracking
   */
  private observeLayoutShifts(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };

          // Only count shifts without recent user input
          if (!layoutShift.hadRecentInput && layoutShift.value > this.layoutShiftThreshold) {
            this.layoutShifts.push(entry);
            devxLogger.warn(`Layout shift detected: ${layoutShift.value.toFixed(4)}`);
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      devxLogger.debug('Failed to observe layout shifts:', error);
    }
  }

  /**
   * Observe paint timing (FP, FCP)
   */
  private observePaintTiming(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.paints.push(entry);
          devxLogger.info(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      devxLogger.debug('Failed to observe paint timing:', error);
    }
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLargestContentfulPaint(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          devxLogger.info(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      devxLogger.debug('Failed to observe LCP:', error);
    }
  }

  /**
   * Observe long tasks (tasks that block main thread > 50ms)
   */
  private observeLongTasks(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.longTasks.push(entry);
          devxLogger.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      // Long task API may not be supported in all browsers
      devxLogger.debug('Long task observer not supported');
    }
  }

  /**
   * Log navigation timing information
   */
  private logNavigationTiming(): void {
    // Wait for page load to complete
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
          devxLogger.info('Navigation Timing:', {
            'DNS Lookup': `${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`,
            'TCP Connection': `${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`,
            'Request Time': `${(navigation.responseStart - navigation.requestStart).toFixed(2)}ms`,
            'Response Time': `${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`,
            'DOM Processing': `${(navigation.domComplete - navigation.domLoading).toFixed(2)}ms`,
            'Total Load Time': `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`,
          });
        }
      }, 0);
    });
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
      slowResources: this.slowResources,
      longTasks: this.longTasks,
      layoutShifts: this.layoutShifts,
      navigation,
      paints: this.paints,
    };
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.slowResources = [];
    this.longTasks = [];
    this.layoutShifts = [];
    this.paints = [];
    devxLogger.debug('Performance Observer cleaned up');
  }
}
