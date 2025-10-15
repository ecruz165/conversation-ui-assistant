import { mockWebsites, mockNavigationLinks, mockSystemMetrics } from './data';
import { mockConfig } from '~/config';
import type { Website, NavigationLink, SystemMetrics } from '~/types';

// Mock API Service from PRD Section 4.3.4
class MockApiService {
  private delay = () =>
    new Promise(resolve => setTimeout(resolve, mockConfig.delay));

  private shouldFail = () =>
    Math.random() < mockConfig.failureRate;

  // System metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to fetch system metrics');
    }
    return mockSystemMetrics;
  }

  // Website endpoints
  async getWebsites(): Promise<Website[]> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to fetch websites');
    }
    return mockWebsites;
  }

  async getWebsite(id: string): Promise<Website> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to fetch website');
    }

    const website = mockWebsites.find(w => w.id === id);
    if (!website) throw new Error('Website not found');
    return website;
  }

  // Navigation Links endpoints
  async getNavigationLinks(websiteId: string): Promise<NavigationLink[]> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to fetch navigation links');
    }

    return mockNavigationLinks.filter(link => link.websiteId === websiteId);
  }
}

export const mockApi = new MockApiService();
