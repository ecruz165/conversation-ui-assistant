import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Error as ErrorIcon,
  ImageSearch as ImageSearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "~/components/Layout";
import { PageTabs } from "~/components/PageTabs";
import { PageTitle } from "~/components/PageTitle";
import { useAnalysisJobStatus, useUploadScreenshot } from "~/hooks/useScreenshotAnalysis";
import { useWebsite } from "~/hooks/useWebsite";
import type { PageRegion } from "~/types";

const tabs = [
  { label: "Overview", value: "overview", path: "/website/overview" },
  { label: "Crawl Management", value: "crawl-management", path: "/website/crawl-management" },
  { label: "Link Management", value: "link-management", path: "/website/link-management" },
  { label: "Embeddings Tester", value: "embeddings-tester", path: "/website/embeddings-tester" },
  {
    label: "Screenshot Analysis",
    value: "screenshot-analysis",
    path: "/website/screenshot-analysis",
  },
  { label: "Widget Code", value: "widget-code", path: "/website/widget-code" },
];

// Region Overlay Component - highlights detected regions on screenshot
interface RegionOverlayProps {
  regions: PageRegion[];
  imageWidth: number;
  imageHeight: number;
  onRegionClick?: (region: PageRegion) => void;
}

function _RegionOverlay({ regions, imageWidth, imageHeight, onRegionClick }: RegionOverlayProps) {
  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      {regions.map((region) => (
        <Box
          key={region.id}
          onClick={() => onRegionClick?.(region)}
          sx={{
            position: "absolute",
            left: `${(region.boundingBox.x / imageWidth) * 100}%`,
            top: `${(region.boundingBox.y / imageHeight) * 100}%`,
            width: `${(region.boundingBox.width / imageWidth) * 100}%`,
            height: `${(region.boundingBox.height / imageHeight) * 100}%`,
            border: "2px solid",
            borderColor: region.type === "form" ? "#ff9800" : "#1976d2",
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.3)",
              borderWidth: "3px",
            },
          }}
          title={region.description || region.type}
        >
          <Chip
            label={region.type}
            size="small"
            sx={{
              position: "absolute",
              top: -12,
              left: 0,
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        </Box>
      ))}
    </Box>
  );
}

// File Upload Zone Component
interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

