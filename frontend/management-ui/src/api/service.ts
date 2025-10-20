import { apiConfig } from "~/config";
import type {
  CrawlConfiguration,
  CrawlHistoryResponse,
  CrawlSchedule,
  EmbeddingTestQuery,
  EmbeddingTestResult,
  NavigationLink,
  ScreenshotAnalysisRequest,
  ScreenshotAnalysisResult,
  StartCrawlResponse,
  SyntheticQuery,
  SystemMetrics,
  Website,
} from "~/types";

// Real API Service for production use
class ApiService {
  private baseUrl = apiConfig.baseUrl;
  private navigationUrl = apiConfig.navigationUrl;

  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json();
  }

  // System Metrics (from Navigation Service)
  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.fetchJson<SystemMetrics>(`${this.navigationUrl}/metrics/system`);
  }

  // Website endpoints (from Management Service)
  async getWebsites(): Promise<Website[]> {
    return this.fetchJson<Website[]>(`${this.baseUrl}/websites`);
  }

  async getWebsite(id: string): Promise<Website> {
    return this.fetchJson<Website>(`${this.baseUrl}/websites/${id}`);
  }

  async createWebsite(data: Partial<Website>): Promise<Website> {
    return this.fetchJson<Website>(`${this.baseUrl}/websites`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWebsite(id: string, data: Partial<Website>): Promise<Website> {
    return this.fetchJson<Website>(`${this.baseUrl}/websites/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWebsite(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/websites/${id}`, {
      method: "DELETE",
    });
  }

  // Navigation Links endpoints (from Management Service)
  async getNavigationLinks(websiteId: string): Promise<NavigationLink[]> {
    return this.fetchJson<NavigationLink[]>(
      `${this.baseUrl}/websites/${websiteId}/navigation-links`
    );
  }

  async getNavigationLink(websiteId: string, linkId: string): Promise<NavigationLink> {
    return this.fetchJson<NavigationLink>(
      `${this.baseUrl}/websites/${websiteId}/navigation-links/${linkId}`
    );
  }

  async createNavigationLink(
    websiteId: string,
    data: Partial<NavigationLink>
  ): Promise<NavigationLink> {
    return this.fetchJson<NavigationLink>(
      `${this.baseUrl}/websites/${websiteId}/navigation-links`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async updateNavigationLink(
    websiteId: string,
    linkId: string,
    data: Partial<NavigationLink>
  ): Promise<NavigationLink> {
    return this.fetchJson<NavigationLink>(
      `${this.baseUrl}/websites/${websiteId}/navigation-links/${linkId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteNavigationLink(websiteId: string, linkId: string): Promise<void> {
    await fetch(`${this.baseUrl}/websites/${websiteId}/navigation-links/${linkId}`, {
      method: "DELETE",
    });
  }

  async bulkUpdateNavigationLinksActive(
    websiteId: string,
    linkIds: string[],
    isActive: boolean
  ): Promise<void> {
    await this.fetchJson(`${this.baseUrl}/websites/${websiteId}/navigation-links/bulk/active`, {
      method: "PATCH",
      body: JSON.stringify({ linkIds, isActive }),
    });
  }

  async bulkDeleteNavigationLinks(websiteId: string, linkIds: string[]): Promise<void> {
    await fetch(`${this.baseUrl}/websites/${websiteId}/navigation-links/bulk`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ linkIds }),
    });
  }

  // Embedding Test endpoint (from Navigation Service via Management Service)
  async testEmbedding(websiteId: string, query: EmbeddingTestQuery): Promise<EmbeddingTestResult> {
    return this.fetchJson<EmbeddingTestResult>(
      `${this.baseUrl}/websites/${websiteId}/test-embedding`,
      {
        method: "POST",
        body: JSON.stringify(query),
      }
    );
  }

  // Crawl Management endpoints (from Management Service)
  async getCrawlSchedule(websiteId: string): Promise<CrawlSchedule> {
    return this.fetchJson<CrawlSchedule>(`${this.baseUrl}/websites/${websiteId}/crawl-schedule`);
  }

  async updateCrawlSchedule(websiteId: string, schedule: CrawlSchedule): Promise<CrawlSchedule> {
    return this.fetchJson<CrawlSchedule>(`${this.baseUrl}/websites/${websiteId}/crawl-schedule`, {
      method: "PUT",
      body: JSON.stringify(schedule),
    });
  }

  async getCrawlConfiguration(websiteId: string): Promise<CrawlConfiguration> {
    return this.fetchJson<CrawlConfiguration>(`${this.baseUrl}/websites/${websiteId}/crawl-config`);
  }

  async updateCrawlConfiguration(
    websiteId: string,
    config: CrawlConfiguration
  ): Promise<CrawlConfiguration> {
    return this.fetchJson<CrawlConfiguration>(
      `${this.baseUrl}/websites/${websiteId}/crawl-config`,
      {
        method: "PUT",
        body: JSON.stringify(config),
      }
    );
  }

  async getCrawlHistory(
    websiteId: string,
    page: number = 0,
    pageSize: number = 10
  ): Promise<CrawlHistoryResponse> {
    return this.fetchJson<CrawlHistoryResponse>(
      `${this.baseUrl}/websites/${websiteId}/crawl-history?page=${page}&pageSize=${pageSize}`
    );
  }

  async startCrawl(websiteId: string): Promise<StartCrawlResponse> {
    return this.fetchJson<StartCrawlResponse>(`${this.baseUrl}/websites/${websiteId}/crawl/start`, {
      method: "POST",
    });
  }

  async getCrawlStatus(
    websiteId: string,
    crawlId: string
  ): Promise<{ status: string; pagesIndexed: number }> {
    return this.fetchJson(`${this.baseUrl}/websites/${websiteId}/crawl/${crawlId}/status`);
  }

  // Screenshot Analysis endpoints
  async uploadScreenshotForAnalysis(
    websiteId: string,
    request: ScreenshotAnalysisRequest
  ): Promise<ScreenshotAnalysisResult> {
    return this.fetchJson<ScreenshotAnalysisResult>(
      `${this.baseUrl}/websites/${websiteId}/screenshot-analysis`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async getAnalysisJobStatus(
    websiteId: string,
    analysisId: string
  ): Promise<ScreenshotAnalysisResult> {
    return this.fetchJson<ScreenshotAnalysisResult>(
      `${this.baseUrl}/websites/${websiteId}/screenshot-analysis/${analysisId}`
    );
  }

  async getAnalysisHistory(
    websiteId: string,
    page: number = 0,
    pageSize: number = 10
  ): Promise<{
    entries: ScreenshotAnalysisResult[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return this.fetchJson(
      `${this.baseUrl}/websites/${websiteId}/screenshot-analysis/history?page=${page}&pageSize=${pageSize}`
    );
  }

  async getAnalysisVersion(
    websiteId: string,
    pageId: string,
    version: number
  ): Promise<ScreenshotAnalysisResult> {
    return this.fetchJson<ScreenshotAnalysisResult>(
      `${this.baseUrl}/websites/${websiteId}/pages/${pageId}/analysis/versions/${version}`
    );
  }

  // Enhanced Embedding Test endpoints
  async testEnhancedEmbedding(
    websiteId: string,
    query: EmbeddingTestQuery
  ): Promise<EmbeddingTestResult> {
    return this.fetchJson<EmbeddingTestResult>(
      `${this.baseUrl}/websites/${websiteId}/test-embedding/enhanced`,
      {
        method: "POST",
        body: JSON.stringify(query),
      }
    );
  }

  async compareEmbeddings(
    websiteId: string,
    data: {
      pageId: string;
      comparisonType: "text-vs-visual" | "old-vs-new" | "multiple";
      versions?: number[];
    }
  ): Promise<{
    pageId: string;
    comparisons: Array<{
      type: string;
      similarity: number;
      differences: string[];
    }>;
  }> {
    return this.fetchJson(`${this.baseUrl}/websites/${websiteId}/embeddings/compare`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Synthetic Queries endpoints
  async getSyntheticQueries(websiteId: string, pageId?: string): Promise<SyntheticQuery[]> {
    const url = pageId
      ? `${this.baseUrl}/websites/${websiteId}/synthetic-queries?pageId=${pageId}`
      : `${this.baseUrl}/websites/${websiteId}/synthetic-queries`;
    return this.fetchJson(url);
  }

  async generateSyntheticQueries(
    websiteId: string,
    data: {
      pageId?: string;
      count?: number;
      useMultiModal?: boolean;
    }
  ): Promise<
    Array<{
      query: string;
      expectedPageId: string;
      confidence: number;
    }>
  > {
    return this.fetchJson(`${this.baseUrl}/websites/${websiteId}/synthetic-queries/generate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async validateSyntheticQuery(
    websiteId: string,
    data: {
      query: string;
      expectedPageId: string;
    }
  ): Promise<{
    query: string;
    expectedPageId: string;
    actualBestMatch: string;
    matchScore: number;
    isValid: boolean;
    issues?: string[];
  }> {
    return this.fetchJson(`${this.baseUrl}/websites/${websiteId}/synthetic-queries/validate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
