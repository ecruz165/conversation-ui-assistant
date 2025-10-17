import type {
  CrawlConfiguration,
  CrawlHistoryEntry,
  CrawlSchedule,
  EmbeddingTestResult,
  NavigationLink,
  SystemMetrics,
  Website,
} from "~/types";

// Mock websites from PRD Section 4.3.3
export const mockWebsites: Website[] = [
  {
    id: "mock-website-1",
    appKey: "app_key_demo_123456",
    name: "Digital Individual Investor",
    type: "website",
    description: "Investment portfolio management platform",
    contact: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "(555) 555-0123",
      department: "Digital Products",
    },
    domains: {
      primary: "https://app.example.com",
      scannableDomains: [
        { domain: "https://dev.example.com", isActive: true },
        { domain: "https://staging.example.com", isActive: false },
        { domain: "https://qa.example.com", isActive: false },
      ],
    },
    crawlStatus: {
      lastCrawl: "2025-10-15T21:52:00Z",
      pagesIndexed: 127,
      status: "completed",
    },
    searchConfiguration: {
      defaultModalityWeights: {
        text: 0.5,
        visual: 0.3,
        metadata: 0.2,
      },
      description: "Default weights optimized for financial applications",
      updatedAt: "2024-01-15T14:30:00Z",
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
  },
];