function FileUploadZone({ onFileSelect, disabled }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      onFileSelect(imageFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Paper
      elevation={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        p: 6,
        border: "2px dashed",
        borderColor: isDragging ? "primary.main" : "grey.300",
        backgroundColor: isDragging ? "primary.50" : "grey.50",
        transition: "all 0.2s",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
        disabled={disabled}
      />
      <Box className="text-center">
        <CloudUploadIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" className="text-gray-700 mb-2">
          {isDragging ? "Drop screenshot here" : "Drag & drop a screenshot"}
        </Typography>
        <Typography variant="body2" className="text-gray-500 mb-3">
          or click to browse files
        </Typography>
        <Typography variant="caption" className="text-gray-400">
          Supported formats: PNG, JPG, WebP
        </Typography>
      </Box>
    </Paper>
  );
}

export function ScreenshotAnalysis() {
  const websiteId = "mock-website-1";
  const { data: website, isLoading: websiteLoading } = useWebsite(websiteId);
  const navigate = useNavigate();

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<"gpt-4-vision" | "claude-3-opus">(
    "gpt-4-vision"
  );
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [_selectedRegion, setSelectedRegion] = useState<PageRegion | null>(null);

  // Hooks
  const uploadMutation = useUploadScreenshot(websiteId);
  const { data: analysisResult, isLoading: isAnalyzing } = useAnalysisJobStatus(
    websiteId,
    analysisId
  );

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setAnalysisId(null);
    setSelectedRegion(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Cleanup old URL
    return () => URL.revokeObjectURL(url);
  }, []);

  // Handle screenshot upload and analysis
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      uploadMutation.mutate(
        {
          websiteId,
          screenshotBase64: base64,
          analysisOptions: {
            generateEmbeddings: true,
            detectRegions: true,
            extractText: true,
            analyzeAccessibility: false,
            modelPreference: selectedModel,
          },
        },
        {
          onSuccess: (result) => {
            setAnalysisId(result.analysisId);
          },
        }
      );
    };
    reader.readAsDataURL(selectedFile);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClose = () => {
    navigate("/");
  };

  if (websiteLoading) {
    return (
      <Layout>
        <Box className="flex items-center justify-center min-h-screen">
          <Typography>Loading...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!website) {
    return (
      <Layout>
        <Box className="flex items-center justify-center min-h-screen">
          <Typography>Website not found</Typography>
        </Box>
      </Layout>
    );
  }

  const isUploading = uploadMutation.isPending;
  const hasError = uploadMutation.isError;
  const isComplete = analysisResult?.status === "completed";
  const hasFailed = analysisResult?.status === "failed";

  return (
    <Layout>
      {/* Page Title */}
      <Box className="bg-gradient-to-r from-primary-700 to-primary-900 px-page md:px-6 lg:px-8 py-12">
        <Box className="max-w-7xl mx-auto flex justify-between items-start">
          <Box className="flex-1">
            <PageTitle title={website.name} subtitle={website.domains.primary} />
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
            size="large"
          >
            <CloseIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <PageTabs tabs={tabs} />

      {/* Content */}
      <Box className="max-w-7xl mx-auto px-page md:px-6 lg:px-8 py-8 space-y-6">
        {/* Upload Section */}
        {!previewUrl ? (
          <FileUploadZone onFileSelect={handleFileSelect} disabled={isUploading} />
        ) : (
          <Paper elevation={2} className="p-6">
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6">Screenshot Preview</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setAnalysisId(null);
                }}
                disabled={isUploading || isAnalyzing}
              >
                Upload Different Screenshot
              </Button>
            </Box>

            {/* Model Selection */}
            <Box className="mb-4">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Vision Model</InputLabel>
                <Select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as typeof selectedModel)}
                  label="Vision Model"
                  disabled={isUploading || isAnalyzing}
                >
                  <MenuItem value="gpt-4-vision">GPT-4 Vision</MenuItem>
                  <MenuItem value="claude-3-opus">Claude 3 Opus</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Screenshot Display with Regions */}
            <Box className="relative mb-4">
              {previewUrl && (
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    style={{ maxWidth: "100%", height: "auto", display: "block" }}
                  />
                  {isComplete && analysisResult?.regions && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: "none",
                      }}
                    >
                      {/* Regions would be overlaid here - requires screen dimensions */}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Upload Progress */}
            {isUploading && (
              <Box className="mb-4">
                <Box className="flex items-center gap-2 mb-2">
                  <CircularProgress size={20} />
                  <Typography variant="body2">Uploading screenshot...</Typography>
                </Box>
                <LinearProgress />
              </Box>
            )}

            {/* Analysis Progress */}
            {isAnalyzing && !isComplete && (
              <Box className="mb-4">
                <Box className="flex items-center gap-2 mb-2">
                  <CircularProgress size={20} />
                  <Typography variant="body2">
                    Analyzing screenshot with {selectedModel}...
                  </Typography>
                </Box>
                <LinearProgress />
              </Box>
            )}

            {/* Error State */}
            {(hasError || hasFailed) && (
              <Alert severity="error" className="mb-4" icon={<ErrorIcon />}>
                {uploadMutation.error
                  ? `Upload failed: ${(uploadMutation.error as Error).message}`
                  : "Analysis failed. Please try again."}
              </Alert>
            )}

            {/* Success State */}
            {isComplete && (
              <Alert severity="success" className="mb-4" icon={<CheckCircleIcon />}>
                Analysis completed successfully! Processed in{" "}
                {analysisResult.metadata.processingDuration}ms
              </Alert>
            )}

            {/* Analyze Button */}
            {!analysisId && !isUploading && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={!selectedFile}
                startIcon={<ImageSearchIcon />}
                fullWidth
              >
                Analyze Screenshot
              </Button>
            )}

            {/* Re-analyze Button */}
            {analysisId && (isComplete || hasFailed) && (
              <Button
                variant="outlined"
                onClick={handleAnalyze}
                startIcon={<RefreshIcon />}
                fullWidth
              >
                Re-analyze with {selectedModel}
              </Button>
            )}
          </Paper>
        )}

        {/* Analysis Results */}
        {isComplete && analysisResult && (
          <>
            {/* Detected Regions */}
            {analysisResult.regions && analysisResult.regions.length > 0 && (
              <Paper elevation={2} className="p-6">
                <Typography variant="h6" className="mb-4">
                  Detected Page Regions ({analysisResult.regions.length})
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.regions.map((region) => (
                    <Card
                      key={region.id}
                      variant="outlined"
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "grey.50" },
                      }}
                      onClick={() => setSelectedRegion(region)}
                    >
                      <CardContent>
                        <Box className="flex justify-between items-start mb-2">
                          <Chip label={region.type} size="small" color="primary" />
                          <Chip
                            label={`${Math.round(region.confidence * 100)}%`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        {region.description && (
                          <Typography variant="body2" className="text-gray-700">
                            {region.description}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Extracted Text Content */}
            {analysisResult.textContent && (
              <Paper elevation={2} className="p-6">
                <Typography variant="h6" className="mb-4">
                  Extracted Text Content
                </Typography>
                <Box className="space-y-4">
                  {analysisResult.textContent.headings.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Headings ({analysisResult.textContent.headings.length})
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {analysisResult.textContent.headings.map((heading, idx) => (
                          <Chip key={idx} label={heading} variant="outlined" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {analysisResult.textContent.buttons.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" className="font-semibold mb-2">
                        Buttons ({analysisResult.textContent.buttons.length})
                      </Typography>
                      <Box className="flex flex-wrap gap-2">
                        {analysisResult.textContent.buttons.map((button, idx) => (
                          <Chip key={idx} label={button} color="primary" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}

            {/* Visual Summary */}
            {analysisResult.visualSummary && (
              <Paper elevation={2} className="p-6">
                <Typography variant="h6" className="mb-4">
                  Visual Analysis Summary
                </Typography>
                <Box className="space-y-3">
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Layout: <strong>{analysisResult.visualSummary.layout}</strong>
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Content Density: <strong>{analysisResult.visualSummary.density}</strong>
                    </Typography>
                  </Box>
                  {analysisResult.visualSummary.colorPalette.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" className="mb-2">
                        Color Palette
                      </Typography>
                      <Box className="flex gap-2">
                        {analysisResult.visualSummary.colorPalette.map((color, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 48,
                              height: 48,
                              backgroundColor: color,
                              border: "1px solid #ccc",
                              borderRadius: 1,
                            }}
                            title={color}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            )}
          </>
        )}

        {/* Info Alert */}
        <Alert severity="info">
          Upload a screenshot of a web page to automatically detect regions, extract text, and
          generate embeddings for better navigation matching. Analysis uses AI vision models to
          understand page structure and content.
        </Alert>
      </Box>
    </Layout>
  );
}

export default ScreenshotAnalysis;
