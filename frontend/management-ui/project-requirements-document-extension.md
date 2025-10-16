# Product Requirements Document - Extension

## Admin Portal Frontend - Feature Additions

### Version 1.1

**Date:** October 2025
**Author:** Product Team
**Status:** Draft
**Base Document:** PRD v1.0

---

## Document Purpose

This extension document adds two new feature sections to the Admin Portal Frontend MVP:

1. **Embedding Test & Validation** - Test navigation intent matching
2. **Crawl Management** - Configure and monitor website crawling

These features enhance the existing Website Management Interface by providing tools for testing AI navigation accuracy and managing content indexing.

---

## Section 3.2.4: Embedding Test Tab

**Purpose:** Enable administrators to test and validate how well user queries match against indexed navigation pages using vector embeddings.

### 3.2.4.1 User Value Proposition

- **Validation:** Test intent matching before deploying the widget to production
- **Quality Assurance:** Identify gaps in navigation coverage or intent understanding
- **Optimization:** Refine page descriptions and keywords based on test results
- **Confidence:** Verify that common user queries route to correct pages

### 3.2.4.2 Components

#### A. Page Header

- Tab navigation includes: Overview | Link Management | Widget Code | **Embedding Test** | Crawl Management
- Section title: "Embedding Test & Validation"
- Description: "Test and validate embeddings for your navigation pages to ensure optimal intent matching."

#### B. Test Query Input

**Components:**

- **Label:** "Test Query"
- **Input Field:**
  - Text input (single line)
  - Placeholder: "Enter a user query to test (e.g., 'show me my portfolio', 'check balance')"
  - Full width
  - Clear/reset button (×) when text is entered
- **Helper Text:** "Press Enter to search across all pages"

**Behavior:**

- Submit query on Enter key press
- Submit query on input blur (optional)
- Minimum 3 characters to trigger search
- Display loading state during search
- Clear previous results before new search

#### C. Empty State

Displayed before first query or when no query entered.

**Visual:**

- Large search icon (centered)
- Primary text: "Enter a query to test embeddings"
- Secondary text: "See which pages match your user's intent"
- Dashed border container
- Neutral gray color scheme

#### D. Results Display

**Header Section:**

- Results summary: "Results for: **[query text]**"
- Match count: "X pages matched" (right-aligned)

**Result Cards:**

Each matching page displays as a card with:

1. **Card Header:**
   - Page title (bold, larger font)
   - URL path (monospace font, gray text)
   - Match percentage badge (top-right corner)
     - 90-100%: Green background with "Best Match" label
     - 70-89%: Yellow/amber background
     - 50-69%: Orange background
     - Below 50%: Not displayed (filtered out)

2. **Card Body:**
   - **Intent/Action Tags:** Blue pill badges showing matched intents
   - **Slot Information:** Badge showing number of slots matched (e.g., "3 slots")
   - **Page Description:** Brief description from page metadata
   - **Required Slots Section** (if applicable):
     - Label: "Required Slots:"
     - List of slot names with types (e.g., "path: accountId", "query: fromAccount")
   - **Match Confidence Bar:**
     - Horizontal progress bar showing match percentage
     - Color-coded to match badge (green/yellow/orange)

3. **Card Actions:**
   - Checkmark icon indicating validated match (optional)
   - View/preview icon (optional, future enhancement)

**Card Ordering:**

- Results sorted by match percentage (highest first)
- Maximum 10 results displayed
- Pagination if more than 10 matches

**Visual Styling:**

- Cards have light background with subtle border
- Best match card has green tinted background
- Adequate spacing between cards (16px)
- Card padding: 24px
- Border radius: 8px

#### E. Recent Queries Section

**Purpose:** Quick access to previously tested queries

**Components:**

- Section header: "Recent Queries"
- List of recent query strings (clickable)
- Display last 5 queries
- Click to re-run query
- Stored in browser localStorage

**Layout:**

- Appears below results section
- Simple text list or pill badges
- Gray background container
- Padding: 16px

### 3.2.4.3 API Integration

**Endpoint Required:**

```
POST /api/websites/{id}/test-embedding
```

**Request Body:**

```json
{
  "query": "show me my account summary",
  "maxResults": 10,
  "minConfidence": 0.5
}
```

**Response:**

