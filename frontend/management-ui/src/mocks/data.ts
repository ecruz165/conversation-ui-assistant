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
      lastCrawl: "2024-01-15T14:30:00Z",
      pagesIndexed: 127,
      status: "completed",
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
    aiSummary: {
      whatUsersSee:
        "A comprehensive dashboard showing portfolio value chart, asset allocation pie chart, recent transactions table, and market summary cards.",
      whatUsersCanDo:
        "View total portfolio value, see asset distribution, check recent transactions, and access detailed investment analysis.",
      generatedAt: "2024-01-15T10:05:00Z",
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
      whatUsersSee:
        "Account balance summary with available balance, pending transactions, and account history graph.",
      whatUsersCanDo:
        "Check current balance, view transaction history, download statements, and transfer funds.",
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
      whatUsersSee:
        "Detailed portfolio page showing account-specific holdings, performance metrics, allocation charts, and transaction history.",
      whatUsersCanDo:
        "View detailed portfolio performance, analyze individual holdings, review account transactions, and download portfolio reports.",
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
      whatUsersSee:
        "A transfer form with account selection dropdowns, amount input field, and optional description textarea.",
      whatUsersCanDo:
        "Transfer funds between their accounts by selecting source and destination accounts, entering the transfer amount, and optionally providing a description.",
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
