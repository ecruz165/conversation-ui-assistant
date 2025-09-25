# Testing Suite

Comprehensive testing framework for the Conversation UI Assistant project.

## 📁 Directory Structure

```
testing/
├── e2e/                    # End-to-end tests (Playwright)
├── load/                   # Load testing (K6)
├── stress/                 # Stress testing (K6)
├── integration/            # Integration tests (Newman/Postman)
├── security/               # Security testing (OWASP ZAP)
├── performance/            # Performance benchmarks
├── common/                 # Shared utilities and helpers
├── reports/                # Test reports and results
├── package.json            # Node.js dependencies
├── playwright.config.ts    # Playwright configuration
├── Makefile               # Testing commands
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker (for containerized testing)
- K6 (for load testing)
- Newman (for API testing)

### Setup

```bash
# Install dependencies
make install

# Or manually:
npm install
npx playwright install
```

## 🧪 Test Types

### End-to-End Tests (E2E)

Tests the complete user journey through the application.

```bash
# Run all E2E tests
make test-e2e

# Run with UI mode
make test-e2e-ui

# Run in headed mode (see browser)
make test-e2e-headed
```

**Technology:** Playwright
**Browsers:** Chrome, Firefox, Safari, Edge
**Features:** 
- Cross-browser testing
- Mobile viewport testing
- Screenshot/video capture on failure
- Parallel execution

### Load Testing

Tests system performance under expected load conditions.

```bash
# Run basic load test
make test-load

# Run spike test
make test-load-spike
```

**Technology:** K6
**Scenarios:**
- `basic-load.js`: Gradual ramp-up to normal load
- `spike-test.js`: Sudden traffic spikes

### Stress Testing

Tests system behavior beyond normal operating capacity.

```bash
# Run stress test
make test-stress
```

**Technology:** K6
**Purpose:** Find breaking points and system limits

### Integration Testing

Tests API endpoints and service communication.

```bash
# Run API integration tests
make test-integration

# Run specific API tests
make test-api
```

**Technology:** Newman (Postman CLI)
**Coverage:**
- Health endpoints
- API functionality
- Cross-service communication

### Security Testing

Tests for security vulnerabilities.

```bash
# Run security tests
make test-security
```

**Technology:** OWASP ZAP
**Coverage:**
- Common vulnerabilities
- Authentication testing
- Input validation

## 🎯 Test Execution

### Individual Test Types

```bash
make test-e2e          # End-to-end tests
make test-load         # Load tests
make test-stress       # Stress tests
make test-integration  # Integration tests
make test-security     # Security tests
```

### Comprehensive Testing

```bash
# Run all tests
make test-all

# Run CI-suitable tests
make test-ci
```

### Environment Setup

```bash
# Local environment
make env-local

# Docker environment
make env-docker
```

## 📊 Reports

Test reports are generated in the `reports/` directory:

- **E2E Reports:** `reports/playwright-report/`
- **Load Test Reports:** `reports/load-test-summary.html`
- **Stress Test Reports:** `reports/stress-test-summary.html`
- **API Test Reports:** `reports/newman-report.html`

## 🔧 Configuration

### Playwright Configuration

Edit `playwright.config.ts` to modify:
- Browser settings
- Test timeouts
- Base URLs
- Parallel execution

### K6 Configuration

Edit load/stress test files to modify:
- User load patterns
- Test duration
- Performance thresholds

### API Test Configuration

Edit Postman collections in `integration/api/` to modify:
- API endpoints
- Test assertions
- Environment variables

## 🌍 Environment Variables

```bash
# Base URL for testing
BASE_URL=http://localhost:3000

# Service URLs
MANAGEMENT_SERVICE_URL=http://localhost:8080
NAVIGATION_SERVICE_URL=http://localhost:8081

# Test configuration
CI=true                    # Enable CI mode
HEADED=false              # Run tests in headless mode
PARALLEL=true             # Enable parallel execution
```

## 📝 Writing Tests

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Conversation UI/);
});
```

### Load Tests

```javascript
import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const response = http.get('http://localhost:8080/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}
```

### API Tests

Use Postman collections or Newman scripts for API testing.

## 🚨 Troubleshooting

### Common Issues

1. **Services not ready**
   ```bash
   # Ensure services are running
   make env-docker
   ```

2. **Browser installation**
   ```bash
   # Reinstall browsers
   npx playwright install
   ```

3. **Port conflicts**
   ```bash
   # Check if ports are available
   lsof -i :8080
   lsof -i :8081
   lsof -i :3000
   ```

### Debug Mode

```bash
# Run E2E tests with debug
npx playwright test --debug

# Run load tests with verbose output
k6 run --verbose load/scenarios/basic-load.js
```

## 🔄 CI/CD Integration

The testing suite is designed for CI/CD integration:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    cd testing
    make install
    make test-ci
```

## 📚 Best Practices

1. **Test Isolation:** Each test should be independent
2. **Data Management:** Use test fixtures and cleanup
3. **Assertions:** Use meaningful assertions and error messages
4. **Performance:** Set appropriate timeouts and thresholds
5. **Maintenance:** Keep tests updated with application changes

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns and conventions
2. Add appropriate documentation
3. Update this README if needed
4. Ensure tests are reliable and maintainable
5. Add to the appropriate test category
