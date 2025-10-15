# Product Requirements Document
## Admin Portal Frontend - MVP

### Version 1.0
**Date:** October 2025  
**Author:** Product Team  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Overview
The Admin Portal Frontend is a web-based administration interface that enables users to register websites, manage navigation links, and obtain widget integration code for the Conversational Navigation System. This MVP focuses on delivering core functionality for website onboarding and configuration management.

### 1.2 Objective
Provide a streamlined, self-service portal for users to:
- Register their websites/applications
- Configure navigation links and intent mappings
- Generate and retrieve widget integration code
- Monitor basic usage metrics

### 1.3 Success Metrics
- Time to complete website registration: < 3 minutes
- Time to obtain widget code: < 30 seconds
- Zero-friction integration process
- 100% self-service capability for MVP features

---

## 2. User Personas

### 2.1 Primary Persona: Website Administrator
- **Role:** Technical or semi-technical user responsible for website management
- **Goals:**
    - Quickly integrate conversational navigation into their website
    - Configure navigation paths without coding
    - Monitor widget performance
- **Pain Points:**
    - Complex integration processes
    - Lack of visibility into navigation patterns
    - Manual link management

### 2.2 Secondary Persona: Developer
- **Role:** Frontend/Backend developer implementing the widget
- **Goals:**
    - Obtain clean, well-documented integration code
    - Test widget functionality before production
    - Configure multiple environments
- **Pain Points:**
    - Poor documentation
    - Inflexible integration options
    - Environment management complexity

---

## 3. Functional Requirements

### 3.1 Website Registration Flow

#### 3.1.1 Landing Page
**Purpose:** Entry point showcasing value proposition and system metrics

**Components:**
- Hero section with product messaging
- Live system metrics display:
    - Service Health percentage
    - Total Applications count
    - Active Users count
    - Intent Match Rate percentage
- Two primary CTAs:
    - "Register New Website" (primary action)
    - "View Documentation" (secondary action)
- "Websites" section header (for future website list)

**User Actions:**
- Click "Register New Website" → Navigate to registration form
- Click "View Documentation" → Open documentation (external link)

#### 3.1.2 Registration Form
**Purpose:** Collect website information for widget configuration

**Form Sections:**

**A. Website Information**
- **Website Name** (required)
    - Text input
    - Max 100 characters
    - Validation: Required, alphanumeric + spaces

- **Website Type** (required)
    - Radio button group:
        - Website (Public)
        - Internal App (Internal)
        - Mobile App (Public)
    - Default: Website

- **Description** (optional)
    - Textarea
    - Max 500 characters
    - Placeholder: "Brief description of your website/application"

**B. Contact Information**
- **Primary Contact Name** (required)
    - Text input
    - Max 100 characters

- **Contact Email** (required)
    - Email input
    - Validation: Valid email format

- **Department/Team** (optional)
    - Text input
    - Max 50 characters

- **Contact Phone** (optional)
    - Phone input
    - Format: International format accepted

**C. Domain & Environment Configuration**
- **Primary Domain URL** (required)
    - URL input
    - Validation: Valid URL format with protocol
    - Example: https://example.com
    - This is the production domain where the widget will be deployed

- **Domains to Scan** (required - at least one)
    - URL input
    - Minimum one entry required
    - Support multiple entries via "+ Add another URL" button
    - **Purpose:** These domains will be crawled and scanned to extract page content, analyze intent, and build the navigation knowledge base
    - Use cases: Development, staging, QA, or any environment with complete content
    - The system will crawl these URLs to:
        - Extract page structure and content
        - Analyze navigation patterns
        - Generate intent mappings
        - Build vector embeddings for AI navigation
    - Validation: Valid URL format with protocol

**Form Actions:**
- **Cancel**: Return to landing page without saving
- **Register**: Validate and submit form

