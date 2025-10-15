import React from 'react'
import { Layout } from '~/components/Layout'
import { PageTabs } from '~/components/PageTabs'
import { Box, Typography, Paper } from '@mui/material'

const tabs = [
  { label: 'Overview', value: 'overview', path: '/website/overview' },
  { label: 'Link Management', value: 'links', path: '/website/links' },
  { label: 'Widget Code', value: 'code', path: '/website/code' },
]

export function WidgetCode() {
  return (
    <Layout>
      {/* Page Title */}
      <Box className="bg-gradient-to-r from-primary-700 to-primary-900 px-page md:px-6 lg:px-8 py-12">
        <Box className="max-w-7xl mx-auto">
          <Typography variant="h4" className="font-bold text-white">
            Website Name
          </Typography>
          <Typography variant="body1" className="mt-2 text-white/90">
            https://example.com
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <PageTabs tabs={tabs} />

      {/* Content */}
      <Box className="max-w-7xl mx-auto px-page md:px-6 lg:px-8 py-8">
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4">
            Widget Code
          </Typography>
          <Typography variant="body1" className="text-gray-600 mb-4">
            Copy and paste this code snippet into your website's HTML:
          </Typography>
          <Box className="bg-gray-100 p-4 rounded font-mono text-sm overflow-x-auto">
            <code>
              {`<script src="https://access360.example.com/widget.js"></script>
<script>
  Access360.init({
    websiteId: 'your-website-id',
    apiKey: 'your-api-key'  // pragma: allowlist secret
  });
</script>`}
            </code>
          </Box>
        </Paper>
      </Box>
    </Layout>
  )
}
