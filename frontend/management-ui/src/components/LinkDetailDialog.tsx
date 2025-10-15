import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Paper,
  Divider,
} from '@mui/material'
import { CheckCircle, Error, HourglassEmpty, Pending } from '@mui/icons-material'
import type { NavigationLink } from '~/types'

interface LinkDetailDialogProps {
  open: boolean
  onClose: () => void
  link: NavigationLink | null
  onEdit?: (link: NavigationLink) => void
}

export function LinkDetailDialog({ open, onClose, link, onEdit }: LinkDetailDialogProps) {
  if (!link) return null

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

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      default:
        return 'Not Started'
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Typography variant="h6">{link.displayName}</Typography>
          <Chip
            label={link.isActive ? 'Active' : 'Inactive'}
            color={link.isActive ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box className="space-y-4">
          {/* Basic Info */}
          <Paper elevation={0} className="p-4 bg-gray-50">
            <Typography variant="subtitle2" className="font-semibold mb-2">
              Basic Information
            </Typography>
            <Box className="space-y-2">
              <Box>
                <Typography variant="caption" className="text-gray-600">
                  Target URL
                </Typography>
                <Typography variant="body2" className="font-mono">
                  {link.targetUrl}
                </Typography>
              </Box>
              {link.parameters && link.parameters.length > 0 && (
                <Box>
                  <Typography variant="caption" className="text-gray-600">
                    Required Parameters
                  </Typography>
                  <Box className="flex flex-wrap gap-1 mt-1">
                    {link.parameters.map((param, index) => (
                      <Box key={index}>
                        <Chip
                          label={`{${param.name}}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {param.description && (
                          <Typography variant="caption" className="text-gray-500 block mt-0.5">
                            {param.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {link.description && (
                <Box>
                  <Typography variant="caption" className="text-gray-600">
                    Description
                  </Typography>
                  <Typography variant="body2">{link.description}</Typography>
                </Box>
              )}
              {link.keywords && link.keywords.length > 0 && (
                <Box>
                  <Typography variant="caption" className="text-gray-600">
                    Keywords
                  </Typography>
                  <Box className="flex flex-wrap gap-1 mt-1">
                    {link.keywords.map((keyword, index) => (
                      <Chip key={index} label={keyword} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Form Fields */}
          {link.hasForm && link.formFields && link.formFields.length > 0 && (
            <Paper elevation={0} className="p-4 bg-purple-50">
              <Typography variant="subtitle2" className="font-semibold mb-3 text-purple-900">
                Form Fields to Collect
              </Typography>
              <Box className="space-y-2">
                {link.formFields.map((field, index) => (
                  <Paper key={index} variant="outlined" className="p-3 bg-white">
                    <Box className="flex items-start justify-between">
                      <Box className="flex-1">
                        <Box className="flex items-center gap-2 mb-1">
                          <Typography variant="body2" className="font-medium">
                            {field.label}
                          </Typography>
                          <Chip label={field.slot} size="small" variant="outlined" />
                          <Chip label={field.type} size="small" color="primary" />
                          {field.required && (
                            <Chip label="Required" size="small" color="error" />
                          )}
                        </Box>
                        {field.placeholder && (
                          <Typography variant="caption" className="text-gray-500">
                            Placeholder: {field.placeholder}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          )}

          {/* AI Guidance */}
          {link.aiGuidance && (
            <Paper elevation={0} className="p-4 bg-blue-50">
              <Typography variant="subtitle2" className="font-semibold mb-2">
                AI Guidance
              </Typography>
              <Typography variant="body2" className="text-gray-700">
                {link.aiGuidance}
              </Typography>
            </Paper>
          )}

          {/* Embedding Status */}
          <Paper elevation={0} className="p-4 bg-gray-50">
            <Box className="flex items-center justify-between mb-2">
              <Typography variant="subtitle2" className="font-semibold">
                Embedding Status
              </Typography>
              <Box className="flex items-center gap-1">
                {getStatusIcon(link.embeddingStatus)}
                <Typography variant="body2">{getStatusLabel(link.embeddingStatus)}</Typography>
              </Box>
            </Box>
            {link.embeddingStatus === 'processing' && (
              <LinearProgress className="mt-2" />
            )}
          </Paper>

          {/* AI Summary */}
          {link.aiSummary && (
            <>
              <Divider />
              <Box>
                <Typography variant="h6" className="mb-3">
                  AI-Generated Summary
                </Typography>

                <Paper elevation={0} className="p-4 bg-green-50 mb-3">
                  <Typography variant="subtitle2" className="font-semibold mb-2 text-green-900">
                    What Users See
                  </Typography>
                  <Typography variant="body2" className="text-gray-700">
                    {link.aiSummary.whatUsersSee}
                  </Typography>
                </Paper>

                <Paper elevation={0} className="p-4 bg-purple-50">
                  <Typography variant="subtitle2" className="font-semibold mb-2 text-purple-900">
                    What Users Can Do
                  </Typography>
                  <Typography variant="body2" className="text-gray-700">
                    {link.aiSummary.whatUsersCanDo}
                  </Typography>
                </Paper>

                {link.aiSummary.generatedAt && (
                  <Typography variant="caption" className="text-gray-500 block mt-2">
                    Generated: {new Date(link.aiSummary.generatedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </>
          )}

          {/* Screenshot */}
          {link.screenshot && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" className="font-semibold mb-2">
                  Screenshot
                </Typography>
                <img
                  src={link.screenshot}
                  alt={`Screenshot of ${link.displayName}`}
                  className="w-full border border-gray-300 rounded"
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {onEdit && (
          <Button onClick={() => onEdit(link)} variant="contained">
            Edit Link
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
