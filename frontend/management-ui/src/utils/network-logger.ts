/**
 * Network Logger
 *
 * Intercepts and logs all network requests made by the application.
 * Provides detailed timing, size, and status information for debugging.
 *
 * Features:
 * - Fetch API interception
 * - XMLHttpRequest interception
 * - Request/response logging
 * - Performance timing
 * - Request size tracking
 * - Statistics generation
 */

import { devxLogger } from '../config/devx.config';

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  statusText?: string;
  requestSize?: number;
  responseSize?: number;
  responseType?: string;
  error?: Error;
}

export class NetworkLogger {
  private requests: Map<string, NetworkRequest> = new Map();
  private requestCounter = 0;
  private maxRequests = 100; // Keep last 100 requests
  private originalFetch: typeof fetch;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send;

  constructor() {
    // Store original implementations
    this.originalFetch = window.fetch;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  /**
   * Initialize network logging
   */
  init(): void {
    this.interceptFetch();
    this.interceptXHR();
    devxLogger.debug('Network logger initialized');
  }

  /**
   * Intercept Fetch API
   */
  private interceptFetch(): void {
    const self = this;

    window.fetch = async function (...args: Parameters<typeof fetch>): Promise<Response> {
      const requestId = self.generateRequestId();
      const [input, init] = args;
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';

      // Log request start
      const request: NetworkRequest = {
        id: requestId,
        method,
        url,
        startTime: Date.now(),
      };

      // Calculate request size if body exists
      if (init?.body) {
        request.requestSize = self.calculateSize(init.body);
      }

      self.requests.set(requestId, request);
      self.limitRequests();

      devxLogger.debug(`→ ${method} ${url}`);

      try {
        // Make the actual request
        const response = await self.originalFetch.apply(this, args);

        // Clone response to read body without consuming it
        const clonedResponse = response.clone();

        // Log response
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
        request.status = response.status;
        request.statusText = response.statusText;
        request.responseType = response.headers.get('content-type') || 'unknown';

        // Try to get response size
        try {
          const blob = await clonedResponse.blob();
          request.responseSize = blob.size;
        } catch (e) {
          // Silently fail if can't get size
        }

        self.logResponse(request);

        return response;
      } catch (error) {
        // Log error
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
        request.error = error as Error;

        devxLogger.error(`✗ ${method} ${url} failed:`, error);

        throw error;
      }
    };
  }

  /**
   * Intercept XMLHttpRequest
   */
  private interceptXHR(): void {
    const self = this;

    // Intercept XHR open
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      ...args: unknown[]
    ): void {
      const requestId = self.generateRequestId();

      // Store request info on XHR object
      (this as XMLHttpRequest & { __requestId?: string }).__requestId = requestId;

      const urlString = typeof url === 'string' ? url : url.toString();

      const request: NetworkRequest = {
        id: requestId,
        method,
        url: urlString,
        startTime: Date.now(),
      };

      self.requests.set(requestId, request);
      self.limitRequests();

      devxLogger.debug(`→ ${method} ${urlString}`);

      // Call original open
      return self.originalXHROpen.call(this, method, url, ...args);
    };

    // Intercept XHR send
    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit): void {
      const requestId = (this as XMLHttpRequest & { __requestId?: string }).__requestId;
      if (!requestId) {
        return self.originalXHRSend.call(this, body);
      }

      const request = self.requests.get(requestId);
      if (!request) {
        return self.originalXHRSend.call(this, body);
      }

      // Calculate request size
      if (body) {
        request.requestSize = self.calculateSize(body);
      }

      // Add load event listener
      this.addEventListener('load', () => {
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
        request.status = this.status;
        request.statusText = this.statusText;
        request.responseType = this.getResponseHeader('content-type') || 'unknown';

        // Get response size
        const contentLength = this.getResponseHeader('content-length');
        if (contentLength) {
          request.responseSize = parseInt(contentLength, 10);
        }

        self.logResponse(request);
      });

      // Add error event listener
      this.addEventListener('error', () => {
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
        request.error = new Error('Network request failed');

        devxLogger.error(`✗ ${request.method} ${request.url} failed`);
      });

      // Call original send
      return self.originalXHRSend.call(this, body);
    };
  }

  /**
   * Log response details
   */
  private logResponse(request: NetworkRequest): void {
    const statusColor = this.getStatusColor(request.status);
    const timing = request.duration ? `${request.duration}ms` : 'N/A';
    const size = request.responseSize ? this.formatBytes(request.responseSize) : 'N/A';

    devxLogger.debug(
      `${statusColor} ${request.method} ${request.url} - ${request.status} (${timing}, ${size})`
    );
  }

  /**
   * Get color indicator for status code
   */
  private getStatusColor(status?: number): string {
    if (!status) return '●';
    if (status >= 200 && status < 300) return '✓';
    if (status >= 300 && status < 400) return '↻';
    if (status >= 400 && status < 500) return '⚠';
    return '✗';
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${++this.requestCounter}_${Date.now()}`;
  }

  /**
   * Calculate size of request body
   */
  private calculateSize(body: unknown): number {
    if (typeof body === 'string') {
      return new Blob([body]).size;
    }
    if (body instanceof Blob) {
      return body.size;
    }
    if (body instanceof ArrayBuffer) {
      return body.byteLength;
    }
    if (body instanceof FormData) {
      // FormData size is approximate
      return 0; // Can't accurately calculate without iterating
    }
    return 0;
  }

  /**
   * Limit number of stored requests
   */
  private limitRequests(): void {
    if (this.requests.size > this.maxRequests) {
      // Remove oldest request
      const firstKey = this.requests.keys().next().value;
      if (firstKey) {
        this.requests.delete(firstKey);
      }
    }
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
   * Get all logged requests
   */
  getRequests(): NetworkRequest[] {
    return Array.from(this.requests.values());
  }

  /**
   * Get statistics
   */
  getStats(): Record<string, string | number> {
    const requests = this.getRequests();
    const completedRequests = requests.filter((r) => r.endTime);

    const avgDuration =
      completedRequests.reduce((sum, r) => sum + (r.duration || 0), 0) /
      (completedRequests.length || 1);

    const totalSize = completedRequests.reduce(
      (sum, r) => sum + (r.responseSize || 0),
      0
    );

    const successCount = requests.filter(
      (r) => r.status && r.status >= 200 && r.status < 300
    ).length;
    const errorCount = requests.filter((r) => r.error || (r.status && r.status >= 400)).length;

    return {
      'Total Requests': requests.length,
      'Completed': completedRequests.length,
      'Success': successCount,
      'Errors': errorCount,
      'Avg Duration': `${avgDuration.toFixed(2)}ms`,
      'Total Data': this.formatBytes(totalSize),
    };
  }

  /**
   * Clear all logged requests
   */
  clear(): void {
    this.requests.clear();
    this.requestCounter = 0;
    devxLogger.debug('Network logger cleared');
  }

  /**
   * Cleanup and restore original implementations
   */
  cleanup(): void {
    window.fetch = this.originalFetch;
    XMLHttpRequest.prototype.open = this.originalXHROpen;
    XMLHttpRequest.prototype.send = this.originalXHRSend;
    this.clear();
    devxLogger.debug('Network logger cleaned up');
  }
}
