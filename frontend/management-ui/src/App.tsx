import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSystemMetrics } from './hooks/useSystemMetrics'
import { useWebsites } from './hooks/useWebsites'
import { Layout } from './components/Layout'
import { RegisterWebsite } from './pages/RegisterWebsite'
import { NotFound } from './pages/NotFound'
import { WebsiteOverview } from './pages/website/Overview'
import { LinkManagement } from './pages/website/LinkManagement'
import { WidgetCode } from './pages/website/WidgetCode'

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterWebsite />} />
          <Route path="/website/overview" element={<WebsiteOverview />} />
          <Route path="/website/links" element={<LinkManagement />} />
          <Route path="/website/code" element={<WidgetCode />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

function LandingPage() {
  const { data: metrics, isLoading: metricsLoading } = useSystemMetrics()
  const { data: websites, isLoading: websitesLoading } = useWebsites()

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 px-page-mobile md:px-page lg:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Make Your Website More Accessible
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6">
            Navigate users where they want to be with our intelligent chat widget
          </p>
          <div className="flex flex-wrap gap-4 text-sm md:text-base text-white/90">
            <span>Easy Integration</span>
            <span>•</span>
            <span>Smart Navigation</span>
            <span>•</span>
            <span>Optimized for Accessibility</span>
          </div>
        </div>
      </section>

      {/* Metrics Dashboard */}
      <section className="px-page-mobile md:px-page lg:px-8 py-section-mobile md:py-12 -mt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
              <MetricCard label="Total Applications" value={metrics.totalApplications.toString()} />
              <MetricCard label="Active Users" value={metrics.activeUsers.toLocaleString()} />
              <MetricCard label="Intent Match Rate" value={`${metrics.intentMatchRate}%`} />
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
                Register your application and boost usability with a modern hands free form
                of navigation on your website today.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Link
                to="/register"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold p-button rounded-lg transition-colors text-center"
              >
                Register New Website
              </Link>
              <button className="w-full bg-white hover:bg-gray-50 text-primary-600 font-semibold p-button rounded-lg border-2 border-primary-600 transition-colors">
                View Documentation
              </button>
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
  )
}

interface MetricCardProps {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-card hover:shadow-lg transition-shadow">
      <div className="text-sm md:text-base text-gray-600 mb-2">{label}</div>
      <div className="text-3xl md:text-4xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-card animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

export default App
