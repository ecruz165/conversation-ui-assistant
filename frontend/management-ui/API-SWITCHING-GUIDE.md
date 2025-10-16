# API Switching Guide

This document explains how to switch between mock API and real backend API in the management-ui application.

## Overview

The application now supports switching between mock data (for development/testing) and real backend APIs (for production).

## How to Switch

### Using Environment Variables

Edit the `.env` file in the root of the management-ui directory:

```bash
# Set to 'true' to use mock data, 'false' to use real backend
VITE_MOCK_ENABLED=true
```

**To use MOCK data (default):**

```bash
VITE_MOCK_ENABLED=true
```

**To use REAL backend:**

```bash
VITE_MOCK_ENABLED=false
```

After changing this value, **restart your development server** for changes to take effect.

## Configuration

### Backend URLs

The real API URLs are configured in `.env`:

```bash
# Backend API Configuration
VITE_API_URL=http://localhost:8080/api          # Management Service
VITE_NAVIGATION_API_URL=http://localhost:8081/api  # Navigation Service
```

Update these URLs to point to your backend services:

- **Management Service** (port 8080): Traditional Spring MVC for CRUD operations
- **Navigation Service** (port 8081): Reactive WebFlux for real-time features

### External Links

You can configure external links used in the application:

```bash
# External Links
VITE_DOCUMENTATION_URL=https://docs.example.com  # Documentation link on homepage
```

The "View Documentation" button on the homepage will open this URL in a new window.

### Mock Configuration

You can also configure mock behavior:

```bash
# Mock API Configuration
VITE_MOCK_DELAY=500        # Simulated network delay in milliseconds
VITE_MOCK_FAILURE_RATE=0   # Probability of request failure (0-1)
```

## API Endpoints

When `VITE_MOCK_ENABLED=false`, the application will call the following real API endpoints:

### System Metrics

- `GET /api/metrics/system` - Get system health metrics

### Websites

- `GET /api/websites` - List all websites
- `GET /api/websites/{id}` - Get single website
- `POST /api/websites` - Create new website
- `PUT /api/websites/{id}` - Update website
- `DELETE /api/websites/{id}` - Delete website

### Navigation Links

- `GET /api/websites/{websiteId}/navigation-links` - List navigation links
- `GET /api/websites/{websiteId}/navigation-links/{linkId}` - Get single link
- `POST /api/websites/{websiteId}/navigation-links` - Create link
- `PUT /api/websites/{websiteId}/navigation-links/{linkId}` - Update link
- `DELETE /api/websites/{websiteId}/navigation-links/{linkId}` - Delete link
- `PATCH /api/websites/{websiteId}/navigation-links/bulk/active` - Bulk update active status
- `DELETE /api/websites/{websiteId}/navigation-links/bulk` - Bulk delete links

## Backend Setup

Before switching to real API mode, ensure your backend services are running:

```bash
# From project root
make run                 # Start all services

# Or individually
cd backend/management-service && make run    # Port 8080
cd backend/navigation-service && make run    # Port 8081
```

## Testing

### Test with Mock Data

```bash
# In .env
VITE_MOCK_ENABLED=true

# Start dev server
npm run dev
```

### Test with Real Backend

```bash
# Ensure backend is running
make run

# In .env
VITE_MOCK_ENABLED=false

# Start dev server
npm run dev
```

## Architecture

The switching mechanism works at the hook level:

1. **Query Hooks** (`useWebsites`, `useWebsite`, `useNavigationLinks`, `useSystemMetrics`)
   - Check `mockConfig.enabled`
   - Call either `mockApi` or `api` service

2. **Mutation Hooks** (`useCreateLink`, `useUpdateLink`, `useDeleteLink`, etc.)
   - Check `mockConfig.enabled`
   - Call either `mockApi` or `api` service

3. **Services**
   - `src/mocks/api.ts` - Mock API with simulated delays
   - `src/api/service.ts` - Real API with fetch calls

## Files Modified

- `src/config/index.ts` - Added `apiConfig` and environment variable support
- `src/api/service.ts` - Created real API service layer
- `src/hooks/useWebsites.ts` - Added conditional API switching
- `src/hooks/useWebsite.ts` - Added conditional API switching
- `src/hooks/useNavigationLinks.ts` - Added conditional API switching
- `src/hooks/useSystemMetrics.ts` - Added conditional API switching
- `src/hooks/useNavigationLinkMutations.ts` - Added conditional API switching for all mutations
- `.env` - Created with configuration variables
- `.env.example` - Updated with API configuration

## Troubleshooting

### Issue: Changes not taking effect

**Solution:** Restart the development server after changing `.env` variables

### Issue: API calls failing with CORS errors

**Solution:** Ensure backend services have CORS properly configured for `http://localhost:3000`

### Issue: 404 errors on API endpoints

**Solution:** Verify backend services are running and URLs in `.env` are correct

### Issue: Mock data still showing when VITE_MOCK_ENABLED=false

**Solution:** Check that `.env` has `VITE_MOCK_ENABLED=false` (not 'False' or '0')

## Production Deployment

For production builds, set environment variables in your hosting platform:

```bash
VITE_MOCK_ENABLED=false
VITE_API_URL=https://api.yourdomian.com/api
VITE_NAVIGATION_API_URL=https://navigation.yourdomain.com/api
```

The mock system will automatically be disabled in production when properly configured.
