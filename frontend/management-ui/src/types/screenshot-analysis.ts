// Screenshot analysis types for multi-modal embeddings

export interface PageRegion {
  id: string;
  type: "header" | "navigation" | "content" | "sidebar" | "footer" | "form" | "card" | "modal" | "other";
  boundingBox: {
    x: number; // Top-left x coordinate
    y: number; // Top-left y coordinate
    width: number;
    height: number;
  };
  confidence: number; // 0-1, confidence in region detection
  description?: string; // AI-generated description of region content
  visualElements?: Array<{
    type: "button" | "link" | "input" | "image" | "text" | "icon";
    text?: string; // Extracted text content
    position: { x: number; y: number };
  }>;
  embedding?: number[]; // 1536-dim embedding vector for this region
}

export interface ScreenshotAnalysisRequest {
  websiteId: string;
  pageId?: string; // Optional, for updating existing page
  screenshotUrl?: string; // URL to screenshot
  screenshotBase64?: string; // Or base64-encoded screenshot
  analysisOptions?: {
    generateEmbeddings: boolean; // Whether to generate embeddings (default: true)
    detectRegions: boolean; // Whether to detect page regions (default: true)
    extractText: boolean; // Whether to extract text from screenshot (default: true)
    analyzeAccessibility: boolean; // Whether to analyze accessibility (default: false)
    modelPreference?: "gpt-4-vision" | "claude-3-opus" | "gemini-pro-vision"; // AI model to use
  };
}

export interface ScreenshotAnalysisResult {
  pageId: string;
  analysisId: string;
  status: "completed" | "failed" | "processing";
  screenshot: {
    url?: string;
    dimensions: {
      width: number;
      height: number;
    };
    format: "png" | "jpeg" | "webp";
    size: number; // in bytes
  };
  regions: PageRegion[]; // Detected page regions
  textContent: {
    extracted: string; // All extracted text
    headings: string[]; // Detected headings
    links: Array<{ text: string; href?: string }>;
    buttons: string[]; // Button labels
    formFields: Array<{ label: string; type: string }>;
  };
  visualSummary: {
    colorPalette: string[]; // Dominant colors (hex codes)
    layout: "single-column" | "multi-column" | "grid" | "complex";
    density: "sparse" | "moderate" | "dense";
    brandElements: {
      logo?: { x: number; y: number; width: number; height: number };
      primaryColor?: string;
    };
  };
  embeddings: {
    fullPage: number[]; // 1536-dim embedding for entire screenshot
    regions: Array<{
      regionId: string;
      embedding: number[]; // 1536-dim embedding for region
    }>;
    textBased?: number[]; // Optional text-only embedding
    visualBased?: number[]; // Optional vision-only embedding
  };
  accessibility?: {
    contrastRatio: number;
    hasAltText: boolean;
    keyboardNavigable: boolean;
    screenReaderFriendly: boolean;
    issues: Array<{
      severity: "critical" | "warning" | "info";
      description: string;
      location?: { x: number; y: number };
    }>;
  };
  metadata: {
    analyzedAt: string;
    processingDuration: number; // in milliseconds
    modelUsed: string;
    confidence: number; // Overall confidence in analysis (0-1)
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface BatchScreenshotAnalysisRequest {
  websiteId: string;
  screenshots: Array<{
    pageId?: string;
    url?: string;
    base64?: string;
  }>;
  analysisOptions?: ScreenshotAnalysisRequest["analysisOptions"];
}

export interface BatchScreenshotAnalysisResult {
  batchId: string;
  totalPages: number;
  completed: number;
  failed: number;
  results: ScreenshotAnalysisResult[];
  summary: {
    averageProcessingTime: number; // in milliseconds
    totalEmbeddingsGenerated: number;
    overallSuccessRate: number; // 0-1
  };
}
