import React, { ReactNode } from 'react'
import { Box, Toolbar } from '@mui/material'
import { Header } from './Header'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box className="min-h-screen bg-gray-100">
      <Header />
      {/* Toolbar spacer to push content below fixed AppBar */}
      <Toolbar />
      {/* Main content area */}
      <main id="main-content" className="pb-8">
        {children}
      </main>
    </Box>
  )
}
