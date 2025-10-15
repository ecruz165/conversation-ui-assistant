import React from 'react'
import { Tabs, Tab, Box } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'

export interface TabItem {
  label: string
  value: string
  path: string
}

interface PageTabsProps {
  tabs: TabItem[]
}

export function PageTabs({ tabs }: PageTabsProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Find the current tab based on the current path
  const currentTab = tabs.find(tab => location.pathname === tab.path)?.value || tabs[0].value

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    const selectedTab = tabs.find(tab => tab.value === newValue)
    if (selectedTab) {
      navigate(selectedTab.path)
    }
  }

  return (
    <Box className="border-b border-gray-200 bg-white">
      <Box className="max-w-7xl mx-auto px-page md:px-6 lg:px-8">
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              color: 'rgb(107, 114, 128)', // text-gray-500
              '&.Mui-selected': {
                color: 'rgb(29, 78, 216)', // primary-600
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'rgb(29, 78, 216)', // primary-600
              height: '3px',
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>
    </Box>
  )
}
