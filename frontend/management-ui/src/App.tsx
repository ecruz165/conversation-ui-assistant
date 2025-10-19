import { Accessibility, IntegrationInstructions, Navigation } from "@mui/icons-material";
import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { lazy, Suspense } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { MetricCard } from "./components/MetricCard";
import { PageSkeleton } from "./components/PageSkeleton";
import { SkeletonCard } from "./components/SkeletonCard";
import { useSystemMetrics } from "./hooks/useSystemMetrics";
import { useWebsites } from "./hooks/useWebsites";
import { NotFound } from "./pages/NotFound";
import { RegisterWebsite } from "./pages/RegisterWebsite";
import { AnalysisHistoryViewer } from "./pages/website/AnalysisHistoryViewer";
import { CrawlManagement } from "./pages/website/CrawlManagement";
import { EmbeddingTest } from "./pages/website/EmbeddingTest";
import { LinkManagement } from "./pages/website/LinkManagement";
import { WebsiteOverview } from "./pages/website/Overview";
import { SyntheticQueryManager } from "./pages/website/SyntheticQueryManager";
import { WidgetCode } from "./pages/website/WidgetCode";
import { theme } from "./theme";

// Lazy load heavy components for code splitting
const ScreenshotAnalysis = lazy(
  () => import(/* webpackChunkName: "screenshot-analysis" */ "./pages/website/ScreenshotAnalysis")
);

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterWebsite />} />
            <Route path="/website/overview" element={<WebsiteOverview />} />
            <Route path="/website/links" element={<LinkManagement />} />
            <Route path="/website/code" element={<WidgetCode />} />
            <Route path="/website/embedding-test" element={<EmbeddingTest />} />
            <Route
              path="/website/screenshot-analysis"
              element={
                <ErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <ScreenshotAnalysis />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route path="/website/analysis-history" element={<AnalysisHistoryViewer />} />
            <Route path="/website/synthetic-queries" element={<SyntheticQueryManager />} />
            <Route path="/website/crawl-management" element={<CrawlManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function LandingPage() {
  const { data: metrics, isLoading: metricsLoading } = useSystemMetrics();
  const { data: websites, isLoading: websitesLoading } = useWebsites();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 px-page-mobile md:px-page lg:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto text-center md:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Make Your Website More Accessible
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6">
            Navigate users where they want to be with our intelligent chat widget
          </p>
          <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-x-6 text-sm md:text-base text-white/90 items-center md:items-start">
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Navigation fontSize="small" />
              Smart Navigation
            </span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Accessibility fontSize="small" />
              Optimized for Accessibility
            </span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <IntegrationInstructions fontSize="small" />
              Easy Integration
            </span>
          </div>
        </div>
      </section>

      {/* Metrics Dashboard */}
      <section className="px-page-mobile md:px-page lg:px-8 py-section-mobile md:py-12 -mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {metricsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : metrics ? (
            <>
              <MetricCard label="Service Health" value={`${metrics.serviceHealth}%`} />
              <MetricCard label="Total Applications" value={(websites?.length || 0).toString()} />
              {/* TODO: Connect to SSE endpoint for real-time active users count */}
              <MetricCard label="Active Users" value="2" />
              {/* TODO: Connect to SSE endpoint or Zustand store updated by SSE for real-time intent match rate */}
              <MetricCard label="Intent Match Rate" value="87.3%" />
            </>
          ) : null}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-page-mobile md:px-page lg:px-8 py-section-mobile md:py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                Register your application and boost usability with a modern hands free form of
                navigation on your website today.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Link to="/register" className="btn-primary w-full text-center">
                Register New Website
              </Link>
              <button className="btn-secondary w-full">View Documentation</button>
            </div>
          </div>
        </div>
      </section>

      {/* Websites Section */}
      <section className="px-page-mobile md:px-page lg:px-8 py-section-mobile md:py-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Websites</h2>
          <div className="bg-white rounded-lg shadow p-card min-h-[200px]">
            {websitesLoading ? (
              <div className="flex items-center justify-center text-gray-500 py-12">
                Loading websites...
              </div>
            ) : websites && websites.length > 0 ? (
              <div className="space-y-4">
                {websites.map((website) => (
                  <Link
                    key={website.id}
                    to="/website/overview"
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors no-underline"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{website.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{website.description}</p>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>{website.domains.primary}</span>
                      <span>•</span>
                      <span>{website.type}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-gray-500 py-12">
                No websites registered yet
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default App;
