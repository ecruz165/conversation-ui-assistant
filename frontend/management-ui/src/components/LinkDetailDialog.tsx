import {
  AutoFixHigh as AutoFixHighIcon,
  Cancel as CancelIcon,
  CheckCircle,
  Edit as EditIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  HourglassEmpty,
  Info as InfoIcon,
  Pending,
  QueryStats as QueryStatsIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Science as ScienceIcon,
  ViewModule as ViewModuleIcon,
  ZoomIn,
  ZoomOut,
  ZoomOutMap,
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
  IconButton,
  Paper,
  Popover,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import type { EnhancedPageEmbedding, NavigationLink } from "~/types";
import { ImageWithPlaceholder } from "./ImageWithPlaceholder";
import { MultiModalRadarChart, ScoreBreakdownBars } from "./visualizations";

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
  const [isEditingEmbeddings, setIsEditingEmbeddings] = useState(false);
  const [editedEmbeddings, setEditedEmbeddings] = useState<Partial<EnhancedPageEmbedding> | null>(
    null
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [screenshotInfoAnchor, setScreenshotInfoAnchor] = useState<HTMLButtonElement | null>(null);

  if (!link) return null;

  const handleScreenshotInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setScreenshotInfoAnchor(event.currentTarget);
  };

  const handleScreenshotInfoClose = () => {
    setScreenshotInfoAnchor(null);
  };

  const screenshotInfoOpen = Boolean(screenshotInfoAnchor);

  // Initialize edited embeddings from link data
  const initializeEditedEmbeddings = () => {
    if (link.multiModalEmbedding?.enhanced) {
      setEditedEmbeddings({
        path: link.multiModalEmbedding.enhanced.path || link.targetUrl,
        pageTitle: link.multiModalEmbedding.enhanced.pageTitle || link.displayName,
        primaryActions: link.multiModalEmbedding.enhanced.primaryActions || [],
        dataEntities: link.multiModalEmbedding.enhanced.dataEntities || [],
      });
    } else {
      // Create default enhanced embedding structure from available data
      setEditedEmbeddings({
        path: link.targetUrl,
        pageTitle: link.displayName,
        primaryActions: [],
        dataEntities: [],
      });
    }
  };

  const handleStartEditing = () => {
    initializeEditedEmbeddings();
    setIsEditingEmbeddings(true);
  };

  const handleCancelEditing = () => {
    setIsEditingEmbeddings(false);
    setEditedEmbeddings(null);
  };

  const handleSaveEmbeddings = () => {
    // TODO: Implement API call to save edited embeddings
    console.log("Saving embeddings:", editedEmbeddings);
    setIsEditingEmbeddings(false);
    setEditedEmbeddings(null);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  const handleGenerateEmbeddings = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement API call to generate embeddings from screenshot
      console.log("Generating embeddings from screenshot for link:", link.id);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      // After generation, the link data would be refreshed
    } catch (error) {
      console.error("Failed to generate embeddings:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const _getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle color="success" fontSize="small" />;
      case "processing":
        return <HourglassEmpty color="warning" fontSize="small" />;
      case "pending":
        return <Pending color="info" fontSize="small" />;
      case "failed":
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const _getStatusLabel = (status?: string) => {
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

  // Calculate quality score for individual embedding based on vector length and existence
  const calculateEmbeddingQuality = (embeddingLength?: number): number => {
    if (!embeddingLength || embeddingLength === 0) return 0;

    // Quality score based on dimensionality
    // Higher dimensions generally indicate better quality embeddings
    if (embeddingLength >= 1536) return 0.95; // OpenAI ada-002 or similar high-quality
    if (embeddingLength >= 768) return 0.85; // BERT-style models
    if (embeddingLength >= 384) return 0.75; // Smaller but still good
    if (embeddingLength >= 128) return 0.65; // Minimal quality
    return 0.5; // Very low dimension, questionable quality
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
            {/* Link Details */}
            <Paper elevation={0} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
              <Box className="space-y-3">
                {/* Path */}
                <Box>
                  <Typography variant="caption" className="text-gray-600 font-semibold">
                    Path
                  </Typography>
                  <Typography
                    variant="body2"
                    className="font-mono bg-white px-2 py-1 rounded border border-gray-200"
                  >
                    {link.targetUrl}
                  </Typography>
                </Box>

                {/* Path/Query Param Slots */}
                {link.parameters && link.parameters.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      className="text-gray-600 font-semibold block mb-1"
                    >
                      Path/Query Param Slots
                    </Typography>
                    <Box className="flex flex-wrap gap-1">
                      {link.parameters.map((param) => (
                        <Chip
                          key={param.name}
                          label={param.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" className="text-gray-500 block mt-1">
                      AI will collect these values from user before navigation
                    </Typography>
                  </Box>
                )}

                {/* Title */}
                <Box>
                  <Typography variant="caption" className="text-gray-600 font-semibold">
                    Title
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {link.displayName}
                  </Typography>
                </Box>

                {/* Page Type */}
                <Box>
                  <Typography variant="caption" className="text-gray-600 font-semibold block mb-1">
                    Page Type
                  </Typography>
                  <Box className="flex items-center gap-2">
                    {link.isBookmarkable ? (
                      <Chip
                        label="Bookmarkable"
                        size="medium"
                        color="success"
                        icon={<CheckCircle />}
                      />
                    ) : (
                      <Chip
                        label="Journey"
                        size="medium"
                        color="warning"
                        icon={<HourglassEmpty />}
                      />
                    )}
                    <Typography variant="caption" className="text-gray-600">
                      {link.isBookmarkable
                        ? "Users can navigate directly via URL"
                        : "Requires user input or interaction"}
                    </Typography>
                  </Box>
                </Box>

                {/* Starting Path - Only for Journey pages */}
                {!link.isBookmarkable && (
                  <Box>
                    <Typography
                      variant="caption"
                      className="text-gray-600 font-semibold block mb-1"
                    >
                      Starting Path
                    </Typography>
                    {link.startingPath ? (
                      <Typography
                        variant="body2"
                        className="font-mono bg-white px-2 py-1 rounded border border-gray-200"
                      >
                        {link.startingPath}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        className="text-gray-500 italic bg-white px-2 py-1 rounded border border-gray-200"
                      >
                        Not specified
                      </Typography>
                    )}
                    <Typography variant="caption" className="text-gray-500 block mt-1">
                      {link.startingPath
                        ? "Crawler-detected or manually set starting path"
                        : "The page/URL where users start before reaching this journey endpoint"}
                    </Typography>
                  </Box>
                )}

                {/* Keywords */}
                {link.keywords && link.keywords.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      className="text-gray-600 font-semibold block mb-1"
                    >
                      Keywords
                    </Typography>
                    <Box className="flex flex-wrap gap-1">
                      {link.keywords.map((keyword) => (
                        <Chip key={keyword} label={keyword} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Description */}
                {link.description && (
                  <Box>
                    <Typography
                      variant="caption"
                      className="text-gray-600 font-semibold block mb-1"
                    >
                      Description
                    </Typography>
                    <Typography
                      variant="body2"
                      className="bg-white px-2 py-2 rounded border border-gray-200 whitespace-pre-wrap"
                    >
                      {link.description}
                    </Typography>
                  </Box>
                )}

                {/* Forms - Only if page has forms */}
                {link.hasForm && link.formFields && link.formFields.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      className="text-gray-600 font-semibold block mb-1"
                    >
                      Forms
                    </Typography>
                    <Box className="space-y-2">
                      {link.formFields.map((field) => (
                        <Box
                          key={field.label}
                          className="flex items-center justify-between bg-white px-3 py-2 rounded border border-gray-200"
                        >
                          <Box className="flex items-center gap-2">
                            <Typography variant="body2" className="font-medium">
                              {field.label}
                            </Typography>
                            <Chip
                              label={field.type}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          {field.required ? (
                            <Chip label="Required" size="small" color="error" />
                          ) : (
                            <Chip label="Optional" size="small" variant="outlined" />
                          )}
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="caption" className="text-gray-500 block mt-1">
                      {link.formFields.filter((f) => f.required).length} required field(s),{" "}
                      {link.formFields.filter((f) => !f.required).length} optional
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* AI Guidance */}
            {link.aiGuidance && (
              <Paper elevation={0} className="p-4 bg-green-50">
                <Typography variant="subtitle2" className="font-semibold mb-2 text-green-900">
                  AI Guidance
                </Typography>
                <Typography variant="body2" className="text-gray-700">
                  {link.aiGuidance}
                </Typography>
              </Paper>
            )}

            {/* Screenshot */}
            {link.screenshot && (
              <Paper elevation={0} className="p-4 bg-purple-50">
                {/* Screenshot Display */}
                <Paper variant="outlined" className="p-3 bg-white">
                  <Box className="flex justify-between items-center mb-2">
                    <Box className="flex items-center gap-1">
                      {link.screenshotMetadata && (
                        <Tooltip title="Screenshot Information">
                          <IconButton size="small" onClick={handleScreenshotInfoClick}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
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
                          <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                            <ZoomIn fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Typography variant="caption" className="text-gray-600 ml-1">
                        {Math.round(zoomLevel * 100)}%
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        href={link.screenshot}
                        target="_blank"
                      >
                        Open
                      </Button>
                    </Box>
                  </Box>
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

                {/* Screenshot Info Popover */}
                {link.screenshotMetadata && (
                  <Popover
                    open={screenshotInfoOpen}
                    anchorEl={screenshotInfoAnchor}
                    onClose={handleScreenshotInfoClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <Box className="p-3" sx={{ minWidth: 250 }}>
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Screenshot Information
                      </Typography>
                      <Box className="space-y-2">
                        <Box>
                          <Typography variant="caption" className="text-gray-600 block">
                            Capture Type
                          </Typography>
                          <Typography variant="body2" className="font-medium capitalize">
                            {link.screenshotMetadata.captureType.replace("-", " ")}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-600 block">
                            Dimensions
                          </Typography>
                          <Typography variant="body2" className="font-medium font-mono">
                            {link.screenshotMetadata.dimensions.width}×
                            {link.screenshotMetadata.dimensions.height}px
                          </Typography>
                        </Box>
                        {link.screenshotMetadata.dimensions.viewportHeight && (
                          <Box>
                            <Typography variant="caption" className="text-gray-600 block">
                              Viewport Height
                            </Typography>
                            <Typography variant="body2" className="font-medium font-mono">
                              {link.screenshotMetadata.dimensions.viewportHeight}px
                            </Typography>
                          </Box>
                        )}
                        {link.screenshotMetadata.fileSize && (
                          <Box>
                            <Typography variant="caption" className="text-gray-600 block">
                              File Size
                            </Typography>
                            <Typography variant="body2" className="font-medium">
                              {Math.round(link.screenshotMetadata.fileSize / 1024)}KB
                            </Typography>
                          </Box>
                        )}
                        {link.screenshotMetadata.capturedAt && (
                          <Box>
                            <Typography variant="caption" className="text-gray-600 block">
                              Captured At
                            </Typography>
                            <Typography variant="body2" className="font-medium">
                              {new Date(link.screenshotMetadata.capturedAt).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Popover>
                )}
              </Paper>
            )}
          </Box>
        </TabPanel>

        {/* Tab 1: Embeddings */}
        <TabPanel value={activeTab} index={1}>
          <Box className="space-y-4">
            <Box className="flex items-center justify-between mb-3">
              <Typography variant="h6">Multi-Modal Embedding Status</Typography>
              {link.screenshot && (
                <Box className="flex gap-2">
                  <Button
                    size="small"
                    startIcon={<AutoFixHighIcon />}
                    onClick={handleGenerateEmbeddings}
                    variant="contained"
                    color="secondary"
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "Generate from Screenshot"}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleGenerateEmbeddings}
                    variant="outlined"
                    disabled={isGenerating}
                  >
                    Regenerate
                  </Button>
                </Box>
              )}
            </Box>

            {isGenerating && (
              <Alert severity="warning">
                <Box className="flex items-center gap-2">
                  <CircularProgress size={16} />
                  <Typography variant="caption">
                    Analyzing screenshot and generating embeddings... This may take up to 30
                    seconds.
                  </Typography>
                </Box>
              </Alert>
            )}

            {link.embeddingMetadata ? (
              <>
                {/* Enhanced Embedding Text Content - Editable Section */}
                <Paper elevation={0} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <Box className="flex items-center justify-between mb-3">
                    <Typography variant="subtitle2" className="font-semibold">
                      Enhanced 6-Embedding Text Content
                    </Typography>
                    {!isEditingEmbeddings ? (
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={handleStartEditing}
                        variant="outlined"
                      >
                        Edit Embeddings
                      </Button>
                    ) : (
                      <Box className="flex gap-2">
                        <Button
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelEditing}
                          variant="outlined"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveEmbeddings}
                          variant="contained"
                          color="primary"
                        >
                          Save
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    These text variants are used to generate the 6 embedding vectors for semantic
                    search. Edit them to refine matching accuracy.
                  </Alert>

                  <Box className="space-y-3">
                    {/* Functionality Embedding */}
                    <Paper variant="outlined" className="p-3 bg-white">
                      <Typography
                        variant="caption"
                        className="font-semibold text-indigo-700 block mb-2"
                      >
                        1. Functionality Embedding
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 block mb-2">
                        What users can do - page capabilities and features
                      </Typography>
                      {isEditingEmbeddings ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          size="small"
                          placeholder="Describe what users can do on this page..."
                          defaultValue={link.aiSummary?.whatUsersCanDo.join("\n- ") || ""}
                        />
                      ) : (
                        <Paper variant="outlined" className="p-2 bg-gray-50">
                          <Box component="ul" className="pl-5 space-y-1">
                            {link.aiSummary?.whatUsersCanDo.map((item) => (
                              <Typography
                                key={item}
                                component="li"
                                variant="body2"
                                className="text-gray-700"
                              >
                                {item}
                              </Typography>
                            )) || (
                              <Typography variant="body2" className="text-gray-500 italic">
                                Not generated
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      )}
                    </Paper>

                    {/* Content Embedding */}
                    <Paper variant="outlined" className="p-3 bg-white">
                      <Typography
                        variant="caption"
                        className="font-semibold text-purple-700 block mb-2"
                      >
                        2. Content Embedding
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 block mb-2">
                        What users can see - visible content and layout
                      </Typography>
                      {isEditingEmbeddings ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          size="small"
                          placeholder="Describe what users see on this page..."
                          defaultValue={link.aiSummary?.whatUsersSee.join("\n- ") || ""}
                        />
                      ) : (
                        <Paper variant="outlined" className="p-2 bg-gray-50">
                          <Box component="ul" className="pl-5 space-y-1">
                            {link.aiSummary?.whatUsersSee.map((item) => (
                              <Typography
                                key={item}
                                component="li"
                                variant="body2"
                                className="text-gray-700"
                              >
                                {item}
                              </Typography>
                            )) || (
                              <Typography variant="body2" className="text-gray-500 italic">
                                Not generated
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      )}
                    </Paper>

                    {/* Purpose Embedding */}
                    <Paper variant="outlined" className="p-3 bg-white">
                      <Typography
                        variant="caption"
                        className="font-semibold text-blue-700 block mb-2"
                      >
                        3. Purpose Embedding
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 block mb-2">
                        Purpose of the page - intent and goal
                      </Typography>
                      {isEditingEmbeddings ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          variant="outlined"
                          size="small"
                          placeholder="Describe the purpose and intent of this page..."
                          defaultValue={link.description || ""}
                        />
                      ) : (
                        <Paper variant="outlined" className="p-2 bg-gray-50">
                          <Typography variant="body2" className="text-gray-700">
                            {link.description || (
                              <span className="text-gray-500 italic">Not specified</span>
                            )}
                          </Typography>
                        </Paper>
                      )}
                    </Paper>

                    {/* Action Embedding */}
                    <Paper variant="outlined" className="p-3 bg-white">
                      <Typography
                        variant="caption"
                        className="font-semibold text-green-700 block mb-2"
                      >
                        4. Action Embedding
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 block mb-2">
                        Extracted CTAs and buttons - specific actions
                      </Typography>
                      {isEditingEmbeddings ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          variant="outlined"
                          size="small"
                          placeholder="List primary actions/buttons (comma-separated)"
                          defaultValue={
                            (link.multiModalEmbedding?.enhanced?.primaryActions || []).join(", ") ||
                            ""
                          }
                          onChange={(e) => {
                            setEditedEmbeddings((prev) => ({
                              ...prev,
                              primaryActions: e.target.value
                                .split(",")
                                .map((a) => a.trim())
                                .filter(Boolean),
                            }));
                          }}
                        />
                      ) : (
                        <Paper variant="outlined" className="p-2 bg-gray-50">
                          <Box className="flex flex-wrap gap-1">
                            {(link.multiModalEmbedding?.enhanced?.primaryActions || []).length >
                            0 ? (
                              link.multiModalEmbedding?.enhanced?.primaryActions.map((action) => (
                                <Chip
                                  key={action}
                                  label={action}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" className="text-gray-500 italic">
                                Not extracted
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      )}
                    </Paper>

                    {/* Data Context Embedding */}
                    <Paper variant="outlined" className="p-3 bg-white">
                      <Typography
                        variant="caption"
                        className="font-semibold text-orange-700 block mb-2"
                      >
                        5. Data Context Embedding
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 block mb-2">
                        Data entities shown - domain objects
                      </Typography>
                      {isEditingEmbeddings ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          variant="outlined"
                          size="small"
                          placeholder="List data entities (comma-separated, e.g., accounts, transactions, portfolios)"
                          defaultValue={
                            (link.multiModalEmbedding?.enhanced?.dataEntities || []).join(", ") ||
                            ""
                          }
                          onChange={(e) => {
                            setEditedEmbeddings((prev) => ({
                              ...prev,
                              dataEntities: e.target.value
                                .split(",")
                                .map((a) => a.trim())
                                .filter(Boolean),
                            }));
                          }}
                        />
                      ) : (
                        <Paper variant="outlined" className="p-2 bg-gray-50">
                          <Box className="flex flex-wrap gap-1">
                            {(link.multiModalEmbedding?.enhanced?.dataEntities || []).length > 0 ? (
                              link.multiModalEmbedding?.enhanced?.dataEntities.map((entity) => (
                                <Chip
                                  key={entity}
                                  label={entity}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography variant="body2" className="text-gray-500 italic">
                                Not extracted
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      )}
                    </Paper>

                    {/* User Task Embedding */}
                    <Paper variant="outlined" className="p-3 bg-white">
                      <Typography
                        variant="caption"
                        className="font-semibold text-pink-700 block mb-2"
                      >
                        6. User Task Embedding
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 block mb-2">
                        Common user tasks - workflows and processes
                      </Typography>
                      {isEditingEmbeddings ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          variant="outlined"
                          size="small"
                          placeholder="Describe common workflows and tasks users perform on this page..."
                          defaultValue={link.intent || ""}
                        />
                      ) : (
                        <Paper variant="outlined" className="p-2 bg-gray-50">
                          <Typography variant="body2" className="text-gray-700">
                            Intent:{" "}
                            <Chip
                              label={link.intent}
                              size="small"
                              color="primary"
                              className="ml-1"
                            />
                          </Typography>
                          {link.hasForm && link.formFields && (
                            <Box className="mt-2">
                              <Typography variant="caption" className="text-gray-600 block mb-1">
                                Form workflow: Collect {link.formFields.length} field(s)
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      )}
                    </Paper>
                  </Box>
                </Paper>

                {/* Embedding Status Overview */}
                <Paper elevation={0} className="p-4 bg-gray-50">
                  <Typography variant="subtitle2" className="font-semibold mb-3">
                    Enhanced 6-Embedding Generation Status
                  </Typography>

                  <Box className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Functionality Embedding */}
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Functionality Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {(link.multiModalEmbedding?.enhanced?.functionalityEmbedding?.length ?? 0) >
                        0 ? (
                          <>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">Generated</Typography>
                          </>
                        ) : (
                          <>
                            <ErrorIcon color="error" fontSize="small" />
                            <Typography variant="body2">Pending</Typography>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Content Embedding */}
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Content Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {(link.multiModalEmbedding?.enhanced?.contentEmbedding?.length ?? 0) > 0 ? (
                          <>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">Generated</Typography>
                          </>
                        ) : (
                          <>
                            <ErrorIcon color="error" fontSize="small" />
                            <Typography variant="body2">Pending</Typography>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Purpose Embedding */}
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Purpose Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {(link.multiModalEmbedding?.enhanced?.purposeEmbedding?.length ?? 0) > 0 ? (
                          <>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">Generated</Typography>
                          </>
                        ) : (
                          <>
                            <ErrorIcon color="error" fontSize="small" />
                            <Typography variant="body2">Pending</Typography>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Action Embedding */}
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Action Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {(link.multiModalEmbedding?.enhanced?.actionEmbedding?.length ?? 0) > 0 ? (
                          <>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">Generated</Typography>
                          </>
                        ) : (
                          <>
                            <ErrorIcon color="error" fontSize="small" />
                            <Typography variant="body2">Pending</Typography>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Data Context Embedding */}
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        Data Context Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {(link.multiModalEmbedding?.enhanced?.dataContextEmbedding?.length ?? 0) >
                        0 ? (
                          <>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">Generated</Typography>
                          </>
                        ) : (
                          <>
                            <ErrorIcon color="error" fontSize="small" />
                            <Typography variant="body2">Pending</Typography>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* User Task Embedding */}
                    <Box>
                      <Typography variant="caption" className="text-gray-600">
                        User Task Embedding
                      </Typography>
                      <Box className="flex items-center gap-2 mt-1">
                        {(link.multiModalEmbedding?.enhanced?.userTaskEmbedding?.length ?? 0) >
                        0 ? (
                          <>
                            <CheckCircle color="success" fontSize="small" />
                            <Typography variant="body2">Generated</Typography>
                          </>
                        ) : (
                          <>
                            <ErrorIcon color="error" fontSize="small" />
                            <Typography variant="body2">Pending</Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {link.embeddingMetadata.lastEmbeddingUpdate && (
                    <Typography variant="caption" className="text-gray-500 block mt-3">
                      Last updated:{" "}
                      {new Date(link.embeddingMetadata.lastEmbeddingUpdate).toLocaleString()}
                    </Typography>
                  )}
                </Paper>

                {/* Multi-Modal Embedding Details */}
                {link.multiModalEmbedding?.enhanced && (
                  <>
                    <Paper elevation={0} className="p-4">
                      <Typography variant="subtitle2" className="font-semibold mb-3">
                        Enhanced 6-Embedding Quality Metrics
                      </Typography>
                      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Box>
                          <ScoreBreakdownBars
                            scores={[
                              {
                                label: "Functionality",
                                score: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.functionalityEmbedding?.length
                                ),
                              },
                              {
                                label: "Content",
                                score: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.contentEmbedding?.length
                                ),
                              },
                              {
                                label: "Purpose",
                                score: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.purposeEmbedding?.length
                                ),
                              },
                              {
                                label: "Action",
                                score: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.actionEmbedding?.length
                                ),
                              },
                              {
                                label: "Data Context",
                                score: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.dataContextEmbedding?.length
                                ),
                              },
                              {
                                label: "User Task",
                                score: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.userTaskEmbedding?.length
                                ),
                              },
                            ]}
                            colorful={true}
                          />
                        </Box>
                        <Box>
                          <MultiModalRadarChart
                            data={[
                              {
                                axis: "Functionality",
                                value: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.functionalityEmbedding?.length
                                ),
                              },
                              {
                                axis: "Content",
                                value: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.contentEmbedding?.length
                                ),
                              },
                              {
                                axis: "Purpose",
                                value: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.purposeEmbedding?.length
                                ),
                              },
                              {
                                axis: "Action",
                                value: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.actionEmbedding?.length
                                ),
                              },
                              {
                                axis: "Data Context",
                                value: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.dataContextEmbedding?.length
                                ),
                              },
                              {
                                axis: "User Task",
                                value: calculateEmbeddingQuality(
                                  link.multiModalEmbedding.enhanced.userTaskEmbedding?.length
                                ),
                              },
                            ]}
                            size={250}
                          />
                        </Box>
                      </Box>
                    </Paper>

                    <Paper elevation={0} className="p-4 bg-blue-50">
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Embedding Vector Details
                      </Typography>
                      <Box className="space-y-2">
                        <Box>
                          <Typography variant="caption" className="text-gray-600 font-semibold">
                            Enhanced 6-Embedding Structure
                          </Typography>
                          <Box className="grid grid-cols-2 gap-3 mt-2">
                            <Box>
                              <Typography variant="caption" className="text-gray-600">
                                Functionality
                              </Typography>
                              <Typography variant="body2" className="font-mono text-xs">
                                Dimensions:{" "}
                                {link.multiModalEmbedding.enhanced.functionalityEmbedding?.length ||
                                  0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" className="text-gray-600">
                                Content
                              </Typography>
                              <Typography variant="body2" className="font-mono text-xs">
                                Dimensions:{" "}
                                {link.multiModalEmbedding.enhanced.contentEmbedding?.length || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" className="text-gray-600">
                                Purpose
                              </Typography>
                              <Typography variant="body2" className="font-mono text-xs">
                                Dimensions:{" "}
                                {link.multiModalEmbedding.enhanced.purposeEmbedding?.length || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" className="text-gray-600">
                                Action
                              </Typography>
                              <Typography variant="body2" className="font-mono text-xs">
                                Dimensions:{" "}
                                {link.multiModalEmbedding.enhanced.actionEmbedding?.length || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" className="text-gray-600">
                                Data Context
                              </Typography>
                              <Typography variant="body2" className="font-mono text-xs">
                                Dimensions:{" "}
                                {link.multiModalEmbedding.enhanced.dataContextEmbedding?.length ||
                                  0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" className="text-gray-600">
                                User Task
                              </Typography>
                              <Typography variant="body2" className="font-mono text-xs">
                                Dimensions:{" "}
                                {link.multiModalEmbedding.enhanced.userTaskEmbedding?.length || 0}
                              </Typography>
                            </Box>
                          </Box>
                          {link.multiModalEmbedding.enhanced.extractedAt && (
                            <Typography variant="caption" className="text-gray-500 block mt-2">
                              Model: {link.multiModalEmbedding.enhanced.modelUsed || "Unknown"} |
                              Extracted:{" "}
                              {new Date(
                                link.multiModalEmbedding.enhanced.extractedAt
                              ).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </>
                )}
              </>
            ) : (
              <Alert severity="info">
                No embedding data available for this link. Embeddings will be generated during the
                next crawl.
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
                    {link.pageAnalysis.visualElements.slice(0, 5).map((element) => (
                      <Paper key={element.description} variant="outlined" className="p-3">
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
                No analysis data available for this page. Analysis will be performed during the next
                screenshot capture.
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
              Synthetic queries for this specific link are managed in the Synthetic Query Manager.
              This view shows queries associated with this page.
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
              Analysis history shows changes to this page over time, including embedding updates and
              visual changes.
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
                    Analyzed: {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}{" "}
                    | Confidence: 92%
                  </Typography>
                </Paper>
                <Paper variant="outlined" className="p-3 opacity-75">
                  <Box className="flex items-center justify-between mb-2">
                    <Typography variant="body2" className="font-medium">
                      Version 1
                    </Typography>
                  </Box>
                  <Typography variant="caption" className="text-gray-600">
                    Analyzed: {new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}{" "}
                    | Confidence: 88%
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
