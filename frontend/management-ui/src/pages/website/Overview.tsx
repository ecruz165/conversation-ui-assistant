import React, { useState } from 'react'
import { Layout } from '~/components/Layout'
import { PageTabs } from '~/components/PageTabs'
import { Box, Typography, Paper, Button, Chip } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { useWebsite } from '~/hooks/useWebsite'
import { useSystemMetrics } from '~/hooks/useSystemMetrics'
import { WebsiteRegistrationForm } from '~/components/WebsiteRegistrationForm'
import type { Website } from '~/types'

const tabs = [
  { label: 'Overview', value: 'overview', path: '/website/overview' },
  { label: 'Link Management', value: 'links', path: '/website/links' },
  { label: 'Widget Code', value: 'code', path: '/website/code' },
]

export function WebsiteOverview() {
  // For now, use the first mock website ID
  const websiteId = 'mock-website-1'
  const { data: website, isLoading } = useWebsite(websiteId)
  const { data: metrics } = useSystemMetrics()
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async (data: Partial<Website>) => {
    // In a real app, this would call an API to update the website
    console.log('Saving website data:', data)
    setIsEditing(false)
    // TODO: Add mutation hook to update website
  }

  // Transform Website data to form data structure
  const getFormData = () => {
    if (!website) return undefined
    return {
      name: website.name,
      type: website.type,
      description: website.description || '',
      contact: {
        name: website.contact.name,
        email: website.contact.email,
        department: website.contact.department || '',
        phone: website.contact.phone || '',
      },
      domains: {
        primary: website.domains.primary,
        scannableDomains: website.domains.scannableDomains.map(d => ({
          url: d.domain,
          isActiveForScanning: d.isActive,
          requiresCredentials: false,
          credentials: { username: '', password: '' },
        })),
      },
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <Box className="flex items-center justify-center min-h-screen">
          <Typography>Loading...</Typography>
        </Box>
      </Layout>
    )
  }

  if (!website) {
    return (
      <Layout>
        <Box className="flex items-center justify-center min-h-screen">
          <Typography>Website not found</Typography>
        </Box>
      </Layout>
    )
  }

  if (isEditing) {
    return (
      <Layout>
        {/* Page Title */}
        <Box className="bg-gradient-to-r from-primary-700 to-primary-900 px-page md:px-6 lg:px-8 py-12">
          <Box className="max-w-7xl mx-auto">
            <Typography variant="h4" className="font-bold text-white">
              Edit {website.name}
            </Typography>
            <Typography variant="body1" className="mt-2 text-white/90">
              {website.domains.primary}
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <PageTabs tabs={tabs} />

        {/* Edit Form */}
        <WebsiteRegistrationForm
          mode="edit"
          initialData={getFormData()}
          onSubmit={handleSave}
          onCancel={handleCancel}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Page Title */}
      <Box className="bg-gradient-to-r from-primary-700 to-primary-900 px-page md:px-6 lg:px-8 py-12">
        <Box className="max-w-7xl mx-auto">
          <Typography variant="h4" className="font-bold text-white">
            {website.name}
          </Typography>
          <Typography variant="body1" className="mt-2 text-white/90">
            {website.domains.primary}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <PageTabs tabs={tabs} />

      {/* Content */}
      <Box className="max-w-7xl mx-auto px-page md:px-6 lg:px-8 py-8 space-y-6">
        {/* Metrics Section */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Paper elevation={2} className="p-6">
            <Typography variant="body2" className="text-gray-600 mb-2">
              Links Indexed
            </Typography>
            <Typography variant="h4" className="font-bold text-gray-900">
              {website.crawlStatus?.pagesIndexed || 0}
            </Typography>
          </Paper>
          <Paper elevation={2} className="p-6">
            <Typography variant="body2" className="text-gray-600 mb-2">
              Crawl Status: {website.crawlStatus?.status === 'completed' ? 'Success' : (website.crawlStatus?.status || 'Pending')}
            </Typography>
            <Typography variant="h4" className="font-bold text-gray-900">
              {website.crawlStatus?.lastCrawl
                ? new Date(website.crawlStatus.lastCrawl).toLocaleDateString()
                : 'N/A'}
            </Typography>
          </Paper>
          <Paper elevation={2} className="p-6">
            <Typography variant="body2" className="text-gray-600 mb-2">
              Active Users
            </Typography>
            <Typography variant="h4" className="font-bold text-gray-900">
              {metrics?.activeUsers.toLocaleString() || 0}
            </Typography>
          </Paper>
          <Paper elevation={2} className="p-6">
            <Typography variant="body2" className="text-gray-600 mb-2">
              Intent Match Rate
            </Typography>
            <Typography variant="h4" className="font-bold text-gray-900">
              {metrics?.intentMatchRate || 0}%
            </Typography>
          </Paper>
        </Box>

        {/* Website Information Section */}
        <Paper elevation={2} className="p-6">
          <Box className="flex justify-between items-center mb-6">
            <Typography variant="h6" className="font-semibold">
              Website Information
            </Typography>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              className="text-primary-600 border-primary-600"
            >
              Edit
            </Button>
          </Box>

          <Box className="space-y-4">
              <Box>
                <Typography variant="body2" className="text-gray-600 mb-1">
                  Description
                </Typography>
                <Typography variant="body1" className="text-gray-900">
                  {website.description || 'No description provided'}
                </Typography>
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Application Type
                  </Typography>
                  <Chip label={website.type} className="mt-1" />
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    App Key
                  </Typography>
                  <Typography variant="body1" className="text-gray-900 font-mono text-sm">
                    {website.appKey}
                  </Typography>
                </Box>
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Primary Domain
                  </Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {website.domains.primary}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-2">
                    Scannable Domain
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {website.domains.scannableDomains
                      .filter(d => d.isActive)
                      .map((domainObj, index) => (
                        <Chip key={index} label={domainObj.domain} variant="outlined" />
                      ))}
                  </Box>
                </Box>
              </Box>
              <Typography variant="subtitle2" className="text-gray-700 mt-4 mb-2">
                Contact Information
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Name
                  </Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {website.contact.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Email
                  </Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {website.contact.email}
                  </Typography>
                </Box>
                {website.contact.phone && (
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Phone
                    </Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {website.contact.phone}
                    </Typography>
                  </Box>
                )}
                {website.contact.department && (
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Department
                    </Typography>
                    <Typography variant="body1" className="text-gray-900">
                      {website.contact.department}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Created At
                  </Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {new Date(website.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Last Updated
                  </Typography>
                  <Typography variant="body1" className="text-gray-900">
                    {new Date(website.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
        </Paper>
      </Box>
    </Layout>
  )
}
