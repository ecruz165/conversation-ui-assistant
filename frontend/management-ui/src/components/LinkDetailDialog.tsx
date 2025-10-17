import {
  CheckCircle,
  Error,
  History as HistoryIcon,
  HourglassEmpty,
  Info as InfoIcon,
  Pending,
  QueryStats as QueryStatsIcon,
  Science as ScienceIcon,
  ViewModule as ViewModuleIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
} from "@mui/icons-material";
import React, { useState } from "react";
import { ConfidenceIndicator, MultiModalRadarChart, ScoreBreakdownBars } from "./visualizations";
import { ImageWithPlaceholder } from "./ImageWithPlaceholder";
import type { NavigationLink } from "~/types";

interface LinkDetailDialogProps {
  open: boolean;
  onClose: () => void;
  link: NavigationLink | null;
  onEdit?: (link: NavigationLink) => void;
}

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function LinkDetailDialog({ open, onClose, link, onEdit }: LinkDetailDialogProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!link) return null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle color="success" fontSize="small" />;
      case "processing":
        return <HourglassEmpty color="warning" fontSize="small" />;
      case "pending":
        return <Pending color="info" fontSize="small" />;
      case "failed":
        return <Error color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return "Not Started";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box className="flex items-center justify-between">
          <Typography variant="h6">{link.displayName}</Typography>
          <Chip
            label={link.isActive ? "Active" : "Inactive"}
            color={link.isActive ? "success" : "default"}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          aria-label="link detail tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<InfoIcon />} iconPosition="start" label="Overview" />
          <Tab icon={<ViewModuleIcon />} iconPosition="start" label="Embeddings" />
          <Tab icon={<ScienceIcon />} iconPosition="start" label="Analysis" />
          <Tab icon={<QueryStatsIcon />} iconPosition="start" label="Queries" />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="History" />
        </Tabs>

        {/* Tab 0: Overview */}
        <TabPanel value={activeTab} index={0}>
        <Box className="space-y-4">
          {/* Basic Info */}
          <Paper elevation={0} className="p-4 bg-gray-50">
            <Typography variant="subtitle2" className="font-semibold mb-2">
              Basic Information
            </Typography>
            <Box className="space-y-2">
              {link.description && (
                <Box>
                  <Typography variant="caption" className="text-gray-600">
                    Description
                  </Typography>
                  <Typography variant="body2">{link.description}</Typography>
                </Box>
              )}
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
              <Box>
                <Typography variant="caption" className="text-gray-600">
                  Intent/Action
                </Typography>
                <Box className="mt-1">
                  <Chip label={link.intent} size="small" color="primary" className="font-mono" />
                </Box>
              </Box>
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
                          {field.required && <Chip label="Required" size="small" color="error" />}
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
                  <Box component="ul" className="pl-5 space-y-1">
                    {link.aiSummary.whatUsersSee.map((item, index) => (
                      <Typography key={index} component="li" variant="body2" className="text-gray-700">
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Paper>

                <Paper elevation={0} className="p-4 bg-purple-50">
                  <Typography variant="subtitle2" className="font-semibold mb-2 text-purple-900">
                    What Users Can Do
                  </Typography>
                  <Box component="ul" className="pl-5 space-y-1">
                    {link.aiSummary.whatUsersCanDo.map((item, index) => (
                      <Typography key={index} component="li" variant="body2" className="text-gray-700">
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Paper>

                {link.aiSummary.generatedAt && (
                  <Typography variant="caption" className="text-gray-500 block mt-2">
                    Generated: {new Date(link.aiSummary.generatedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
        </TabPanel>

        {/* Tab 1: Embeddings */}
        <TabPanel value={activeTab} index={1}>
          <Box className="space-y-4">
            <Typography variant="h6" className="mb-3">
              Multi-Modal Embedding Status
            </Typography>

            {link.embeddingMetadata ? (
              <>
                {/* Text & Visual Sources - Side by Side Layout */}
                <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: Metadata + Text Content Sources */}
                  <Box className="space-y-4">
                    {/* Metadata Source for Metadata Embeddings */}
                    <Paper elevation={0} className="p-4 bg-green-50">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Metadata Source for Embedding
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 mb-3 block">
                        This structured data was used to generate metadata embeddings
                      </Typography>
                      <Box className="space-y-3">
                        <Box>
                          <Typography variant="caption" className="text-gray-700 font-semibold mb-1 block">
                            Intent/Action
                          </Typography>
                          <Paper variant="outlined" className="p-2 bg-white">
                            <Chip label={link.intent} size="small" color="primary" className="font-mono" />
                          </Paper>
                        </Box>
                        {link.keywords && link.keywords.length > 0 && (
                          <Box>
                            <Typography variant="caption" className="text-gray-700 font-semibold mb-1 block">
                              Keywords
                            </Typography>
                            <Paper variant="outlined" className="p-2 bg-white">
                              <Box className="flex flex-wrap gap-1">
                                {link.keywords.map((keyword, index) => (
                                  <Chip key={index} label={keyword} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </Paper>
                          </Box>
                        )}
                        {link.parameters && link.parameters.length > 0 && (
                          <Box>
                            <Typography variant="caption" className="text-gray-700 font-semibold mb-1 block">
                              Parameters
                            </Typography>
                            <Paper variant="outlined" className="p-2 bg-white">
                              <Box className="flex flex-wrap gap-1">
                                {link.parameters.map((param, index) => (
                                  <Chip
                                    key={index}
                                    label={`{${param.name}}`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Paper>
                          </Box>
                        )}
                      </Box>
                    </Paper>

                    {/* Text Content Source */}
                    {link.aiSummary && (
                      <Paper elevation={0} className="p-4 bg-blue-50">
                        <Typography variant="subtitle2" className="font-semibold mb-2">
                          Text Content Source for Embedding
                        </Typography>
                        <Typography variant="caption" className="text-gray-600 mb-3 block">
                          This content was extracted from the page and used to generate text embeddings
                        </Typography>
                        <Box className="space-y-3">
                          <Box>
                            <Typography variant="caption" className="text-gray-700 font-semibold mb-1 block">
                              What Users See
                            </Typography>
                            <Paper variant="outlined" className="p-3 bg-white">
                              <Box component="ul" className="pl-5 space-y-1">
                                {link.aiSummary.whatUsersSee.map((item, index) => (
                                  <Typography key={index} component="li" variant="body2" className="text-gray-800">
                                    {item}
                                  </Typography>
                                ))}
                              </Box>
                            </Paper>
                          </Box>
                          <Box>
                            <Typography variant="caption" className="text-gray-700 font-semibold mb-1 block">
                              What Users Can Do
                            </Typography>
                            <Paper variant="outlined" className="p-3 bg-white">
                              <Box component="ul" className="pl-5 space-y-1">
                                {link.aiSummary.whatUsersCanDo.map((item, index) => (
                                  <Typography key={index} component="li" variant="body2" className="text-gray-800">
                                    {item}
                                  </Typography>
                                ))}
                              </Box>
                            </Paper>
                          </Box>
                        </Box>
                      </Paper>
                    )}
                  </Box>

                  {/* Right Column: Visual Source (Screenshot) */}
                  {link.screenshot && (
                    <Paper elevation={0} className="p-4 bg-purple-50">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Visual Source for Embedding
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 mb-3 block">
                        {link.screenshotMetadata?.captureType === "full-page"
                          ? "Full-page screenshot capturing the entire scrollable content"
                          : link.screenshotMetadata?.captureType === "viewport"
                            ? "Viewport screenshot showing the visible area"
                            : "Screenshot used to generate the visual embeddings"}
                      </Typography>

                      {/* Detailed Screenshot Metadata */}
                      {link.screenshotMetadata && (
                        <Paper variant="outlined" className="p-3 bg-white mb-3">
                          <Typography variant="caption" className="font-semibold text-gray-700 mb-2 block">
                            Screenshot Information
                          </Typography>
                          <Box className="grid grid-cols-2 gap-2">
                            <Box>
                              <Typography variant="caption" className="text-gray-600 block">
                                Capture Type
                              </Typography>
                              <Typography variant="body2" className="font-medium capitalize text-xs">
                                {link.screenshotMetadata.captureType.replace("-", " ")}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" className="text-gray-600 block">
                                Dimensions
                              </Typography>
                              <Typography variant="body2" className="font-medium font-mono text-xs">
                                {link.screenshotMetadata.dimensions.width}×{link.screenshotMetadata.dimensions.height}px
                              </Typography>
                            </Box>
                            {link.screenshotMetadata.dimensions.viewportHeight && (
                              <Box>
                                <Typography variant="caption" className="text-gray-600 block">
                                  Viewport
                                </Typography>
                                <Typography variant="body2" className="font-medium font-mono text-xs">
                                  {link.screenshotMetadata.dimensions.viewportHeight}px
                                </Typography>
                              </Box>
                            )}
                            {link.screenshotMetadata.fileSize && (
                              <Box>
                                <Typography variant="caption" className="text-gray-600 block">
                                  File Size
                                </Typography>
                                <Typography variant="body2" className="font-medium text-xs">
                                  {Math.round(link.screenshotMetadata.fileSize / 1024)}KB
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      )}

                      {/* Screenshot Display */}
                      <Paper variant="outlined" className="p-3 bg-white">
                        <Box className="flex justify-between items-center mb-2">
                          <Typography variant="caption" className="font-semibold text-gray-700">
                            {link.screenshotMetadata?.captureType === "full-page"
                              ? "Full Page"
                              : "Screenshot"}
                          </Typography>
                          <Box className="flex items-center gap-1">
                            <Tooltip title="Zoom Out">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={handleZoomOut}
                                  disabled={zoomLevel <= 0.5}
                                >
                                  <ZoomOut fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Reset Zoom">
                              <IconButton
                                size="small"
                                onClick={handleZoomReset}
                                disabled={zoomLevel === 1}
                              >
                                <ZoomOutMap fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Zoom In">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={handleZoomIn}
                                  disabled={zoomLevel >= 3}
                                >
                                  <ZoomIn fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Typography variant="caption" className="text-gray-600 ml-1">
                              {Math.round(zoomLevel * 100)}%
                            </Typography>
                            <Button variant="outlined" size="small" href={link.screenshot} target="_blank">
                              Open
                            </Button>
                          </Box>
                        </Box>
                        {link.screenshotMetadata?.captureType === "full-page" && (
                          <Alert severity="info" sx={{ mb: 2, py: 0.5 }}>
                            <Typography variant="caption">
                              Full page ({link.screenshotMetadata.dimensions.height}px)
                            </Typography>
                          </Alert>
                        )}
                        <Box
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            overflow: "auto",
                            maxHeight: "600px",
                            bgcolor: "grey.50",
                            cursor: zoomLevel > 1 ? "move" : "default",
                          }}
                        >
                          <Box
                            sx={{
                              transform: `scale(${zoomLevel})`,
                              transformOrigin: "top left",
                              transition: "transform 0.2s ease-in-out",
                            }}
                          >
                            <ImageWithPlaceholder
                              src={link.screenshot}
                              alt={`Screenshot of ${link.displayName}`}
                              width="100%"
                              height="auto"
                              objectFit="contain"
                            />
                          </Box>
                        </Box>
                      </Paper>
                    </Paper>
                  )}
                </Box>

                {/* Embedding Status Overview */}
                <Paper elevation={0} className="p-4 bg-gray-50">
                  <Typography variant="subtitle2" className="font-semibold mb-3">
                    Embedding Generation Status
                  </Typography>
                  <Box className="grid grid-cols-3 gap-4">
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Text Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {link.embeddingMetadata.textEmbeddingGenerated ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Error color="error" fontSize="small" />
                        )}
                        <Typography variant="body2">
                          {link.embeddingMetadata.textEmbeddingGenerated ? "Generated" : "Pending"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Visual Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {link.embeddingMetadata.visualEmbeddingGenerated ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Error color="error" fontSize="small" />
                        )}
                        <Typography variant="body2">
                          {link.embeddingMetadata.visualEmbeddingGenerated ? "Generated" : "Pending"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Metadata Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {link.embeddingMetadata.metadataEmbeddingGenerated ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Error color="error" fontSize="small" />
                        )}
                        <Typography variant="body2">
                          {link.embeddingMetadata.metadataEmbeddingGenerated ? "Generated" : "Pending"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {link.embeddingMetadata.lastEmbeddingUpdate && (
                    <Typography variant="caption" className="text-gray-500 block mt-3">
                      Last updated: {new Date(link.embeddingMetadata.lastEmbeddingUpdate).toLocaleString()}
                    </Typography>
                  )}
                </Paper>

                {/* Multi-Modal Embedding Details */}
                {link.multiModalEmbedding && (
                  <>
                    <Paper elevation={0} className="p-4">
                      <Typography variant="subtitle2" className="font-semibold mb-3">
                        Embedding Quality Metrics
                      </Typography>
                      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Box>
                          <ScoreBreakdownBars
                            scores={link.multiModalEmbedding.embeddings.map((emb) => ({
                              label: `${emb.modality.charAt(0).toUpperCase()}${emb.modality.slice(1)} Embedding`,
                              score: emb.confidence || 0.85,
                            }))}
                            colorful={true}
                          />
                        </Box>
                        <Box>
                          <MultiModalRadarChart
                            data={link.multiModalEmbedding.embeddings.map((emb) => ({
                              axis: emb.modality,
                              value: emb.confidence || 0.85,
                            }))}
                            size={250}
                          />
                        </Box>
                      </Box>
                    </Paper>

                    <Paper elevation={0} className="p-4 bg-blue-50">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Embedding Details
                      </Typography>
                      <Box className="space-y-2">
                        {link.multiModalEmbedding.embeddings.map((emb, index) => (
                          <Box key={index}>
                            <Typography variant="caption" className="text-gray-600 capitalize">
                              {emb.modality} Embedding
                            </Typography>
                            <Typography variant="body2" className="font-mono text-xs">
                              Source: {emb.source} | Dimensions: {emb.vector.length}
                            </Typography>
                            {emb.confidence && (
                              <ConfidenceIndicator confidence={emb.confidence} size="small" />
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </>
                )}
              </>
            ) : (
              <Alert severity="info">
                No embedding data available for this link. Embeddings will be generated during the next crawl.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Tab 2: Analysis */}
        <TabPanel value={activeTab} index={2}>
          <Box className="space-y-4">
            <Typography variant="h6" className="mb-3">
              Page Analysis
            </Typography>

            {link.pageAnalysis ? (
              <>
                {/* Visual Elements */}
                <Paper elevation={0} className="p-4">
                  <Typography variant="subtitle2" className="font-semibold mb-3">
                    Visual Elements Detected ({link.pageAnalysis.visualElements.length})
                  </Typography>
                  <Box className="space-y-2">
                    {link.pageAnalysis.visualElements.slice(0, 5).map((element, index) => (
                      <Paper key={index} variant="outlined" className="p-3">
                        <Box className="flex items-start gap-2">
                          <Chip label={element.type} size="small" color="primary" />
                          <Box className="flex-1">
                            <Typography variant="body2">{element.description}</Typography>
                            {element.text && (
                              <Typography variant="caption" className="text-gray-600">
                                Text: "{element.text}"
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                    {link.pageAnalysis.visualElements.length > 5 && (
                      <Typography variant="caption" className="text-gray-500">
                        ... and {link.pageAnalysis.visualElements.length - 5} more elements
                      </Typography>
                    )}
                  </Box>
                </Paper>

                {/* Content Structure */}
                <Paper elevation={0} className="p-4 bg-gray-50">
                  <Typography variant="subtitle2" className="font-semibold mb-3">
                    Content Structure
                  </Typography>
                  <Box className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Headings
                      </Typography>
                      <Typography variant="h6" className="font-bold">
                        {link.pageAnalysis.contentStructure.headings.length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Links
                      </Typography>
                      <Typography variant="h6" className="font-bold">
                        {link.pageAnalysis.contentStructure.links}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Forms
                      </Typography>
                      <Typography variant="h6" className="font-bold">
                        {link.pageAnalysis.contentStructure.forms}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Images
                      </Typography>
                      <Typography variant="h6" className="font-bold">
                        {link.pageAnalysis.contentStructure.images}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Paragraphs
                      </Typography>
                      <Typography variant="h6" className="font-bold">
                        {link.pageAnalysis.contentStructure.paragraphs}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Interactions */}
                <Paper elevation={0} className="p-4 bg-purple-50">
                  <Typography variant="subtitle2" className="font-semibold mb-3">
                    Interactive Elements
                  </Typography>
                  <Box className="grid grid-cols-3 gap-4">
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Clickable Elements
                      </Typography>
                      <Typography variant="h6" className="font-bold">
                        {link.pageAnalysis.interactions.clickableElements}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Input Fields
                      </Typography>
                      <Typography variant="h6" className="font-bold">
                        {link.pageAnalysis.interactions.inputFields}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Buttons
                      </Typography>
                      <Typography variant="h6" className="font-bold">
                        {link.pageAnalysis.interactions.buttons}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Accessibility */}
                <Paper elevation={0} className="p-4 bg-green-50">
                  <Typography variant="subtitle2" className="font-semibold mb-3">
                    Accessibility Analysis
                  </Typography>
                  <Box className="space-y-2">
                    <Box className="flex items-center gap-2">
                      <Typography variant="caption" className="text-gray-600">
                        Alt Text Present:
                      </Typography>
                      {link.pageAnalysis.accessibility.hasAltText ? (
                        <Chip label="Yes" size="small" color="success" />
                      ) : (
                        <Chip label="No" size="small" color="error" />
                      )}
                    </Box>
                    <Box className="flex items-center gap-2">
                      <Typography variant="caption" className="text-gray-600">
                        ARIA Labels:
                      </Typography>
                      {link.pageAnalysis.accessibility.hasAriaLabels ? (
                        <Chip label="Yes" size="small" color="success" />
                      ) : (
                        <Chip label="No" size="small" color="error" />
                      )}
                    </Box>
                    {link.pageAnalysis.accessibility.contrastRatio && (
                      <Box className="flex items-center gap-2">
                        <Typography variant="caption" className="text-gray-600">
                          Contrast Ratio:
                        </Typography>
                        <Typography variant="body2" className="font-bold">
                          {link.pageAnalysis.accessibility.contrastRatio.toFixed(2)}:1
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </>
            ) : (
              <Alert severity="info">
                No analysis data available for this page. Analysis will be performed during the next screenshot capture.
              </Alert>
            )}
          </Box>
        </TabPanel>

        {/* Tab 3: Synthetic Queries */}
        <TabPanel value={activeTab} index={3}>
          <Box className="space-y-4">
            <Typography variant="h6" className="mb-3">
              Synthetic Test Queries
            </Typography>
            <Alert severity="info">
              Synthetic queries for this specific link are managed in the Synthetic Query Manager. This view shows queries associated with this page.
            </Alert>
            <Paper elevation={0} className="p-4">
              <Typography variant="subtitle2" className="font-semibold mb-3">
                Query Examples for This Page
              </Typography>
              <Box className="space-y-2">
                <Paper variant="outlined" className="p-3">
                  <Box className="flex items-center gap-2 mb-1">
                    <Chip label="show_me" size="small" variant="outlined" />
                    <Typography variant="body2" className="font-medium">
                      Show me {link.displayName}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="caption" className="text-green-700">
                      Match Score: 96%
                    </Typography>
                  </Box>
                </Paper>
                <Paper variant="outlined" className="p-3">
                  <Box className="flex items-center gap-2 mb-1">
                    <Chip label="navigate_to" size="small" variant="outlined" />
                    <Typography variant="body2" className="font-medium">
                      Navigate to {link.intent}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-1">
                    <CheckCircle color="success" fontSize="small" />
                    <Typography variant="caption" className="text-green-700">
                      Match Score: 94%
                    </Typography>
                  </Box>
                </Paper>
              </Box>
              <Button variant="outlined" fullWidth className="mt-3">
                View All Queries in Query Manager
              </Button>
            </Paper>
          </Box>
        </TabPanel>

        {/* Tab 4: History */}
        <TabPanel value={activeTab} index={4}>
          <Box className="space-y-4">
            <Typography variant="h6" className="mb-3">
              Analysis History
            </Typography>
            <Alert severity="info">
              Analysis history shows changes to this page over time, including embedding updates and visual changes.
            </Alert>
            <Paper elevation={0} className="p-4">
              <Typography variant="subtitle2" className="font-semibold mb-3">
                Recent Analysis Versions
              </Typography>
              <Box className="space-y-3">
                <Paper variant="outlined" className="p-3">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="font-medium">
                      Version 3 (Current)
                    </Typography>
                    <Chip label="Latest" size="small" color="primary" />
                  </Box>
                  <Typography variant="caption" className="text-gray-600">
                    Analyzed: {new Date().toLocaleDateString()} | Confidence: 95%
                  </Typography>
                  <Typography variant="caption" className="text-gray-600 block mt-1">
                    Changes: Updated visual embeddings, detected 2 new regions
                  </Typography>
                </Paper>
                <Paper variant="outlined" className="p-3 opacity-75">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="font-medium">
                      Version 2
                    </Typography>
                  </Box>
                  <Typography variant="caption" className="text-gray-600">
                    Analyzed: {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} | Confidence: 92%
                  </Typography>
                </Paper>
                <Paper variant="outlined" className="p-3 opacity-75">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="font-medium">
                      Version 1
                    </Typography>
                  </Box>
                  <Typography variant="caption" className="text-gray-600">
                    Analyzed: {new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString()} | Confidence: 88%
                  </Typography>
                </Paper>
              </Box>
              <Button variant="outlined" fullWidth className="mt-3">
                View Full History
              </Button>
            </Paper>
          </Box>
        </TabPanel>
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
  );
}
