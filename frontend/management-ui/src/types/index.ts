// TypeScript models from PRD Section 4.4

export interface Website {
  id: string;
  appKey: string;
  name: string;
  type: "website" | "internal_app" | "mobile_app";
  description?: string;
  contact: {
    name: string;
    email: string;
    phone?: string;
    department?: string;
  };
  domains: {
    primary: string;
    scannableDomains: Array<{
      domain: string;
      isActive: boolean;
    }>;
  };
  crawlStatus?: {
    lastCrawl: string;
    pagesIndexed: number;
    status: "pending" | "in-progress" | "completed" | "failed";
  };
  createdAt: string;
  updatedAt: string;
}

export interface NavigationLink {
  id: string;
  websiteId: string;
  intent: string;
  displayName: string;
  targetUrl: string;
  isBookmarkable: boolean; // Whether user can be directly led to this page via URL
  parameters?: Array<{
    // Auto-detected parameters from dynamic URLs (e.g., {account}, {id})
    name: string; // Parameter name (e.g., "account")
    description?: string; // Optional description of what this parameter represents
    required: boolean; // Whether this parameter is required
  }>;
  hasForm?: boolean; // Whether this page contains a form
  formFields?: Array<{
    // Form fields that need to be filled
    label: string; // Field label (e.g., "Email Address", "Account Number")
    slot: string; // Slot/parameter name to collect from user (e.g., "email", "accountNumber")
    type?: "text" | "email" | "number" | "date" | "select" | "textarea"; // Field type
    required: boolean; // Whether this field is required
    placeholder?: string; // Optional placeholder text
  }>;
  keywords?: string[];
  description?: string;
  aiGuidance?: string; // Optional guidance for AI to understand the page
  screenshot?: string; // Screenshot URL or base64
  embeddingStatus?: "pending" | "processing" | "completed" | "failed"; // Status of embedding generation
  aiSummary?: {
    // AI-generated summary from screenshot analysis
    whatUsersSee: string; // Description of visual elements
    whatUsersCanDo: string; // Description of available actions
    generatedAt?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetConfig {
  appKey: string;
  scriptUrl: string;
  allowedDomains: string[];
  theme: "light" | "dark" | "auto";
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export interface SystemMetrics {
  serviceHealth: number;
  totalApplications: number;
  activeUsers: number;
  intentMatchRate: number;
}

// Embedding Test types
export interface EmbeddingTestQuery {
  query: string;
  maxResults?: number;
  minConfidence?: number;
}

export interface SlotInfo {
  name: string;
  type: string;
  description?: string;
}

export interface PageMatch {
  pageId: string;
  title: string;
  url: string;
  description?: string;
  matchScore: number; // 0-1 decimal
  matchedIntents: string[];
  slots: {
    matched: number;
    total: number;
    required: SlotInfo[];
  };
  isBestMatch: boolean;
}

export interface EmbeddingTestResult {
  query: string;
  totalMatches: number;
  results: PageMatch[];
}

// Crawl Management types
export type CrawlFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "manual";
export type CrawlStatus = "completed" | "in-progress" | "failed" | "cancelled";

export interface CrawlSchedule {
  frequency: CrawlFrequency;
  scheduledTime: string; // HH:MM format
  dayOfWeek?: number; // 0-6, Sunday-Saturday (only for weekly/biweekly/monthly)
  timezone: string;
  isActive: boolean;
}

export interface CrawlConfiguration {
  crawlDepth: number; // 1-10
  maxPages: number; // 10-10000
  lastUpdated?: string;
}

export interface CrawlHistoryEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: CrawlStatus;
  pagesIndexed: number;
  changes: number;
  duration?: number; // in seconds
  errorMessage?: string;
}

export interface CrawlHistoryResponse {
  entries: CrawlHistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StartCrawlRequest {
  websiteId: string;
}

export interface StartCrawlResponse {
  crawlId: string;
  status: CrawlStatus;
  startTime: string;
}
