import React, { useState } from 'react'
import { Layout } from '~/components/Layout'
import { PageTabs } from '~/components/PageTabs'
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  IconButton,
  Switch,
  LinearProgress,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle,
  Error,
  HourglassEmpty,
  Pending,
} from '@mui/icons-material'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { useWebsite } from '~/hooks/useWebsite'
import { useNavigationLinks } from '~/hooks/useNavigationLinks'
import { LinkForm } from '~/components/LinkForm'
import { LinkDetailDialog } from '~/components/LinkDetailDialog'
import type { NavigationLink } from '~/types'

const tabs = [
  { label: 'Overview', value: 'overview', path: '/website/overview' },
  { label: 'Link Management', value: 'links', path: '/website/links' },
  { label: 'Widget Code', value: 'code', path: '/website/code' },
]

export function LinkManagement() {
  const websiteId = 'mock-website-1'
  const { data: website, isLoading: websiteLoading } = useWebsite(websiteId)
  const { data: links = [], isLoading: linksLoading } = useNavigationLinks(websiteId)

  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedLink, setSelectedLink] = useState<NavigationLink | null>(null)
  const [editMode, setEditMode] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" fontSize="small" />
      case 'processing':
        return <HourglassEmpty color="warning" fontSize="small" />
      case 'pending':
        return <Pending color="info" fontSize="small" />
      case 'failed':
        return <Error color="error" fontSize="small" />
      default:
        return null
    }
  }

  const columns: ColumnDef<NavigationLink>[] = [
    {
      accessorKey: 'displayName',
      header: 'Display Name',
      cell: ({ row }) => (
        <Box>
          <Typography variant="body2" className="font-medium">
            {row.original.displayName}
          </Typography>
          {row.original.description && (
            <Typography variant="caption" className="text-gray-600">
              {row.original.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      accessorKey: 'targetUrl',
      header: 'Target URL',
      cell: ({ getValue }) => (
        <Typography variant="body2" className="font-mono text-xs">
          {getValue<string>()}
        </Typography>
      ),
    },
    {
      accessorKey: 'parameters',
      header: 'Parameters',
      cell: ({ row }) => (
        <Box className="flex flex-wrap gap-1">
          {row.original.parameters && row.original.parameters.length > 0 ? (
            row.original.parameters.map((param, index) => (
              <Chip
                key={index}
                label={`{${param.name}}`}
                size="small"
                color="primary"
                variant="outlined"
                className="text-xs"
              />
            ))
          ) : (
            <Typography variant="caption" className="text-gray-400">
              None
            </Typography>
          )}
        </Box>
      ),
    },
    {
      accessorKey: 'embeddingStatus',
      header: 'Embedding',
      cell: ({ row }) => (
        <Box className="flex items-center gap-1">
          {getStatusIcon(row.original.embeddingStatus)}
          {row.original.embeddingStatus === 'processing' && (
            <LinearProgress className="w-16" />
          )}
        </Box>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onChange={(e) => {
            e.stopPropagation()
            handleToggleActive(row.original.id, row.original.isActive)
          }}
          onClick={(e) => e.stopPropagation()}
          size="small"
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Box className="flex gap-1">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleEditLink(row.original)
            }}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteLink(row.original.id)
            }}
            color="error"
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ]

  const table = useReactTable({
    data: links,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleAddLink = () => {
    setSelectedLink(null)
    setEditMode(false)
    setFormOpen(true)
  }

  const handleEditLink = (link: NavigationLink) => {
    setSelectedLink(link)
    setEditMode(true)
    setDetailOpen(false)
    setFormOpen(true)
  }

  const handleViewLink = (link: NavigationLink) => {
    setSelectedLink(link)
    setDetailOpen(true)
  }

  const handleDeleteLink = (linkId: string) => {
    console.log('Delete link:', linkId)
    // TODO: Implement delete functionality
  }

  const handleToggleActive = (linkId: string, currentStatus: boolean) => {
    console.log('Toggle link status:', linkId, !currentStatus)
    // TODO: Implement toggle functionality
  }

  const handleFormSubmit = async (data: Partial<NavigationLink>) => {
    console.log('Form submitted:', data)
    // TODO: Implement API call
  }

  if (websiteLoading || linksLoading) {
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
      <Box className="max-w-7xl mx-auto px-page md:px-6 lg:px-8 py-8">
        <Paper elevation={2} className="p-6">
          <Box className="flex justify-between items-center mb-6">
            <Box>
              <Typography variant="h6" className="font-semibold">
                Navigation Links
              </Typography>
              <Typography variant="body2" className="text-gray-600 mt-1">
                Manage links that help users navigate to specific pages
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLink}
            >
              Add Link
            </Button>
          </Box>

          {!links || links.length === 0 ? (
            <Box className="text-center py-12">
              <Typography variant="body1" className="text-gray-600">
                No navigation links configured yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddLink}
                className="mt-4"
              >
                Add Your First Link
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <MuiTable>
                <TableHead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableCell key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={() => handleViewLink(row.original)}
                      sx={{ cursor: 'pointer' }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </MuiTable>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Link Form Dialog */}
      <LinkForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedLink || undefined}
        mode={editMode ? 'edit' : 'create'}
      />

      {/* Link Detail Dialog */}
      <LinkDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        link={selectedLink}
        onEdit={handleEditLink}
      />
    </Layout>
  )
}
