import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ChatWidget from './chat-widget/components/ChatWidget'
import ConversationProvider from './chat-widget/providers/ConversationProvider'

function App() {
  return (
    <ConversationProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Management UI
                  </h1>
                </div>
                <nav className="flex space-x-8">
                  <Link
                    to="/"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/users"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Users
                  </Link>
                  <Link
                    to="/settings"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Settings
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>

          {/* Chat Widget */}
          <ChatWidget />
        </div>
      </Router>
    </ConversationProvider>
  )
}

function Dashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
        <p className="text-gray-600">
          Welcome to the Management UI. This application includes the Chat Widget MFE
          that can be consumed by tenant applications.
        </p>
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Module Federation</h3>
          <p className="text-blue-700 text-sm">
            The Chat Widget components are exposed via Module Federation at:
            <br />
            <code className="bg-blue-100 px-2 py-1 rounded text-xs">
              http://localhost:3000/assets/remoteEntry.js
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}

function Users() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Users</h2>
        <p className="text-gray-600">User management interface.</p>
      </div>
    </div>
  )
}

function Settings() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
        <p className="text-gray-600">Application settings and configuration.</p>
      </div>
    </div>
  )
}

export default App