**Validation Rules:**
- All required fields must be completed
- Email must be valid format
- URLs must include protocol (http:// or https://)
- Primary domain URL required (production deployment target)
- At least one domain to scan required (content source for AI training)

**Success Flow:**
- On successful submission → Redirect to Website Overview page
- Generate unique app-key for the website
- Create initial configuration

### 3.2 Website Management Interface

#### 3.2.1 Website Overview Tab
**Purpose:** Display registered website information and key metrics

**Components:**
- Website name as page header
- Tab navigation: Overview | Link Management | Widget Code
- Information cards displaying:
    - Website Information (name, type, description)
    - Contact Information (all contact details)
    - Domain Configuration:
        - **Primary Domain:** Where the widget will be deployed (production)
        - **Scanned Domains:** Domains that are crawled for content analysis and intent extraction
    - App Key (unique identifier, masked with show/hide toggle)
    - Registration Date
    - Last Modified Date
    - **Crawl Status** (if applicable):
        - Last crawl date/time
        - Number of pages indexed
        - Status indicator (pending/in-progress/completed)

**User Actions:**
- Edit website information (opens edit modal)
- Navigate between tabs
- Copy app-key to clipboard
- Trigger re-crawl of scanned domains (future enhancement)

#### 3.2.2 Link Management Tab
**Purpose:** Configure navigation intents and URL mappings

**Components:**

**A. Link Table**
Columns:
- Intent/Action (text)
- Display Name (text)
- Target URL (text)
- Path Type (dropdown)
- Status (toggle)
- Actions (edit/delete icons)

**B. Add Link Form** (Modal or inline)
Fields:
- **Intent/Action** (required)
    - Text input
    - Examples: "view_portfolio", "check_balance", "contact_support"
    - Validation: lowercase, underscore separated

- **Display Name** (required)
    - Text input
    - User-friendly label
    - Example: "View Portfolio Dashboard"

- **Target URL** (required)
    - URL path or full URL
    - Examples: "/dashboard", "https://app.example.com/portfolio"

- **Path Type** (required)
    - Dropdown options:
        - Relative Path (within same domain)
        - Absolute URL (external or specific domain)
        - Dynamic Route (contains parameters)

- **Keywords** (optional)
    - Tag input
    - Comma-separated keywords for better intent matching
    - Example: "portfolio, investments, holdings"

- **Description** (optional)
    - Textarea for additional context

**C. Bulk Actions**
- Import links from CSV
- Export current configuration
- Enable/Disable multiple links

**Table Features:**
- Pagination (10/25/50 items per page)
- Search/filter by intent or display name
- Sort by any column
- Inline edit for quick updates

#### 3.2.3 Widget Code Tab
**Purpose:** Provide integration code and implementation guidance

**Components:**

**A. Integration Method Selection**
- Radio button options:
    - Script Tag (default)
    - NPM Package
    - React Component

**B. Code Display Section**
- Syntax-highlighted code block
- Copy button
- Environment selector (if multiple domains configured)

**C. Script Tag Code Example:**
```html
<!-- Conversational Navigation Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['ConvNavWidget']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','convnav','https://widget.convnav.com/sdk.js'));
  
  convnav('init', {
    appKey: 'YOUR_APP_KEY_HERE',
    position: 'bottom-right',
    theme: 'light'
  });
</script>
```

**D. Configuration Options Panel**
- Visual configurator for:
    - Position (bottom-right, bottom-left, etc.)
    - Theme (light, dark, auto)
    - Initial state (minimized, expanded)
    - Custom colors (primary, secondary)
- Live preview of changes
- Generate updated code based on selections

**E. Testing Section**
- "Test Widget" button (opens preview)
- Troubleshooting checklist
- Common integration issues

### 3.3 Navigation and Layout

#### 3.3.1 Global Navigation
- Logo/Brand ("Access 360 Console")
- Help/Documentation link (top right)

#### 3.3.2 Responsive Behavior
- Desktop: Full layout with sidebar navigation (if multiple websites)
- Tablet: Collapsible sidebar
- Mobile: Bottom tab navigation for Overview/Links/Code

---

## 4. Technical Requirements

### 4.1 Frontend Stack
- **Framework:** React 19
- **Routing:** React Router v6
- **State Management:** Zustand
- **UI Components:** MUI (Material-UI) v7.3.4
- **Styling:** Tailwind CSS v3 with custom design tokens
- **Data Fetching:** TanStack Query v5
- **Build Tool:** Webpack 5 with Module Federation
- **Development Port:** 3000

### 4.2 API Integration
All API calls to Management Service (port 8090):

**Endpoints Required:**
- `POST /api/websites` - Register new website
- `GET /api/websites/{id}` - Get website details
- `PUT /api/websites/{id}` - Update website info
- `GET /api/websites/{id}/links` - Get navigation links
- `POST /api/websites/{id}/links` - Add navigation link
- `PUT /api/websites/{id}/links/{linkId}` - Update link
- `DELETE /api/websites/{id}/links/{linkId}` - Delete link
- `GET /api/websites/{id}/widget-config` - Get widget configuration

### 4.3 Mock Data Layer

#### 4.3.1 Mock Configuration
```typescript
// config/mock.config.ts
export const mockConfig = {
  enabled: process.env.REACT_APP_USE_MOCKS === 'true' || false,
  delay: 500, // Simulated network delay in ms
  failureRate: 0, // 0-1, probability of request failure for testing
};
```

#### 4.3.2 TanStack Query Mock Implementation
```typescript
// mocks/queryClient.mock.ts
import { QueryClient } from '@tanstack/react-query';
import { mockConfig } from '../config/mock.config';

export const createMockQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: mockConfig.enabled ? 0 : 3,
        staleTime: mockConfig.enabled ? 1000 * 60 * 5 : 1000 * 60,
        queryFn: mockConfig.enabled 
          ? undefined 
          : undefined, // Will be overridden by hooks
      },
    },
  });
};
```

#### 4.3.3 Mock Data Stores
```typescript
// mocks/data/websites.mock.ts
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
      phone: '+1-555-0123',
      department: 'Digital Products',
    },
    domains: {
      primary: 'https://app.example.com',
      scannableDomains: [
        'https://dev.example.com',
        'https://staging.example.com',
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

// mocks/data/navigationLinks.mock.ts
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
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  // Add more mock links...
];
```

#### 4.3.4 Mock API Service
```typescript
// mocks/api/mockApi.ts
import { mockWebsites, mockNavigationLinks } from '../data';
import { mockConfig } from '../../config/mock.config';

class MockApiService {
  private delay = () => 
    new Promise(resolve => setTimeout(resolve, mockConfig.delay));
  
  private shouldFail = () => 
    Math.random() < mockConfig.failureRate;

  // Website endpoints
  async createWebsite(data: Partial<Website>): Promise<Website> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to create website');
    }
    
    const newWebsite: Website = {
      id: `mock-website-${Date.now()}`,
      appKey: `app_key_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Website;
    
    mockWebsites.push(newWebsite);
    return newWebsite;
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

  async updateWebsite(id: string, data: Partial<Website>): Promise<Website> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to update website');
    }
    
    const index = mockWebsites.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Website not found');
    
    mockWebsites[index] = {
      ...mockWebsites[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockWebsites[index];
  }

  // Navigation Links endpoints
  async getNavigationLinks(websiteId: string): Promise<NavigationLink[]> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to fetch navigation links');
    }
    
    return mockNavigationLinks.filter(link => link.websiteId === websiteId);
  }

  async createNavigationLink(
    websiteId: string, 
    data: Partial<NavigationLink>
  ): Promise<NavigationLink> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to create navigation link');
    }
    
    const newLink: NavigationLink = {
      id: `link-${Date.now()}`,
      websiteId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as NavigationLink;
    
    mockNavigationLinks.push(newLink);
    return newLink;
  }

  async updateNavigationLink(
    linkId: string, 
    data: Partial<NavigationLink>
  ): Promise<NavigationLink> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to update navigation link');
    }
    
    const index = mockNavigationLinks.findIndex(l => l.id === linkId);
    if (index === -1) throw new Error('Link not found');
    
    mockNavigationLinks[index] = {
      ...mockNavigationLinks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockNavigationLinks[index];
  }

  async deleteNavigationLink(linkId: string): Promise<void> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to delete navigation link');
    }
    
    const index = mockNavigationLinks.findIndex(l => l.id === linkId);
    if (index === -1) throw new Error('Link not found');
    
    mockNavigationLinks.splice(index, 1);
  }

  // Widget Config endpoint
  async getWidgetConfig(websiteId: string): Promise<WidgetConfig> {
    await this.delay();
    if (this.shouldFail()) {
      throw new Error('Mock: Failed to fetch widget config');
    }
    
    const website = mockWebsites.find(w => w.id === websiteId);
    if (!website) throw new Error('Website not found');
    
    return {
      appKey: website.appKey,
      scriptUrl: 'https://widget.convnav.com/sdk.js',
      allowedDomains: [website.domains.primary], // Only production domain for widget
      theme: 'light',
      position: 'bottom-right',
    };
  }
}

