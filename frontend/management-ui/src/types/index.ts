// TypeScript models from PRD Section 4.4

export interface Website {
  id: string;
  appKey: string;
  name: string;
  type: 'website' | 'internal_app' | 'mobile_app';
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
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
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
  pathType: 'relative' | 'absolute' | 'dynamic';
  parameters?: Array<{  // Auto-detected parameters from dynamic URLs (e.g., {account}, {id})
    name: string;  // Parameter name (e.g., "account")
    description?: string;  // Optional description of what this parameter represents
    required: boolean;  // Whether this parameter is required
  }>;
  hasForm?: boolean;  // Whether this page contains a form
  formFields?: Array<{  // Form fields that need to be filled
    label: string;  // Field label (e.g., "Email Address", "Account Number")
    slot: string;  // Slot/parameter name to collect from user (e.g., "email", "accountNumber")
    type?: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea';  // Field type
    required: boolean;  // Whether this field is required
    placeholder?: string;  // Optional placeholder text
  }>;
  keywords?: string[];
  description?: string;
  aiGuidance?: string;  // Optional guidance for AI to understand the page
  screenshot?: string;   // Screenshot URL or base64
  embeddingStatus?: 'pending' | 'processing' | 'completed' | 'failed';  // Status of embedding generation
  aiSummary?: {  // AI-generated summary from screenshot analysis
    whatUsersSee: string;  // Description of visual elements
    whatUsersCanDo: string;  // Description of available actions
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
  theme: 'light' | 'dark' | 'auto';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export interface SystemMetrics {
  serviceHealth: number;
  totalApplications: number;
  activeUsers: number;
  intentMatchRate: number;
}
