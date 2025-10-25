/**
 * MSW Browser Worker Setup
 *
 * Configures Mock Service Worker for development and testing environments.
 * Intercepts HTTP requests and returns mock data based on handlers.
 *
 * Features:
 * - Environment-based activation via DevX config
 * - Request interception for all API endpoints
 * - Fallback to real API when mocks not defined
 * - Global controls for runtime enable/disable
 */

import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { mockApi } from './api';

// Define MSW handlers for all API endpoints
const handlers = [
  // System metrics
  http.get('/api/metrics', async () => {
    try {
      const data = await mockApi.getSystemMetrics();
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  // Website endpoints
  http.get('/api/websites', async () => {
    try {
      const data = await mockApi.getWebsites();
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  http.get('/api/websites/:id', async ({ params }) => {
    try {
      const data = await mockApi.getWebsite(params.id as string);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 404 }
      );
    }
  }),

  // Navigation links
  http.get('/api/websites/:websiteId/links', async ({ params }) => {
    try {
      const data = await mockApi.getNavigationLinks(params.websiteId as string);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  // Embedding test
  http.post('/api/websites/:websiteId/embeddings/test', async ({ params, request }) => {
    try {
      const query = await request.json();
      const data = await mockApi.testEmbedding(params.websiteId as string, query as any);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  // Crawl management - schedule
  http.get('/api/websites/:websiteId/crawl/schedule', async ({ params }) => {
    try {
      const data = await mockApi.getCrawlSchedule(params.websiteId as string);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  http.put('/api/websites/:websiteId/crawl/schedule', async ({ params, request }) => {
    try {
      const schedule = await request.json();
      const data = await mockApi.updateCrawlSchedule(params.websiteId as string, schedule as any);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  // Crawl management - configuration
  http.get('/api/websites/:websiteId/crawl/config', async ({ params }) => {
    try {
      const data = await mockApi.getCrawlConfiguration(params.websiteId as string);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  http.put('/api/websites/:websiteId/crawl/config', async ({ params, request }) => {
    try {
      const config = await request.json();
      const data = await mockApi.updateCrawlConfiguration(params.websiteId as string, config as any);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  // Crawl management - history
  http.get('/api/websites/:websiteId/crawl/history', async ({ params, request }) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '0', 10);
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
      const data = await mockApi.getCrawlHistory(params.websiteId as string, page, pageSize);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  // Crawl management - start crawl
  http.post('/api/websites/:websiteId/crawl/start', async ({ params }) => {
    try {
      const data = await mockApi.startCrawl(params.websiteId as string);
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),

  // Crawl management - crawl status
  http.get('/api/websites/:websiteId/crawl/:crawlId/status', async ({ params }) => {
    try {
      const data = await mockApi.getCrawlStatus(
        params.websiteId as string,
        params.crawlId as string
      );
      return HttpResponse.json(data);
    } catch (error) {
      return HttpResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }),
];

// Create and export the worker
export const worker = setupWorker(...handlers);

// Export handlers for testing
export { handlers };