export const mockApi = new MockApiService();
```

#### 4.3.5 Query Hooks with Mock Support
```typescript
// hooks/queries/useWebsite.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockConfig } from '../../config/mock.config';
import { mockApi } from '../../mocks/api/mockApi';
import { apiClient } from '../../services/apiClient';

export const useWebsite = (id: string) => {
  return useQuery({
    queryKey: ['website', id],
    queryFn: () => mockConfig.enabled 
      ? mockApi.getWebsite(id)
      : apiClient.get(`/api/websites/${id}`),
    enabled: !!id,
  });
};

export const useCreateWebsite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Website>) => mockConfig.enabled
      ? mockApi.createWebsite(data)
      : apiClient.post('/api/websites', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.setQueryData(['website', data.id], data);
    },
  });
};

// hooks/queries/useNavigationLinks.ts
export const useNavigationLinks = (websiteId: string) => {
  return useQuery({
    queryKey: ['navigationLinks', websiteId],
    queryFn: () => mockConfig.enabled
      ? mockApi.getNavigationLinks(websiteId)
      : apiClient.get(`/api/websites/${websiteId}/links`),
    enabled: !!websiteId,
  });
};

export const useCreateNavigationLink = (websiteId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<NavigationLink>) => mockConfig.enabled
      ? mockApi.createNavigationLink(websiteId, data)
      : apiClient.post(`/api/websites/${websiteId}/links`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['navigationLinks', websiteId] 
      });
    },
  });
};

