// TypeScript models from PRD Section 4.4

// Re-export screenshot analysis types
export type {
  PageRegion,
  ScreenshotAnalysisRequest,
  ScreenshotAnalysisResult,
  BatchScreenshotAnalysisRequest,
  BatchScreenshotAnalysisResult,
} from "./screenshot-analysis";

// Multi-modal embedding types
export type EmbeddingModality = "text" | "visual" | "metadata" | "combined";

export interface EmbeddingData {
  vector: number[]; // Embedding vector
  modality: EmbeddingModality; // Type of embedding
  source: string; // Source of the embedding (e.g., "page-title", "screenshot", "meta-description")
  confidence?: number; // Confidence score (0-1)
  metadata?: Record<string, unknown>; // Additional metadata about the embedding
}

// Enhanced Multi-Modal Embedding Structure (6 embedding types)
export interface EnhancedPageEmbedding {
  // Core embeddings (original 3)
  functionalityEmbedding: number[]; // "What you can do" - capabilities and features
  contentEmbedding: number[]; // "What you can see" - visible content and layout
  purposeEmbedding: number[]; // "Purpose of page" - intent and goal

  // Additional valuable embeddings
  actionEmbedding: number[]; // Extracted CTAs and buttons - specific actions
  dataContextEmbedding: number[]; // Data/entities shown - domain objects
  userTaskEmbedding: number[]; // Common user tasks - workflows and processes

  // Metadata
  path: string;
  pageTitle: string;
  primaryActions: string[]; // List of main CTAs/buttons
  dataEntities: string[]; // List of data entities (e.g., "invoices", "accounts", "customers")

  // Analysis metadata
  extractedAt: string;
  modelUsed: string;
  confidence: number; // Overall confidence score (0-1)
}

export interface MultiModalEmbedding {
  id: string;
  pageId: string;
  embeddings: EmbeddingData[]; // Collection of embeddings from different modalities (legacy)
  combinedEmbedding?: number[]; // Optional combined/fused embedding vector

  // Enhanced embedding structure
  enhanced?: EnhancedPageEmbedding; // New 6-embedding structure

  createdAt: string;
  updatedAt: string;
}

export interface VisualElement {
  type: "button" | "link" | "form" | "image" | "text" | "heading" | "navigation" | "other";
  description: string;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: string; // Associated text content
}

