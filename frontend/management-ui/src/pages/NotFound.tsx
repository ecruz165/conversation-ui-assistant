import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Box, Typography } from '@mui/material'
import { Home as HomeIcon } from '@mui/icons-material'
import { Layout } from '~/components/Layout'

export function NotFound() {
  return (
    <Layout>
      <Box className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
        <Typography variant="h1" className="text-9xl font-bold text-primary-600">
          404
        </Typography>
        <Typography variant="h4" className="mt-4 mb-2 text-gray-900">
          Page Not Found
        </Typography>
        <Typography variant="body1" className="mb-8 text-gray-600 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Link to="/" className="no-underline">
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Back to Home
          </Button>
        </Link>
      </Box>
    </Layout>
  )
}
