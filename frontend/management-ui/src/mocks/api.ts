import { mockConfig } from "~/config";
import type {
  CrawlConfiguration,
  CrawlHistoryResponse,
  CrawlSchedule,
  EmbeddingTestQuery,
  EmbeddingTestResult,
  NavigationLink,
  StartCrawlResponse,
  SystemMetrics,
  Website,
} from "~/types";
import {
  mockCrawlConfiguration,
  mockCrawlHistory,
  mockCrawlSchedule,
  mockEmbeddingTestResult,
  mockNavigationLinks,
  mockSystemMetrics,
  mockWebsites,
} from "./data";

// Mock API Service from PRD Section 4.3.4
class MockApiService {
  private delay = () => new Promise((resolve) => setTimeout(resolve, mockConfig.delay));

  private shouldFail = () => Math.random() < mockConfig.failureRate;

  // System metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to fetch system metrics");
    }
    return mockSystemMetrics;
  }

  // Website endpoints
  async getWebsites(): Promise<Website[]> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to fetch websites");
    }
    return mockWebsites;
  }

  async getWebsite(id: string): Promise<Website> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to fetch website");
    }

    const website = mockWebsites.find((w) => w.id === id);
    if (!website) throw new Error("Website not found");
    return website;
  }

  // Navigation Links endpoints
  async getNavigationLinks(websiteId: string): Promise<NavigationLink[]> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to fetch navigation links");
    }

    return mockNavigationLinks.filter((link) => link.websiteId === websiteId);
  }

  // Embedding Test endpoint
  async testEmbedding(websiteId: string, query: EmbeddingTestQuery): Promise<EmbeddingTestResult> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to test embedding");
    }

    // Return mock result with the user's query
    return {
      ...mockEmbeddingTestResult,
      query: query.query,
    };
  }

  // Crawl Management endpoints
  async getCrawlSchedule(websiteId: string): Promise<CrawlSchedule> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to fetch crawl schedule");
    }
    return { ...mockCrawlSchedule };
  }

  async updateCrawlSchedule(websiteId: string, schedule: CrawlSchedule): Promise<CrawlSchedule> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to update crawl schedule");
    }
    return { ...schedule };
  }

  async getCrawlConfiguration(websiteId: string): Promise<CrawlConfiguration> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to fetch crawl configuration");
    }
    return { ...mockCrawlConfiguration };
  }

  async updateCrawlConfiguration(
    websiteId: string,
    config: CrawlConfiguration
  ): Promise<CrawlConfiguration> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to update crawl configuration");
    }
    return {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getCrawlHistory(
    websiteId: string,
    page: number = 0,
    pageSize: number = 10
  ): Promise<CrawlHistoryResponse> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to fetch crawl history");
    }

    const start = page * pageSize;
    const end = start + pageSize;
    const entries = mockCrawlHistory.slice(start, end);

    return {
      entries,
      total: mockCrawlHistory.length,
      page,
      pageSize,
    };
  }

  async startCrawl(websiteId: string): Promise<StartCrawlResponse> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to start crawl");
    }

    return {
      crawlId: `crawl-${Date.now()}`,
      status: "in-progress",
      startTime: new Date().toISOString(),
    };
  }

  async getCrawlStatus(
    websiteId: string,
    crawlId: string
  ): Promise<{ status: string; pagesIndexed: number }> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error("Mock: Failed to fetch crawl status");
    }

    // Simulate in-progress crawl
    return {
      status: "in-progress",
      pagesIndexed: Math.floor(Math.random() * 100),
    };
  }
}

export const mockApi = new MockApiService();
