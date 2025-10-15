import type { Website, NavigationLink, SystemMetrics } from '~/types';

// Mock websites from PRD Section 4.3.3
export const mockWebsites: Website[] = [
  {
    id: 'mock-website-1',
    appKey: 'app_key_demo_123456',
    name: 'Digital Individual Investor',
    type: 'website',
    description: 'Investment portfolio management platform',
    contact: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 555-0123',
      department: 'Digital Products',
    },
    domains: {
      primary: 'https://app.example.com',
      scannableDomains: [
        { domain: 'https://dev.example.com', isActive: true },
        { domain: 'https://staging.example.com', isActive: false },
        { domain: 'https://qa.example.com', isActive: false },
      ],
    },
    crawlStatus: {
      lastCrawl: '2024-01-15T14:30:00Z',
      pagesIndexed: 127,
      status: 'completed',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
  },
];

// Mock navigation links from PRD Section 4.3.3
export const mockNavigationLinks: NavigationLink[] = [
  {
    id: 'link-1',
    websiteId: 'mock-website-1',
    intent: 'view_portfolio',
    displayName: 'Portfolio Dashboard',
    targetUrl: '/dashboard',
    pathType: 'relative',
    keywords: ['portfolio', 'dashboard', 'overview'],
    description: 'Main portfolio overview page',
    embeddingStatus: 'completed',
    aiSummary: {
      whatUsersSee: 'A comprehensive dashboard showing portfolio value chart, asset allocation pie chart, recent transactions table, and market summary cards.',
      whatUsersCanDo: 'View total portfolio value, see asset distribution, check recent transactions, and access detailed investment analysis.',
      generatedAt: '2024-01-15T10:05:00Z',
    },
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'link-2',
    websiteId: 'mock-website-1',
    intent: 'check_balance',
    displayName: 'Account Balance',
    targetUrl: '/account/balance',
    pathType: 'relative',
    keywords: ['balance', 'account', 'funds'],
    embeddingStatus: 'completed',
    aiSummary: {
      whatUsersSee: 'Account balance summary with available balance, pending transactions, and account history graph.',
      whatUsersCanDo: 'Check current balance, view transaction history, download statements, and transfer funds.',
      generatedAt: '2024-01-15T10:05:00Z',
    },
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'link-3',
    websiteId: 'mock-website-1',
    intent: 'view_portfolio_details',
    displayName: 'Portfolio Details',
    targetUrl: '/portfolios/{account}',
    pathType: 'relative',
    keywords: ['portfolio', 'account', 'holdings', 'details'],
    description: 'Detailed view of a specific portfolio account',
    parameters: [
      {
        name: 'account',
        description: 'The account identifier or portfolio number',
        required: true,
      },
    ],
    embeddingStatus: 'completed',
    aiSummary: {
      whatUsersSee: 'Detailed portfolio page showing account-specific holdings, performance metrics, allocation charts, and transaction history.',
      whatUsersCanDo: 'View detailed portfolio performance, analyze individual holdings, review account transactions, and download portfolio reports.',
      generatedAt: '2024-01-15T10:05:00Z',
    },
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'link-4',
    websiteId: 'mock-website-1',
    intent: 'transfer_funds',
    displayName: 'Transfer Funds',
    targetUrl: '/transfer',
    pathType: 'relative',
    keywords: ['transfer', 'send', 'funds', 'money'],
    description: 'Transfer money between accounts',
    hasForm: true,
    formFields: [
      {
        label: 'From Account',
        slot: 'fromAccount',
        type: 'select',
        required: true,
      },
      {
        label: 'To Account',
        slot: 'toAccount',
        type: 'select',
        required: true,
      },
      {
        label: 'Amount',
        slot: 'amount',
        type: 'number',
        required: true,
        placeholder: 'Enter amount to transfer',
      },
      {
        label: 'Description',
        slot: 'description',
        type: 'textarea',
        required: false,
        placeholder: 'Optional transfer description',
      },
    ],
    embeddingStatus: 'completed',
    aiSummary: {
      whatUsersSee: 'A transfer form with account selection dropdowns, amount input field, and optional description textarea.',
      whatUsersCanDo: 'Transfer funds between their accounts by selecting source and destination accounts, entering the transfer amount, and optionally providing a description.',
      generatedAt: '2024-01-15T10:05:00Z',
    },
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

// Mock system metrics
export const mockSystemMetrics: SystemMetrics = {
  serviceHealth: 99.9,
  totalApplications: 24,
  activeUsers: 2304,
  intentMatchRate: 87.3,
};