```json
{
  "query": "show me my account summary",
  "totalMatches": 5,
  "results": [
    {
      "pageId": "page-123",
      "title": "Account Balance",
      "url": "/account/balance",
      "description": "View your current account balance and recent transactions",
      "matchScore": 0.99,
      "matchedIntents": ["check_balance", "view_account"],
      "slots": {
        "matched": 1,
        "total": 1,
        "required": []
      },
      "isBestMatch": true
    },
    {
      "pageId": "page-456",
      "title": "Transaction History",
      "url": "/transactions/{accountId}?startDate={startDate}&endDate={endDate}",
      "description": "View transaction history with optional filters",
      "matchScore": 0.77,
      "matchedIntents": ["view_transactions"],
      "slots": {
        "matched": 0,
        "total": 3,
        "required": [
          { "name": "accountId", "type": "path" },
          { "name": "startDate", "type": "query" },
          { "name": "endDate", "type": "query" }
        ]
      },
      "isBestMatch": false
    }
  ]
}
```

### 3.2.4.4 Data Model

```typescript
interface EmbeddingTestQuery {
  query: string;
  maxResults?: number;
  minConfidence?: number;
}

interface EmbeddingTestResult {
  query: string;
  totalMatches: number;
  results: PageMatch[];
}

interface PageMatch {
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

interface SlotInfo {
  name: string;
  type: 'path' | 'query' | 'body';
}
```

### 3.2.4.5 User Interactions

**Primary Flow:**

1. User navigates to Embedding Test tab
2. User types query into input field
3. User presses Enter (or clicks search button)
4. System displays loading indicator
5. Results appear sorted by match confidence
6. User reviews match quality and intent mappings

**Secondary Flows:**

- Click recent query to re-test
- Clear input to start new test
- Copy URL from result card
- Review required slots for dynamic routes

### 3.2.4.6 Validation Rules

- Query must be at least 3 characters
- Query limited to 500 characters
- Special characters allowed (natural language)
- Whitespace trimmed from start/end

### 3.2.4.7 Error Handling

**Error States:**

- **No Results:** "No pages matched your query. Try different keywords or refine your navigation links."
- **API Error:** "Unable to test embeddings. Please try again later."
- **Network Error:** "Connection lost. Check your internet connection and retry."
- **Invalid Query:** "Query too short. Enter at least 3 characters."

**Visual Feedback:**

- Error messages displayed in red alert banner
- Retry button for failed requests
- Maintain query text on error for easy correction

### 3.2.4.8 Performance Considerations

- Test queries should return within 500ms
- Results streaming not required (all at once)
- Cache test results for repeated queries (5 minutes)
- Debounce input if auto-search implemented (300ms)

---

## Section 3.2.5: Crawl Management Tab

**Purpose:** Configure automated website crawling and monitor crawl history to maintain up-to-date navigation embeddings.

### 3.2.5.1 User Value Proposition

- **Automation:** Schedule regular crawls to keep content synchronized
- **Control:** Configure crawl parameters to match site structure
- **Visibility:** Monitor crawl history and detect content changes
- **Maintenance:** Trigger manual crawls when needed

### 3.2.5.2 Components

#### A. Page Header

- Tab navigation includes: Overview | Link Management | Widget Code | Embedding Test | **Crawl Management**
- Active tab indicator on "Crawl Management"

#### B. Crawl Schedule Section

**Section Header:**

- Icon: Calendar icon
- Title: "Crawl Schedule"
- Description: "Configure automatic crawling to keep your link index and embeddings up to date."

**Form Fields:**

1. **Frequency Selector**
   - Label: "Frequency"
   - Control: Dropdown select
   - Options:
     - "Daily" (default)
     - "Weekly"
     - "Bi-weekly"
     - "Monthly"
     - "Manual Only"
   - Width: 200px

2. **Run Time Selector**
   - Label: "Run Time (24hr)"
   - Control: Time picker
   - Format: "HH:MM AM/PM"
   - Default: "02:00 AM"
   - Width: 150px
   - Validation: Valid time format

**Status Indicator:**

- Success banner (green background) when schedule active
- Icon: Checkmark in circle
- Text: "Automatic crawling enabled"
- Subtext: "Crawl runs [frequency] at [time]"
- Example: "Crawl runs daily at 02:00"

**Action Button:**

- Button: "Save Schedule"
- Style: Primary button (blue)
- Position: Right-aligned below status indicator
- Action: Submit schedule configuration

**Conditional Display:**

- If frequency is "Manual Only": Hide run time picker
- Show info message: "Crawls must be triggered manually"