// Mock navigation links from PRD Section 4.3.3
export const mockNavigationLinks: NavigationLink[] = [
  {
    id: "link-1",
    websiteId: "mock-website-1",
    intent: "view_portfolio",
    displayName: "Portfolio Dashboard",
    targetUrl: "/dashboard",
    isBookmarkable: true,
    keywords: ["portfolio", "dashboard", "overview"],
    description: "Main portfolio overview page",
    embeddingStatus: "completed",
    screenshot: "/screenshots/portfolio-dashboard.jpg",
    screenshotMetadata: {
      captureType: "full-page",
      dimensions: {
        width: 1200,
        height: 3600, // Full scrollable page height
        viewportHeight: 800,
      },
      capturedAt: "2024-01-15T10:05:00Z",
      fileSize: 245000, // ~245KB
    },
    aiSummary: {
      whatUsersSee: [
        "Hero section with heading 'Your new online account experience is almost here'",
        "Prominent 'FIND OUT MORE' call-to-action button",
        "'Who We Are' section with tagline 'Your goals are what matter'",
        "Informational text about Capital Group's 94-year history and $3 trillion in assets",
        "LOGIN button in right sidebar",
        "Announcements section featuring 2025 proxy vote details",
        "Service & support links with phone icon",
        "Warm image showing two people collaborating on a laptop in a contemporary kitchen",
        "'ABOUT US' navigation button",
      ],
      whatUsersCanDo: [
        "Log into their account via the LOGIN button",
        "Learn more about upcoming online account changes",
        "Read company announcements including 2025 proxy voting information",
        "Access service and support resources",
        "Contact support via phone",
        "Explore information about Capital Group and American Funds",
        "Navigate to the About Us section for company details",
      ],
      generatedAt: "2024-01-15T10:05:00Z",
    },
    embeddingMetadata: {
      textEmbeddingGenerated: true,
      visualEmbeddingGenerated: true,
      metadataEmbeddingGenerated: true,
      lastEmbeddingUpdate: "2024-01-15T10:05:00Z",
    },
    multiModalEmbedding: {
      embeddings: [
        {
          modality: "text",
          vector: new Array(1536).fill(0).map(() => Math.random()),
          source: "ai_summary",
          confidence: 0.94,
        },
        {
          modality: "visual",
          vector: new Array(512).fill(0).map(() => Math.random()),
          source: "screenshot",
          confidence: 0.91,
        },
        {
          modality: "metadata",
          vector: new Array(768).fill(0).map(() => Math.random()),
          source: "structured_data",
          confidence: 0.96,
        },
      ],
    },
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "link-2",
    websiteId: "mock-website-1",
    intent: "check_balance",
    displayName: "Account Balance",
    targetUrl: "/account/balance",
    isBookmarkable: true,
    keywords: ["balance", "account", "funds"],
    embeddingStatus: "completed",
    aiSummary: {
      whatUsersSee: [
        "Account balance summary displaying current available balance",
        "Pending transactions list",
        "Account history graph showing balance over time",
        "Quick action buttons for common operations",
      ],
      whatUsersCanDo: [
        "Check current account balance",
        "View detailed transaction history",
        "Download account statements",
        "Transfer funds to other accounts",
        "Set up balance alerts",
      ],
      generatedAt: "2024-01-15T10:05:00Z",
    },
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "link-3",
    websiteId: "mock-website-1",
    intent: "view_portfolio_details",
    displayName: "Portfolio Details",
    targetUrl: "/portfolios/{account}",
    isBookmarkable: true,
    keywords: ["portfolio", "account", "holdings", "details"],
    description: "Detailed view of a specific portfolio account",
    parameters: [
      {
        name: "account",
        description: "The account identifier or portfolio number",
        required: true,
      },
    ],
    embeddingStatus: "completed",
    aiSummary: {
      whatUsersSee: [
        "Account-specific holdings table with current values",
        "Performance metrics and returns over different time periods",
        "Interactive allocation charts (pie/donut charts)",
        "Transaction history for the specific portfolio",
        "Gain/loss indicators with color coding",
      ],
      whatUsersCanDo: [
        "View detailed portfolio performance metrics",
        "Analyze individual holdings and positions",
        "Review account transaction history",
        "Download portfolio reports in PDF format",
        "Compare performance against benchmarks",
        "Drill down into specific investment details",
      ],
      generatedAt: "2024-01-15T10:05:00Z",
    },
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "link-4",
    websiteId: "mock-website-1",
    intent: "transfer_funds",
    displayName: "Transfer Funds",
    targetUrl: "/transfer",
    isBookmarkable: false,
    keywords: ["transfer", "send", "funds", "money"],
    description: "Transfer money between accounts",
    hasForm: true,
    formFields: [
      {
        label: "From Account",
        slot: "fromAccount",
        type: "select",
        required: true,
      },
      {
        label: "To Account",
        slot: "toAccount",
        type: "select",
        required: true,
      },
      {
        label: "Amount",
        slot: "amount",
        type: "number",
        required: true,
        placeholder: "Enter amount to transfer",
      },
      {
        label: "Description",
        slot: "description",
        type: "textarea",
        required: false,
        placeholder: "Optional transfer description",
      },
    ],
    embeddingStatus: "completed",
    aiSummary: {
      whatUsersSee: [
        "Account selection dropdown for source account (From Account)",
        "Account selection dropdown for destination account (To Account)",
        "Amount input field with currency formatting",
        "Optional description textarea for transfer notes",
        "Submit button to initiate transfer",
        "Transfer confirmation summary",
      ],
      whatUsersCanDo: [
        "Select source account from available accounts",
        "Select destination account for the transfer",
        "Enter transfer amount (with validation)",
        "Add optional description or memo for the transfer",
        "Review transfer details before confirming",
        "Submit transfer request",
        "Receive confirmation of transfer",
      ],
      generatedAt: "2024-01-15T10:05:00Z",
    },
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
];

// Mock system metrics
export const mockSystemMetrics: SystemMetrics = {
  serviceHealth: 99.9,
  totalApplications: 24,
  activeUsers: 2304,
  intentMatchRate: 87.3,
};

// Mock embedding test results
export const mockEmbeddingTestResult: EmbeddingTestResult = {
  query: "Show me my account summary",
  totalMatches: 5,
  results: [
    {
      pageId: "1",
      title: "Account Balance",
      url: "/account/balance",
      description: "View your current account balance and recent transactions",
      matchScore: 0.99,
      matchedIntents: ["check_balance"],
      slots: { matched: 1, total: 1, required: [] },
      isBestMatch: true,
    },
    {
      pageId: "2",
      title: "Transaction History",
      url: "/transactions/{accountId}?startDate={startDate}&endDate={endDate}",
      description: "View transaction history with optional filters",
      matchScore: 0.77,
      matchedIntents: ["view_transactions"],
      slots: {
        matched: 3,
        total: 3,
        required: [
          { name: "path", type: "accountId" },
          { name: "query", type: "Account identifier" },
        ],
      },
      isBestMatch: false,
    },
    {
      pageId: "3",
      title: "Portfolio Details",
      url: "/portfolios/{accountId}",
      description: "Detailed view of a specific portfolio account",
      matchScore: 0.77,
      matchedIntents: ["view_portfolio_details"],
      slots: {
        matched: 1,
        total: 1,
        required: [
          { name: "path", type: "accountId" },
          { name: "query", type: "Portfolio account identifier" },
        ],
      },
      isBestMatch: false,
    },
    {
      pageId: "4",
      title: "Portfolio Dashboard",
      url: "/dashboard",
      description: "Main portfolio overview page",
      matchScore: 0.74,
      matchedIntents: ["view_portfolio"],
      slots: { matched: 0, total: 0, required: [] },
      isBestMatch: false,
    },
    {
      pageId: "5",
      title: "Transfer Funds",
      url: "/transfer?from={fromAccount}&to={toAccount}",
      description: "Transfer money between accounts",
      matchScore: 0.66,
      matchedIntents: ["transfer_funds"],
      slots: {
        matched: 2,
        total: 2,
        required: [
          { name: "query", type: "fromAccount - Source account ID" },
          { name: "query", type: "toAccount - Destination account ID" },
        ],
      },
      isBestMatch: false,
    },
  ],
};

// Mock crawl schedule
export const mockCrawlSchedule: CrawlSchedule = {
  frequency: "manual",
  scheduledTime: "09:00",
  dayOfWeek: 1, // Monday
  timezone: "America/New_York",
  isActive: false,
};

// Mock crawl configuration
export const mockCrawlConfiguration: CrawlConfiguration = {
  crawlDepth: 3,
  maxPages: 100,
  lastUpdated: "2024-01-15T14:30:00Z",
};

// Mock crawl history
export const mockCrawlHistory: CrawlHistoryEntry[] = [
  {
    id: "1",
    startTime: new Date("2025-01-15T14:30:00"),
    endTime: new Date("2025-01-15T14:35:42"),
    status: "completed",
    pagesIndexed: 142,
    changes: 12,
    duration: 342,
  },
  {
    id: "2",
    startTime: new Date("2025-01-14T09:00:00"),
    endTime: new Date("2025-01-14T09:04:18"),
    status: "completed",
    pagesIndexed: 138,
    changes: 5,
    duration: 258,
  },
  {
    id: "3",
    startTime: new Date("2025-01-13T09:00:00"),
    endTime: new Date("2025-01-13T09:03:45"),
    status: "failed",
    pagesIndexed: 87,
    changes: 0,
    duration: 225,
    errorMessage: "Connection timeout while crawling domain",
  },
  {
    id: "4",
    startTime: new Date("2025-01-12T09:00:00"),
    endTime: new Date("2025-01-12T09:05:15"),
    status: "completed",
    pagesIndexed: 135,
    changes: 8,
    duration: 315,
  },
  {
    id: "5",
    startTime: new Date("2025-01-11T09:00:00"),
    status: "cancelled",
    pagesIndexed: 45,
    changes: 0,
    duration: 90,
  },
];