export const useUpdateNavigationLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ linkId, data }: { 
      linkId: string; 
      data: Partial<NavigationLink> 
    }) => mockConfig.enabled
      ? mockApi.updateNavigationLink(linkId, data)
      : apiClient.put(`/api/websites/${data.websiteId}/links/${linkId}`, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['navigationLinks', data.websiteId] 
      });
    },
  });
};

export const useDeleteNavigationLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ websiteId, linkId }: { 
      websiteId: string; 
      linkId: string 
    }) => mockConfig.enabled
      ? mockApi.deleteNavigationLink(linkId)
      : apiClient.delete(`/api/websites/${websiteId}/links/${linkId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['navigationLinks', variables.websiteId] 
      });
    },
  });
};
```

#### 4.3.6 Environment Configuration
```bash
# .env.development
REACT_APP_USE_MOCKS=true
REACT_APP_API_URL=http://localhost:8090

# .env.production
REACT_APP_USE_MOCKS=false
REACT_APP_API_URL=https://api.convnav.com
```

#### 4.3.7 Mock Toggle Component (Dev Only)
```typescript
// components/dev/MockToggle.tsx
import { useState, useEffect } from 'react';
import { mockConfig } from '../../config/mock.config';

export const MockToggle = () => {
  if (process.env.NODE_ENV === 'production') return null;
  
  const [isMockEnabled, setIsMockEnabled] = useState(mockConfig.enabled);
  
  const toggleMocks = () => {
    const newValue = !isMockEnabled;
    localStorage.setItem('USE_MOCKS', String(newValue));
    window.location.reload(); // Reload to apply changes
  };
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-2 rounded">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isMockEnabled}
          onChange={toggleMocks}
        />
        <span>Use Mock Data</span>
      </label>
    </div>
  );
};
```

### 4.4 Data Models

#### Website Model
```typescript
interface Website {
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
    primary: string;           // Production domain for widget deployment
    scannableDomains: string[]; // Domains to crawl for content/intent analysis
  };
  crawlStatus?: {
    lastCrawl: string;         // ISO date of last crawl
    pagesIndexed: number;      // Number of pages processed
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
  };
  createdAt: string;
  updatedAt: string;
}
```

#### Navigation Link Model
```typescript
interface NavigationLink {
  id: string;
  websiteId: string;
  intent: string;
  displayName: string;
  targetUrl: string;
  pathType: 'relative' | 'absolute' | 'dynamic';
  keywords?: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Widget Config Model
```typescript
interface WidgetConfig {
  appKey: string;
  scriptUrl: string;
  allowedDomains: string[];
  theme: 'light' | 'dark' | 'auto';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
```

### 4.5 Security Requirements
- App keys must be encrypted at rest
- HTTPS required for all API communications
- CORS configuration for widget domains
- Rate limiting on API endpoints
- Input sanitization for all user inputs

---

## 5. User Experience Requirements

### 5.1 Design Principles
- **Clarity:** Clear labeling and intuitive navigation
- **Efficiency:** Minimal steps to complete tasks
- **Feedback:** Clear success/error messages
- **Consistency:** Uniform design patterns throughout

### 5.2 Design System & Tokens

#### 5.2.1 Color Palette (Tailwind Extended)
```css
/* Primary Brand Colors */
--color-primary-50: #eff6ff;   /* Lightest blue */
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;  /* Main brand blue */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;

/* Neutral Colors */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;

/* Semantic Colors */
--color-success: #10b981;  /* Green */
--color-warning: #f59e0b;  /* Amber */
--color-error: #ef4444;    /* Red */
--color-info: #3b82f6;     /* Blue */
```

#### 5.2.2 Spacing Scale (Consistent Padding/Margin)
```css
/* Base unit: 4px = 0.25rem */
--spacing-0: 0;           /* 0px */
--spacing-1: 0.25rem;     /* 4px */
--spacing-2: 0.5rem;      /* 8px */
--spacing-3: 0.75rem;     /* 12px */
--spacing-4: 1rem;        /* 16px - base unit */
--spacing-5: 1.25rem;     /* 20px */
--spacing-6: 1.5rem;      /* 24px */
--spacing-8: 2rem;        /* 32px */
--spacing-10: 2.5rem;     /* 40px */
--spacing-12: 3rem;       /* 48px */
--spacing-16: 4rem;       /* 64px */
--spacing-20: 5rem;       /* 80px */
--spacing-24: 6rem;       /* 96px */
```

#### 5.2.3 Component Spacing Guidelines
```css
/* Page Layout */
--page-padding: var(--spacing-6);          /* 24px */
--page-padding-mobile: var(--spacing-4);   /* 16px */
--section-gap: var(--spacing-12);          /* 48px */
--section-gap-mobile: var(--spacing-8);    /* 32px */

/* Cards & Containers */
--card-padding: var(--spacing-6);          /* 24px */
--card-padding-mobile: var(--spacing-4);   /* 16px */
--card-gap: var(--spacing-4);              /* 16px between cards */

/* Form Elements */
--form-group-gap: var(--spacing-6);        /* 24px between form groups */
--input-padding-y: var(--spacing-3);       /* 12px vertical */
--input-padding-x: var(--spacing-4);       /* 16px horizontal */
--label-margin-bottom: var(--spacing-2);   /* 8px */

/* Buttons */
--button-padding-y: var(--spacing-3);      /* 12px vertical */
--button-padding-x: var(--spacing-6);      /* 24px horizontal */
--button-group-gap: var(--spacing-3);      /* 12px between buttons */

/* Table */
--table-cell-padding-y: var(--spacing-3);  /* 12px vertical */
--table-cell-padding-x: var(--spacing-4);  /* 16px horizontal */
--table-row-gap: var(--spacing-0);         /* 0px */

/* Navigation */
--nav-item-padding: var(--spacing-4);      /* 16px */
--nav-item-gap: var(--spacing-2);          /* 8px between items */
```

#### 5.2.4 Typography Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px - body text */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### 5.2.5 Border Radius Tokens
```css
--radius-none: 0;
--radius-sm: 0.125rem;    /* 2px */
--radius-default: 0.25rem; /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;    /* Pills/circles */
```

#### 5.2.6 Shadow Tokens
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

#### 5.2.7 Implementation Classes (Tailwind Utilities)
```css
/* Consistent Padding Classes */
.p-page { padding: var(--page-padding); }
.p-card { padding: var(--card-padding); }
.p-input { padding: var(--input-padding-y) var(--input-padding-x); }
.p-button { padding: var(--button-padding-y) var(--button-padding-x); }

/* Consistent Margin Classes */
.section-spacing { margin-bottom: var(--section-gap); }
.form-group { margin-bottom: var(--form-group-gap); }
.label-spacing { margin-bottom: var(--label-margin-bottom); }

/* Responsive Helpers */
@media (max-width: 768px) {
  .p-page { padding: var(--page-padding-mobile); }
  .p-card { padding: var(--card-padding-mobile); }
  .section-spacing { margin-bottom: var(--section-gap-mobile); }
}
```

### 5.3 Interaction Patterns
- Form validation on blur (not on type)
- Loading states for all async operations
- Confirmation dialogs for destructive actions
- Auto-save for link management (draft state)
- Toast notifications for success/error feedback

### 5.4 Error Handling
- Inline validation errors below form fields
- Network error recovery with retry options
- Graceful degradation if services unavailable
- Clear error messages with suggested actions

---

## 6. MVP Scope Boundaries

### 6.1 Included in MVP
✅ Single website registration and management  
✅ Basic link management (CRUD operations)  
✅ Widget code generation with script tag  
✅ Static configuration options  
✅ Basic form validations  
✅ Copy-to-clipboard functionality

### 6.2 Excluded from MVP (Future Enhancements)
❌ Multi-tenant/multi-website management  
❌ User authentication and authorization  
❌ Analytics dashboard  
❌ A/B testing capabilities  
❌ Custom widget styling beyond presets  
❌ Webhook configurations  
❌ API key management  
❌ Audit logs  
❌ Bulk import via API  
❌ Widget versioning

---

## 7. Acceptance Criteria

### 7.1 Registration Flow
- [ ] User can successfully register a website in under 3 minutes
- [ ] All required fields are validated before submission
- [ ] Unique app-key is generated upon registration
- [ ] Success message confirms registration completion
- [ ] User is redirected to Overview page after registration

### 7.2 Link Management
- [ ] User can add at least 10 navigation links
- [ ] Each link can be edited inline or via modal
- [ ] Delete action requires confirmation
- [ ] Links can be enabled/disabled without deletion
- [ ] Changes are persisted immediately

### 7.3 Widget Integration
- [ ] Widget code includes correct app-key
- [ ] Code can be copied with single click
- [ ] Configuration changes update code in real-time
- [ ] Test preview accurately represents widget behavior

---

## 8. Development Phases

### Phase 1: Foundation (Week 1)
- Project setup with React and Webpack
- Basic routing structure
- MUI theme configuration
- API service layer setup

### Phase 2: Registration (Week 2)
- Landing page implementation
- Registration form with validations
- API integration for website creation
- Success/error handling

### Phase 3: Management Interface (Week 3)
- Overview page with website details
- Link management table
- CRUD operations for links
- Search and filter functionality

### Phase 4: Widget Integration (Week 4)
- Code generation logic
- Configuration options UI
- Copy functionality
- Preview capability

### Phase 5: Polish & Testing (Week 5)
- Error handling improvements
- Loading states
- Responsive design adjustments
- End-to-end testing

---

## 9. Dependencies

### 9.1 External Dependencies
- Management Service API must be operational
- Widget SDK must be hosted and accessible
- PostgreSQL database for data persistence

### 9.2 Internal Dependencies
- Design system/component library specifications
- API contracts finalized
- Widget SDK documentation completed

---

## 10. Release Criteria

### 10.1 Functional Completeness
- All MVP features implemented and tested
- No critical bugs in core workflows
- API integration stable

### 10.2 Performance
- Page load time < 2 seconds
- API response time < 500ms for standard operations
- Smooth UI interactions without lag

### 10.3 Documentation
- User guide for website registration
- Developer guide for widget integration
- Troubleshooting documentation

---

## Appendix A: Mockup References
- Image 1: Landing page with service metrics
- Image 2: Registration form interface
- Image 3: Website overview with tabs
- Image 4: Link management interface (to be designed)
- Image 5: Widget code interface (to be designed)