#### C. Crawl Configuration Section

**Section Header:**

- Icon: Settings/gear icon
- Title: "Crawl Configuration"
- Description: "Set parameters for web crawling and embedding generation."

**Form Fields:**

1. **Crawl Depth**
   - Label: "Crawl Depth"
   - Control: Number input
   - Default: 3
   - Min: 1
   - Max: 10
   - Helper text: "Maximum link depth from starting page"
   - Width: 120px

2. **Max Pages**
   - Label: "Max Pages"
   - Control: Number input
   - Default: 1000
   - Min: 10
   - Max: 10000
   - Helper text: "Maximum pages per crawl session"
   - Width: 120px

**Last Crawl Status:**

- Info banner (blue background)
- Icon: Info circle
- Format: "Last completed crawl: **[time ago]**"
- Details: "[pages] pages indexed, [changes] changes detected"
- Example: "Last completed crawl: 15 hours ago"
  "127 pages indexed, 3 changes detected"

**Action Button:**

- Button: "Save Configuration"
- Style: Primary button (blue)
- Position: Right-aligned below status banner
- Action: Submit configuration changes

**Layout:**

- Two-column grid for inputs on desktop
- Single column on mobile
- Adequate spacing between fields (24px)

#### D. Crawl History Section

**Section Header:**

- Icon: Clock/history icon
- Title: "Crawl History"
- Action Button: "Start Crawl" (top-right)
  - Style: Primary button with play icon
  - Action: Trigger immediate crawl
  - Disabled during active crawl

**Data Table:**

**Columns:**

1. **Date & Time**
   - Format: "YYYY-MM-DD HH:MM"
   - Sort: Descending (newest first)
   - Example: "2024-01-15 02:00"

2. **Status**
   - Badge component
   - Values:
     - "completed" (green badge with checkmark)
     - "in-progress" (blue badge with spinner)
     - "failed" (red badge with X)
     - "cancelled" (gray badge)
   - Icon included in badge

3. **Pages**
   - Number of pages crawled
   - Numeric value only
   - Example: "127"

4. **Duration**
   - Time taken for crawl
   - Format: "Xm Ys"
   - Example: "8m 34s"

5. **Changes**
   - Badge showing change count
   - Color-coded:
     - 0 changes: Gray badge "0 changes"
     - 1-5 changes: Yellow badge "[X] changes"
     - 6+ changes: Orange badge "[X] changes"

**Table Features:**

- Pagination: 10 rows per page
- Sortable columns (Date & Time, Pages, Duration)
- Responsive: Horizontal scroll on mobile
- Hover state on rows
- Click row to view detailed crawl report (future enhancement)

**Empty State:**

- Message: "No crawl history available"
- Subtext: "Click 'Start Crawl' to begin your first crawl"
- Centered in table area

### 3.2.5.3 API Integration

**Endpoints Required:**

```
GET /api/websites/{id}/crawl-schedule
PUT /api/websites/{id}/crawl-schedule
GET /api/websites/{id}/crawl-config
PUT /api/websites/{id}/crawl-config
GET /api/websites/{id}/crawl-history
POST /api/websites/{id}/crawl/start
GET /api/websites/{id}/crawl/{crawlId}/status
```

**Schedule Request:**

```json
{
  "frequency": "daily",
  "runTime": "02:00",
  "timezone": "America/New_York",
  "enabled": true
}
```

**Configuration Request:**

```json
{
  "crawlDepth": 3,
  "maxPages": 1000,
  "respectRobotsTxt": true,
  "followExternalLinks": false
}
```

**Crawl History Response:**

```json
{
  "crawls": [
    {
      "id": "crawl-123",
      "startTime": "2024-01-15T02:00:00Z",
      "endTime": "2024-01-15T02:08:34Z",
      "status": "completed",
      "pagesProcessed": 127,
      "changesDetected": 3,
      "duration": 514000
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 45
  }
}
```

### 3.2.5.4 Data Models

