/**
 * Memory Monitor
 *
 * Tracks JavaScript heap memory usage and detects potential memory leaks.
 * Uses the Performance Memory API (available in Chromium browsers).
 *
 * Features:
 * - Periodic memory snapshots
 * - Memory leak detection (increasing trend)
 * - Warning thresholds
 * - Memory usage reports
 */

import { devxLogger } from '../config/devx.config';

export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercentage: number;
}

export interface MemoryReport {
  currentSnapshot: MemorySnapshot;
  snapshots: MemorySnapshot[];
  trend: 'stable' | 'increasing' | 'decreasing';
  possibleLeak: boolean;
  averageUsed: number;
  peakUsed: number;
}

export class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private interval: number | null = null;
  private reportIntervalMs = 30000; // 30 seconds
  private maxSnapshots = 100; // Keep last 100 snapshots
  private warningThresholdPercentage = 80; // Warn at 80% usage
  private leakThreshold = 1.5; // 50% increase = potential leak

  /**
   * Initialize memory monitoring
   */
  init(): void {
    // Check if Performance Memory API is available
    if (!this.isMemoryAPIAvailable()) {
      devxLogger.warn(
        'Performance Memory API not available. Memory monitoring disabled.'
      );
      devxLogger.debug(
        'Memory API is only available in Chromium-based browsers with --enable-precise-memory-info flag'
      );
      return;
    }

    // Take initial snapshot
    this.takeSnapshot();

    // Start periodic monitoring
    this.interval = window.setInterval(() => {
      this.takeSnapshot();
      this.checkForWarnings();
    }, this.reportIntervalMs);

    devxLogger.debug(
      `Memory monitoring started (interval: ${this.reportIntervalMs}ms)`
    );
  }

  /**
   * Check if Performance Memory API is available
   */
  private isMemoryAPIAvailable(): boolean {
    return (
      typeof performance !== 'undefined' &&
      'memory' in performance &&
      performance.memory !== null
    );
  }

  /**
   * Take a memory snapshot
   */
  private takeSnapshot(): void {
    if (!this.isMemoryAPIAvailable()) return;

    const memory = (performance as Performance & { memory: PerformanceMemory }).memory;

    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };

    this.snapshots.push(snapshot);

    // Limit snapshots to prevent memory growth
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  /**
   * Check for warning conditions
   */
  private checkForWarnings(): void {
    const current = this.getCurrentSnapshot();
    if (!current) return;

    // Check high memory usage
    if (current.usedPercentage > this.warningThresholdPercentage) {
      devxLogger.warn(
        `High memory usage: ${current.usedPercentage.toFixed(2)}% (${this.formatBytes(current.usedJSHeapSize)} / ${this.formatBytes(current.jsHeapSizeLimit)})`
      );
    }

    // Check for potential memory leak
    if (this.detectMemoryLeak()) {
      devxLogger.warn(
        'Potential memory leak detected: Memory usage has increased significantly over time'
      );
    }
  }

  /**
   * Detect potential memory leak
   */
  private detectMemoryLeak(): boolean {
    if (this.snapshots.length < 10) return false; // Need at least 10 snapshots

    const firstTen = this.snapshots.slice(0, 10);
    const lastTen = this.snapshots.slice(-10);

    const avgFirst =
      firstTen.reduce((sum, s) => sum + s.usedJSHeapSize, 0) / firstTen.length;
    const avgLast =
      lastTen.reduce((sum, s) => sum + s.usedJSHeapSize, 0) / lastTen.length;

    // Memory leak if latest average is 50% higher than initial average
    return avgLast > avgFirst * this.leakThreshold;
  }

  /**
   * Calculate memory trend
   */
  private calculateTrend(): 'stable' | 'increasing' | 'decreasing' {
    if (this.snapshots.length < 5) return 'stable';

    const recent = this.snapshots.slice(-5);
    const increases = recent.reduce((count, snapshot, i) => {
      if (i === 0) return count;
      return snapshot.usedJSHeapSize > recent[i - 1].usedJSHeapSize
        ? count + 1
        : count;
    }, 0);

    if (increases >= 4) return 'increasing';
    if (increases <= 1) return 'decreasing';
    return 'stable';
  }

  /**
   * Get current memory snapshot
   */
  getCurrentSnapshot(): MemorySnapshot | null {
    return this.snapshots[this.snapshots.length - 1] || null;
  }

  /**
   * Get comprehensive memory report
   */
  getReport(): MemoryReport | null {
    const current = this.getCurrentSnapshot();
    if (!current) return null;

    const usedValues = this.snapshots.map((s) => s.usedJSHeapSize);

    return {
      currentSnapshot: current,
      snapshots: this.snapshots,
      trend: this.calculateTrend(),
      possibleLeak: this.detectMemoryLeak(),
      averageUsed: usedValues.reduce((sum, val) => sum + val, 0) / usedValues.length,
      peakUsed: Math.max(...usedValues),
    };
  }

  /**
   * Get memory statistics
   */
  getStats(): Record<string, string> {
    const current = this.getCurrentSnapshot();
    if (!current) return { status: 'Memory API not available' };

    return {
      'Current Usage': this.formatBytes(current.usedJSHeapSize),
      'Total Heap': this.formatBytes(current.totalJSHeapSize),
      'Heap Limit': this.formatBytes(current.jsHeapSizeLimit),
      'Usage %': `${current.usedPercentage.toFixed(2)}%`,
      Trend: this.calculateTrend(),
      'Possible Leak': this.detectMemoryLeak() ? 'Yes' : 'No',
    };
  }

  /**
   * Format bytes to human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): void {
    // Only available in Chrome with --js-flags="--expose-gc"
    if (typeof (global as unknown as { gc?: () => void }).gc === 'function') {
      (global as unknown as { gc: () => void }).gc();
      devxLogger.info('Garbage collection triggered');
    } else {
      devxLogger.warn(
        'Garbage collection not available. Start Chrome with --js-flags="--expose-gc"'
      );
    }
  }

  /**
   * Clear all snapshots
   */
  clear(): void {
    this.snapshots = [];
    devxLogger.debug('Memory snapshots cleared');
  }

  /**
   * Cleanup and stop monitoring
   */
  cleanup(): void {
    if (this.interval !== null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.snapshots = [];
    devxLogger.debug('Memory monitor cleaned up');
  }
}