export interface PageAnalysis {
  pageId: string;
  visualElements: VisualElement[]; // Detected visual elements from screenshot
  contentStructure: {
    headings: string[];
    paragraphs: number;
    links: number;
    forms: number;
    images: number;
  };
  interactions: {
    clickableElements: number;
    inputFields: number;
    buttons: number;
  };
  accessibility: {
    hasAltText: boolean;
    hasAriaLabels: boolean;
    contrastRatio?: number;
  };
  performance?: {
    loadTime: number; // in milliseconds
    pageSize: number; // in bytes
  };
  analyzedAt: string;
}

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
  searchConfiguration?: {
    defaultModalityWeights?: {
      text: number;
      visual: number;
      metadata: number;
    };
    description?: string;
    updatedAt?: string;
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
  startingPath?: string; // For journey pages - the path where the journey begins (crawler-detected or manually set)
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
  screenshotMetadata?: {
    // Metadata about how the screenshot was captured
    captureType: "viewport" | "full-page" | "selection"; // Type of screenshot capture
    dimensions: {
      width: number; // Screenshot width in pixels
      height: number; // Screenshot height in pixels
      viewportHeight?: number; // Original viewport height (for full-page captures)
    };
    capturedAt: string; // ISO timestamp
    fileSize?: number; // Size in bytes
  };
  embeddingStatus?: "pending" | "processing" | "completed" | "failed"; // Status of embedding generation
  aiSummary?: {
    // AI-generated summary from screenshot analysis
    whatUsersSee: string[]; // Array of visual element descriptions (bullet points)
    whatUsersCanDo: string[]; // Array of available actions (bullet points)
    generatedAt?: string;
  };
  // Multi-modal embedding support
  multiModalEmbedding?: MultiModalEmbedding; // Rich multi-modal embeddings
  pageAnalysis?: PageAnalysis; // Detailed page analysis results
  embeddingMetadata?: {
    textEmbeddingGenerated: boolean;
    visualEmbeddingGenerated: boolean;
    metadataEmbeddingGenerated: boolean;
    lastEmbeddingUpdate?: string;
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
  useMultiModal?: boolean; // Whether to use multi-modal embeddings for search
  modalityWeights?: {
    // Custom weights for different modalities in search (legacy)
    text?: number; // 0-1, default 0.5
    visual?: number; // 0-1, default 0.3
    metadata?: number; // 0-1, default 0.2
  };
  // Enhanced weights (6 embedding types)
  enhancedWeights?: Partial<EnhancedEmbeddingWeights>;
  useEnhancedEmbeddings?: boolean; // Whether to use 6-embedding structure
}

export interface SlotInfo {
  name: string;
  type: string;
  description?: string;
}

export interface ModalityMatchScore {
  modality: EmbeddingModality;
  score: number; // 0-1
  contributionWeight: number; // How much this modality contributed to final score
}

// Enhanced Modality Scoring (6 embedding types)
export type EnhancedEmbeddingType =
  | "functionality"
  | "content"
  | "purpose"
  | "action"
  | "dataContext"
  | "userTask";

export interface EnhancedModalityScore {
  type: EnhancedEmbeddingType;
  score: number; // 0-1 similarity score
  weight: number; // Weight applied (0-1)
  contribution: number; // weight * score
  label: string; // Display label
}

export interface EnhancedEmbeddingWeights {
  functionality: number;
  content: number;
  purpose: number;
  action: number;
  dataContext: number;
  userTask: number;
}

export interface PageMatch {
  pageId: string;
  title: string;
  url: string;
  description?: string;
  matchScore: number; // 0-1 decimal (combined score across modalities)
  modalityScores?: ModalityMatchScore[]; // Breakdown by modality (legacy)
  enhancedScores?: EnhancedModalityScore[]; // Enhanced 6-embedding breakdown
  matchedIntents: string[];
  slots: {
    matched: number;
    total: number;
    required: SlotInfo[];
  };
  isBestMatch: boolean;
  visualPreview?: string; // Screenshot or visual preview URL
  matchedVisualElements?: VisualElement[]; // Visual elements that contributed to match
  analysisData?: {
    // Simplified page analysis data for display
    hasForm: boolean;
    interactionComplexity: "low" | "medium" | "high";
    contentDensity: "sparse" | "moderate" | "dense";
  };
  // Enhanced embedding metadata
  primaryActions?: string[]; // Main CTAs/buttons on this page
  dataEntities?: string[]; // Data entities present on this page
}

export interface EmbeddingTestResult {
  query: string;
  totalMatches: number;
  results: PageMatch[];
  searchMetadata?: {
    multiModalUsed: boolean;
    averageConfidence: number;
    modalitiesUsed: EmbeddingModality[];
    searchDuration: number; // in milliseconds
  };
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

// Synthetic Query types
export type QueryType =
  | "show_me"
  | "i_want_to"
  | "where_can_i"
  | "navigate_to"
  | "find_my"
  | "how_do_i"
  | "other";

export interface SyntheticQuery {
  id: string;
  query: string;
  queryType?: QueryType;
  expectedPageId: string;
  validated: boolean;
  matchScore?: number;
  createdAt?: string;
  lastValidated?: string;
}

export interface GenerateSyntheticQueriesData {
  pageId?: string;
  count?: number;
  queryTypes?: QueryType[];
  useMultiModal?: boolean;
}

export interface GeneratedQuery {
  query: string;
  queryType: QueryType;
  expectedPageId: string;
  confidence: number;
}

export interface ValidateSyntheticQueryData {
  query: string;
  expectedPageId: string;
}

export interface ValidateSyntheticQueryResult {
  query: string;
  expectedPageId: string;
  actualBestMatch: string;
  matchScore: number;
  isValid: boolean;
  issues?: string[];
}