```typescript
interface CrawlSchedule {
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'manual';
  runTime: string; // HH:MM format
  timezone: string;
  enabled: boolean;
  nextRunTime?: string; // ISO date
}

interface CrawlConfiguration {
  crawlDepth: number; // 1-10
  maxPages: number; // 10-10000
  respectRobotsTxt: boolean;
  followExternalLinks: boolean;
  lastCrawl?: {
    completedAt: string; // ISO date
    pagesIndexed: number;
    changesDetected: number;
  };
}

interface CrawlHistoryEntry {
  id: string;
  startTime: string; // ISO date
  endTime?: string; // ISO date
  status: 'completed' | 'in-progress' | 'failed' | 'cancelled';
  pagesProcessed: number;
  changesDetected: number;
  duration: number; // milliseconds
  errorMessage?: string;
}

interface CrawlHistoryResponse {
  crawls: CrawlHistoryEntry[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

### 3.2.5.5 User Interactions

**Primary Flows:**

**A. Configure Schedule**

1. User navigates to Crawl Management tab
2. User selects frequency from dropdown
3. User sets run time using time picker
4. User clicks "Save Schedule"
5. System validates and saves schedule
6. Success banner displays confirmation

**B. Configure Crawl Parameters**

1. User adjusts crawl depth slider/input
2. User sets max pages limit
3. User clicks "Save Configuration"
4. System validates parameters
5. Confirmation message displays

**C. Start Manual Crawl**

1. User clicks "Start Crawl" button
2. System confirms action (optional dialog)
3. Crawl begins, new row appears in history table
4. Status shows "in-progress"
5. User can monitor real-time progress
6. Status updates to "completed" when done

**D. Review Crawl History**

1. User scrolls through history table
2. User sorts by date or pages
3. User reviews change counts
4. User clicks row for details (future)

### 3.2.5.6 Validation Rules

**Schedule Validation:**

- Run time must be valid 24-hour format
- Frequency must be from allowed options
- Timezone must be valid IANA timezone string

**Configuration Validation:**

- Crawl depth: 1-10 (integer)
- Max pages: 10-10,000 (integer)
- Both must be positive numbers

**Business Rules:**

- Cannot schedule crawl more frequently than every 12 hours
- Minimum 1-hour gap between manual crawls
- Active crawl must complete before starting new one

### 3.2.5.7 Real-time Updates

**Active Crawl Monitoring:**

- Poll crawl status every 5 seconds when crawl is "in-progress"
- Update history table row in real-time
- Update pages processed counter
- Update duration timer
- Show progress indicator

**WebSocket Alternative** (Future Enhancement):

- Real-time status updates via WebSocket
- Live page count increments
- Immediate status changes
- Reduced server polling

### 3.2.5.8 Error Handling

**Error States:**

- **Schedule Save Failed:** "Unable to save schedule. Please try again."
- **Config Save Failed:** "Unable to save configuration. Please verify your settings."
- **Crawl Start Failed:** "Unable to start crawl. Please check your configuration."
- **Crawl Failed Mid-Process:** Status shows "failed" with error icon
- **Invalid Parameters:** Inline validation messages on form fields

**Visual Feedback:**

- Error alert banner (red) for critical failures
- Inline error messages for form validation
- Disabled buttons during save operations
- Loading spinners for async actions

### 3.2.5.9 Security Considerations

- Validate crawl depth to prevent excessive resource usage
- Rate limit manual crawl triggers (1 per hour per website)
- Restrict crawl to configured scannable domains only
- Respect robots.txt and crawl-delay directives
- Timeout long-running crawls (max 30 minutes)

### 3.2.5.10 Performance Considerations

- Crawl runs asynchronously (background job)
- Results streamed to database incrementally
- History table uses pagination (10 items per page)
- Cache last crawl status for 5 minutes
- Debounce configuration saves (1 second)

---

## Section 4: Updated Tab Navigation

### 4.1 Tab Order

The Website Management Interface now includes 5 tabs:

1. **Overview** - Website details and metrics
2. **Link Management** - Configure navigation links
3. **Widget Code** - Integration code and configuration
4. **Embedding Test** *(NEW)* - Test intent matching
5. **Crawl Management** *(NEW)* - Crawl scheduling and history

### 4.2 Tab URL Routes

```
/website/overview
/website/links
/website/code
/website/embedding-test
/website/crawl-management
```

### 4.3 Tab Permissions (Future)

- Overview: View only (all users)
- Link Management: Edit permissions required
- Widget Code: View only (all users)
- Embedding Test: View only (all users)
- Crawl Management: Admin permissions required for configuration

---

## Section 5: Updated Data Models

### 5.1 Enhanced Website Model

```typescript
interface Website {
  // ... existing fields from base PRD

  crawlSchedule: {
    frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'manual';
    runTime: string; // HH:MM
    timezone: string;
    enabled: boolean;
    nextRunTime?: string; // ISO date
  };

