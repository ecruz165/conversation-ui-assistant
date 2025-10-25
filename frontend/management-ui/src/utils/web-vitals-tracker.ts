/**
 * Web Vitals Tracker
 *
 * Tracks Core Web Vitals metrics using the web-vitals library.
 * Reports metrics to console in development and analytics endpoint in production.
 *
 * Core Web Vitals tracked (web-vitals v5.x):
 * - LCP (Largest Contentful Paint): Loading performance
 * - INP (Interaction to Next Paint): Responsiveness (replaces FID in v5.x)
 * - CLS (Cumulative Layout Shift): Visual stability
 *
 * Additional metrics:
 * - FCP (First Contentful Paint): Initial rendering
 * - TTFB (Time to First Byte): Server response time
 *
 * Note: FID (First Input Delay) was deprecated in web-vitals v4 and removed in v5
 */

import type { Metric } from "web-vitals";
import { devxLogger } from "../config/devx.config";

export interface WebVitalsConfig {
  reportToConsole?: boolean;
  reportToAnalytics?: boolean;
  analyticsEndpoint?: string;
  onMetric?: (metric: Metric) => void;
}

export class WebVitalsTracker {
  private config: Required<WebVitalsConfig>;
  private metrics: Map<string, Metric> = new Map();

  constructor(config: WebVitalsConfig = {}) {
    this.config = {
      reportToConsole: config.reportToConsole ?? import.meta.env.DEV,
      reportToAnalytics: config.reportToAnalytics ?? import.meta.env.PROD,
      analyticsEndpoint: config.analyticsEndpoint ?? "/api/analytics",
      onMetric: config.onMetric ?? (() => {}),
    };
  }

  /**
   * Initialize Web Vitals tracking
   * Dynamically imports web-vitals library and starts tracking metrics
   */
  async init(): Promise<void> {
    try {
      // Dynamically import web-vitals to avoid bundling if not needed
      // Note: web-vitals v5.x removed onFID in favor of onINP
      const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import("web-vitals");

      // Track all Core Web Vitals (v5.x compatible)
      onCLS(this.handleMetric.bind(this));
      onFCP(this.handleMetric.bind(this));
      onLCP(this.handleMetric.bind(this));
      onTTFB(this.handleMetric.bind(this));
      onINP(this.handleMetric.bind(this));

      devxLogger.info("Web Vitals tracking initialized");
    } catch (error) {
      devxLogger.error("Failed to initialize Web Vitals:", error);
      console.error(
        "Web Vitals tracking failed to initialize. Install web-vitals with: npm install web-vitals"
      );
    }
  }

  /**
   * Handle a metric report
   */
  private handleMetric(metric: Metric): void {
    // Store the metric
    this.metrics.set(metric.name, metric);

    // Report to console in development
    if (this.config.reportToConsole) {
      this.logMetricToConsole(metric);
    }

    // Report to analytics in production
    if (this.config.reportToAnalytics) {
      this.sendMetricToAnalytics(metric);
    }

    // Call custom callback if provided
    this.config.onMetric(metric);
  }

  /**
   * Log metric to console with color coding based on thresholds
   */
  private logMetricToConsole(metric: Metric): void {
    const rating = this.getMetricRating(metric);
    const color = rating === "good" ? "🟢" : rating === "needs-improvement" ? "🟡" : "🔴";

    console.log(
      `${color} ${metric.name}: ${metric.value.toFixed(2)}${this.getMetricUnit(metric.name)} (${rating})`,
      metric
    );
  }

  /**
   * Send metric to analytics endpoint
   */
  private async sendMetricToAnalytics(metric: Metric): Promise<void> {
    try {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      // Use sendBeacon if available (doesn't block page unload)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.config.analyticsEndpoint, body);
      } else {
        // Fallback to fetch
        fetch(this.config.analyticsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true, // Keep request alive even if page unloads
        }).catch((error) => {
          devxLogger.debug("Failed to send metric to analytics:", error);
        });
      }
    } catch (error) {
      devxLogger.debug("Failed to send metric to analytics:", error);
    }
  }

  /**
   * Get metric rating based on Core Web Vitals thresholds
   */
  private getMetricRating(metric: Metric): "good" | "needs-improvement" | "poor" {
    // Use the rating from web-vitals if available
    if (metric.rating) {
      return metric.rating;
    }

    // Fallback to manual thresholds
    const thresholds: Record<string, [number, number]> = {
      LCP: [2500, 4000], // ms
      FID: [100, 300], // ms
      CLS: [0.1, 0.25], // score
      FCP: [1800, 3000], // ms
      TTFB: [800, 1800], // ms
      INP: [200, 500], // ms
    };

    const [goodThreshold, poorThreshold] = thresholds[metric.name] || [0, 0];

    if (metric.value <= goodThreshold) return "good";
    if (metric.value <= poorThreshold) return "needs-improvement";
    return "poor";
  }

  /**
   * Get the appropriate unit for a metric
   */
  private getMetricUnit(metricName: string): string {
    if (metricName === "CLS") return "";
    return "ms";
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): Map<string, Metric> {
    return this.metrics;
  }

  /**
   * Get a specific metric by name
   */
  getMetric(name: string): Metric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get summary of all metrics
   */
  getSummary(): Record<string, { value: number; rating: string }> {
    const summary: Record<string, { value: number; rating: string }> = {};

    this.metrics.forEach((metric, name) => {
      summary[name] = {
        value: metric.value,
        rating: this.getMetricRating(metric),
      };
    });

    return summary;
  }
}