  crawlConfig: {
    crawlDepth: number;
    maxPages: number;
    respectRobotsTxt: boolean;
    followExternalLinks: boolean;
  };

  crawlStatus?: {
    lastCrawl: string; // ISO date
    pagesIndexed: number;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    changesDetected?: number;
  };
}
```

---

## Section 6: Acceptance Criteria

### 6.1 Embedding Test

- [ ] User can enter natural language queries
- [ ] Results display within 500ms
- [ ] Match percentages are accurate (validated against test dataset)
- [ ] Best match is clearly indicated
- [ ] Required slots are shown for dynamic routes
- [ ] Recent queries persist across sessions
- [ ] Empty state is clear and helpful
- [ ] No results message provides actionable guidance

### 6.2 Crawl Management

- [ ] User can configure daily/weekly/monthly schedules
- [ ] Schedule saves successfully with confirmation
- [ ] Crawl configuration validates input ranges
- [ ] Manual crawl triggers successfully
- [ ] Crawl history displays last 10 crawls
- [ ] Active crawl shows real-time progress
- [ ] Last crawl status displays accurate information
- [ ] Failed crawls show error details
- [ ] Cannot start crawl while one is in progress

---

## Section 7: MVP Scope for New Features

### 7.1 Included in MVP

✅ Basic embedding test with match scoring
✅ Daily/weekly/monthly crawl scheduling
✅ Manual crawl trigger
✅ Crawl depth and page limit configuration
✅ Crawl history table (last 50 entries)
✅ Real-time crawl status updates
✅ Recent queries storage (localStorage)

### 7.2 Excluded from MVP (Future)

❌ Advanced embedding test with filters
❌ Export crawl reports
❌ Detailed crawl logs/error reports
❌ Crawl diff viewer (page-by-page changes)
❌ Scheduled crawl notifications
❌ Crawl performance analytics
❌ Custom crawl rules (include/exclude patterns)
❌ Multi-domain simultaneous crawling
❌ Crawl pause/resume functionality

---

## Section 8: Dependencies

### 8.1 Backend Requirements

**New API Endpoints:**

- Embedding test endpoint with vector search
- Crawl scheduler service
- Crawl execution engine
- Crawl history storage

**Infrastructure:**

- Job queue for scheduled crawls (e.g., Bull, Agenda)
- Vector database for embeddings (pgvector)
- Web crawler service (e.g., Puppeteer, Playwright)

### 8.2 Third-party Services

- NLP/embedding model (OpenAI, Cohere, or self-hosted)
- Job scheduling service (cron or distributed scheduler)

---

## Section 9: Testing Requirements

### 9.1 Embedding Test

**Unit Tests:**

- Query validation
- Result sorting and filtering
- Match score calculation
- Empty state rendering

**Integration Tests:**

- API endpoint integration
- Real-time search functionality
- Recent queries persistence

**E2E Tests:**

- Complete test flow from input to results
- Error handling scenarios
- Recent query re-execution

### 9.2 Crawl Management

**Unit Tests:**

- Schedule validation
- Configuration validation
- Time formatting
- Duration calculations

**Integration Tests:**

- Schedule save/load
- Configuration save/load
- Crawl trigger API
- History pagination

**E2E Tests:**

- Complete schedule configuration flow
- Manual crawl trigger and monitoring
- History table interactions
- Error scenarios

---

## Appendix A: Mockup References

- **Image 1:** Embedding Test - Empty State (`mockup-test-embeddings.jpg`)
- **Image 2:** Embedding Test - Results View (`mockup-test-embeddings-results.jpg`)
- **Image 3:** Crawl Management - Full Interface (`mockup-crawl-management.jpg`)

---

## Appendix B: Sample Queries for Embedding Test

**Financial/Banking Context:**

- "Show me my portfolio"
- "Check my account balance"
- "Transfer money between accounts"
- "View recent transactions"
- "Update my contact information"
- "Download tax documents"

**E-commerce Context:**

- "Track my order"
- "Return an item"
- "View my wish list"
- "Apply a coupon code"
- "Contact customer support"

**Healthcare Context:**

- "Schedule an appointment"
- "View my prescriptions"
- "Download medical records"
- "Find a nearby clinic"
- "Pay my bill"

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.1 | 2025-10 | Initial extension with Embedding Test and Crawl Management | Product Team |

---

**End of Extension Document**
