import {
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Psychology as PsychologyIcon,
  RestartAlt as RestartAltIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  Slider,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "~/components/Layout";
import { PageTabs } from "~/components/PageTabs";
import { PageTitle } from "~/components/PageTitle";
import { useEnhancedEmbeddingTest } from "~/hooks/useEnhancedEmbeddingTest";
import { useUpdateSearchConfiguration } from "~/hooks/useSearchConfiguration";
import { useWebsite } from "~/hooks/useWebsite";
import type { PageMatch } from "~/types";

// Helper functions for match score visualization
function getMatchScoreColor(score: number): string {
  if (score >= 0.9) return "#4caf50"; // Green
  if (score >= 0.7) return "#ff9800"; // Amber
  if (score >= 0.5) return "#ff5722"; // Orange
  return "#9e9e9e"; // Gray
}

function getMatchScoreLabel(score: number): string {
  if (score >= 0.9) return "Excellent Match";
  if (score >= 0.7) return "Good Match";
  if (score >= 0.5) return "Fair Match";
  return "Poor Match";
}

// Multi-Modal Score Breakdown Component
interface MultiModalScoreBreakdownProps {
  result: PageMatch;
}

function MultiModalScoreBreakdown({ result }: MultiModalScoreBreakdownProps) {
  if (!result.modalityScores || result.modalityScores.length === 0) {
    return null;
  }

  return (
    <Box className="mt-4">
      <Typography variant="subtitle2" className="font-semibold mb-2 flex items-center gap-1">
        <TrendingUpIcon fontSize="small" />
        Multi-Modal Score Breakdown
      </Typography>
      <Box className="space-y-2">
        {result.modalityScores.map((modalityScore) => {
          const percentage = Math.round(modalityScore.score * 100);
          const contribution = Math.round(modalityScore.contributionWeight * 100);

          return (
            <Box key={modalityScore.modality}>
              <Box className="flex justify-between items-center mb-1">
                <Box className="flex items-center gap-2">
                  <Typography variant="caption" className="font-medium capitalize">
                    {modalityScore.modality}
                  </Typography>
                  <Chip
                    label={`${contribution}% weight`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                </Box>
                <Typography variant="caption" className="font-bold">
                  {percentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getMatchScoreColor(modalityScore.score),
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// Match Explanation Card Component
interface MatchExplanationCardProps {
  result: PageMatch;
}

function MatchExplanationCard({ result }: MatchExplanationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box className="mt-4">
      <Button
        size="small"
        onClick={() => setExpanded(!expanded)}
        startIcon={<PsychologyIcon />}
        sx={{ textTransform: "none" }}
      >
        {expanded ? "Hide" : "Show"} Match Explanation
      </Button>
      <Collapse in={expanded}>
        <Card variant="outlined" sx={{ mt: 2, backgroundColor: "#f9fafb" }}>
          <CardContent>
            <Typography variant="subtitle2" className="font-semibold mb-2">
              Why This Page Matched
            </Typography>

            {/* Matched Visual Elements */}
            {result.matchedVisualElements && result.matchedVisualElements.length > 0 && (
              <Box className="mb-3">
                <Typography variant="caption" className="font-medium text-gray-700 block mb-1">
                  <VisibilityIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
                  Visual Elements Detected:
                </Typography>
                <Box className="flex flex-wrap gap-1">
                  {result.matchedVisualElements.map((element, idx) => (
                    <Chip
                      key={idx}
                      label={element.description}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Analysis Data */}
            {result.analysisData && (
              <Box className="space-y-1">
                <Typography variant="caption" className="text-gray-600 block">
                  • Page Complexity: {result.analysisData.interactionComplexity}
                </Typography>
                <Typography variant="caption" className="text-gray-600 block">
                  • Content Density: {result.analysisData.contentDensity}
                </Typography>
                <Typography variant="caption" className="text-gray-600 block">
                  • Contains Form: {result.analysisData.hasForm ? "Yes" : "No"}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
}

// Result Card Component
interface ResultCardProps {
  result: PageMatch;
  rank: number;
}

function ResultCard({ result, rank }: ResultCardProps) {
  const matchPercentage = Math.round(result.matchScore * 100);
  const matchColor = getMatchScoreColor(result.matchScore);
  const matchLabel = getMatchScoreLabel(result.matchScore);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: "8px",
        position: "relative",
        backgroundColor: result.isBestMatch ? "#f1f8f4" : "white",
        border: result.isBestMatch ? "2px solid #4caf50" : "none",
      }}
    >
      {/* Header with title and match score */}
      <Box className="flex justify-between items-start mb-3">
        <Box className="flex-1">
          <Box className="flex items-center gap-2 mb-1">
            <Typography variant="h6" className="font-semibold">
              {result.title}
            </Typography>
            {result.isBestMatch && (
              <Chip label="Best Match" size="small" color="success" icon={<CheckCircleIcon />} />
            )}
          </Box>
          <Typography variant="body2" className="text-gray-600" sx={{ fontFamily: "monospace" }}>
            {result.url}
          </Typography>
        </Box>
        <Box className="text-right ml-4">
          <Typography variant="h4" className="font-bold" sx={{ color: matchColor }}>
            {matchPercentage}%
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            match
          </Typography>
        </Box>
      </Box>

      {/* Description */}
      {result.description && (
        <Typography variant="body2" className="text-gray-700 mb-3">
          {result.description}
        </Typography>
      )}

      {/* Intent tags and slot info */}
      <Box className="flex flex-wrap items-center gap-2 mb-3">
        {result.matchedIntents.map((intent, idx) => (
          <Chip key={idx} label={intent} size="small" color="primary" variant="outlined" />
        ))}
        {result.slots.total > 0 && (
          <Chip
            label={`${result.slots.total} slot${result.slots.total > 1 ? "s" : ""}`}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {/* Required Slots */}
      {result.slots.required.length > 0 && (
        <Box className="mb-3">
          <Typography variant="caption" className="font-semibold text-gray-700 block mb-1">
            Required Slots:
          </Typography>
          <Box className="flex flex-wrap gap-2">
            {result.slots.required.map((slot, idx) => (
              <Box key={idx} className="inline-flex items-center gap-1 text-xs text-gray-600">
                <Typography variant="caption" className="font-mono">
                  {slot.name}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {slot.type}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Confidence bar */}
      <Box>
        <LinearProgress
          variant="determinate"
          value={matchPercentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: matchColor,
              borderRadius: 4,
            },
          }}
        />
      </Box>

      {/* Multi-Modal Score Breakdown */}
      <MultiModalScoreBreakdown result={result} />

      {/* Match Explanation */}
      <MatchExplanationCard result={result} />
    </Paper>
  );
}

const tabs = [
  { label: "Overview", value: "overview", path: "/website/overview" },
  { label: "Crawl Management", value: "crawl-management", path: "/website/crawl-management" },
  { label: "Link Management", value: "links", path: "/website/links" },
  { label: "Embeddings Tester", value: "embedding-test", path: "/website/embedding-test" },
  { label: "Widget Code", value: "code", path: "/website/code" },
];

export function EmbeddingTest() {
  const websiteId = "mock-website-1";
  const { data: website, isLoading } = useWebsite(websiteId);
  const navigate = useNavigate();

  // Embedding test mutation - use enhanced version
  const embeddingTestMutation = useEnhancedEmbeddingTest(websiteId);

  // Search configuration mutation
  const updateSearchConfigMutation = useUpdateSearchConfiguration(websiteId);

  // Snackbar state for save confirmation
  const [showSaveSnackbar, setShowSaveSnackbar] = useState(false);

  // Query input state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Multi-modal settings
  const [useMultiModal, setUseMultiModal] = useState(true);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [modalityWeights, setModalityWeights] = useState({
    text: 0.5,
    visual: 0.3,
    metadata: 0.2,
  });

  // Helper function to adjust weights proportionally when one changes
  const adjustWeights = (changedWeight: 'text' | 'visual' | 'metadata', newValue: number) => {
    const clampedValue = Math.max(0, Math.min(1, newValue));
    const remaining = 1 - clampedValue;

    // Get the other two weights
    const otherWeights = {
      text: changedWeight !== 'text' ? modalityWeights.text : 0,
      visual: changedWeight !== 'visual' ? modalityWeights.visual : 0,
      metadata: changedWeight !== 'metadata' ? modalityWeights.metadata : 0,
    };

    const otherTotal = otherWeights.text + otherWeights.visual + otherWeights.metadata;

    // Distribute remaining proportionally among other weights
    const newWeights = {
      text: changedWeight === 'text' ? clampedValue : (otherTotal > 0 ? (otherWeights.text / otherTotal) * remaining : remaining / 2),
      visual: changedWeight === 'visual' ? clampedValue : (otherTotal > 0 ? (otherWeights.visual / otherTotal) * remaining : remaining / 2),
      metadata: changedWeight === 'metadata' ? clampedValue : (otherTotal > 0 ? (otherWeights.metadata / otherTotal) * remaining : 0),
    };

    setModalityWeights(newWeights);
  };

  // Recent queries state with localStorage
  const RECENT_QUERIES_KEY = `recent-queries-${websiteId}`;
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(RECENT_QUERIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load recent queries from localStorage:", error);
      return [];
    }
  });

  const handleClose = () => {
    navigate("/");
  };

  // Load default weights from website configuration on mount
  useEffect(() => {
    if (website?.searchConfiguration?.defaultModalityWeights) {
      setModalityWeights(website.searchConfiguration.defaultModalityWeights);
    }
  }, [website]);

  // Check if current weights differ from saved defaults
  const hasUnsavedChanges = useMemo(() => {
    if (!website?.searchConfiguration?.defaultModalityWeights) {
      // No saved defaults, so any non-standard weights are "unsaved"
      return (
        modalityWeights.text !== 0.5 ||
        modalityWeights.visual !== 0.3 ||
        modalityWeights.metadata !== 0.2
      );
    }

    const saved = website.searchConfiguration.defaultModalityWeights;
    const threshold = 0.001; // Account for floating point precision

    return (
      Math.abs(modalityWeights.text - saved.text) > threshold ||
      Math.abs(modalityWeights.visual - saved.visual) > threshold ||
      Math.abs(modalityWeights.metadata - saved.metadata) > threshold
    );
  }, [modalityWeights, website?.searchConfiguration?.defaultModalityWeights]);

  // Handler for saving current weights as default
  const handleSaveAsDefault = () => {
    updateSearchConfigMutation.mutate(
      {
        defaultModalityWeights: modalityWeights,
        description: `Custom weights for ${website?.type || 'website'}`,
      },
      {
        onSuccess: () => {
          setShowSaveSnackbar(true);
        },
      }
    );
  };

  // Handler for resetting to default weights
  const handleResetToDefault = () => {
    if (website?.searchConfiguration?.defaultModalityWeights) {
      setModalityWeights(website.searchConfiguration.defaultModalityWeights);
    } else {
      // Fallback to standard defaults
      setModalityWeights({
        text: 0.5,
        visual: 0.3,
        metadata: 0.2,
      });
    }
  };

  // Save recent queries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(recentQueries));
    } catch (error) {
      console.error("Failed to save recent queries to localStorage:", error);
      // Handle quota exceeded or other storage errors silently
    }
  }, [recentQueries, RECENT_QUERIES_KEY]);

  // Debounce input changes (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Validate query
  const validateQuery = useCallback((value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null; // Empty is valid, just no search
    }
    if (trimmed.length < 3) {
      return "Query must be at least 3 characters";
    }
    if (trimmed.length > 500) {
      return "Query must not exceed 500 characters";
    }
    return null;
  }, []);

  // Handle input change
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length <= 500) {
      setQuery(value);
      const error = validateQuery(value);
      setValidationError(error);
    }
  };

  // Handle clear button
  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setValidationError(null);
  };

  // Handle search submission
  const handleSearch = useCallback(() => {
    const trimmed = query.trim();
    const error = validateQuery(trimmed);

    if (error) {
      setValidationError(error);
      return;
    }

    if (trimmed.length === 0) {
      return;
    }

    // Call the API using the mutation with multi-modal parameters
    embeddingTestMutation.mutate(
      {
        query: trimmed,
        useMultiModal,
        modalityWeights: useMultiModal ? modalityWeights : undefined,
      },
      {
        onSuccess: () => {
          // Add to recent queries (limit to 5 most recent)
          setRecentQueries((prev) => {
            const updated = [trimmed, ...prev.filter((q) => q !== trimmed)];
            return updated.slice(0, 5);
          });
        },
      }
    );
  }, [query, validateQuery, embeddingTestMutation, useMultiModal, modalityWeights]);

  // Handle Enter key
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  if (isLoading) {
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

  const charCount = query.length;
  const isQueryValid = query.trim().length >= 3 && query.trim().length <= 500;
  const isSearching = embeddingTestMutation.isPending;
  const searchResults = embeddingTestMutation.data;
  const hasError = embeddingTestMutation.isError;

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
        {/* Query Input Section */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4">
            Test Query
          </Typography>
          <Typography variant="body2" className="text-gray-600 mb-4">
            Enter a user query to test how well your embeddings match navigation pages. Results will
            show match scores and intent matching details.
          </Typography>

          <Box className="space-y-4">
            <TextField
              fullWidth
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter a test query (e.g., 'I want to book an appointment')"
              error={!!validationError}
              helperText={validationError || `${charCount}/500 characters`}
              disabled={isSearching}
              inputProps={{
                "aria-label": "Test query input",
                "aria-describedby": "query-helper-text",
                maxLength: 500,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: query.length > 0 && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClear}
                      edge="end"
                      size="small"
                      aria-label="Clear query"
                      disabled={isSearching}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box className="flex justify-between items-center">
              <Box className="flex items-center gap-2">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSearch}
                  disabled={!isQueryValid || isSearching}
                  startIcon={<SearchIcon />}
                >
                  {isSearching ? "Searching..." : "Test Query"}
                </Button>
                <Tooltip title="Enable multi-modal embedding search for better accuracy">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useMultiModal}
                        onChange={(e) => setUseMultiModal(e.target.checked)}
                        disabled={isSearching}
                      />
                    }
                    label="Multi-Modal"
                  />
                </Tooltip>
              </Box>
              {isSearching && (
                <Typography variant="body2" color="text.secondary">
                  Analyzing embeddings...
                </Typography>
              )}
            </Box>

            {/* Advanced Controls */}
            {useMultiModal && (
              <Box className="mt-4">
                <Button
                  size="small"
                  onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                  sx={{ textTransform: "none", mb: 2 }}
                >
                  {showAdvancedControls ? "Hide" : "Show"} Advanced Weight Controls
                </Button>
                <Collapse in={showAdvancedControls}>
                  <Card variant="outlined" sx={{ p: 2, backgroundColor: "#f9fafb" }}>
                    <Typography variant="subtitle2" className="mb-3">
                      Adjust Embedding Modality Weights
                    </Typography>
                    <Box className="space-y-3">
                      <Box>
                        <Box className="flex justify-between items-center mb-1">
                          <Typography variant="caption">Text Embeddings</Typography>
                          <Typography variant="caption" className="font-bold">
                            {Math.round(modalityWeights.text * 100)}%
                          </Typography>
                        </Box>
                        <Slider
                          value={modalityWeights.text}
                          onChange={(_, value) => adjustWeights('text', value as number)}
                          min={0}
                          max={1}
                          step={0.05}
                          disabled={isSearching}
                          marks={[
                            { value: 0, label: "0%" },
                            { value: 0.5, label: "50%" },
                            { value: 1, label: "100%" },
                          ]}
                        />
                      </Box>
                      <Box>
                        <Box className="flex justify-between items-center mb-1">
                          <Typography variant="caption">Visual Embeddings</Typography>
                          <Typography variant="caption" className="font-bold">
                            {Math.round(modalityWeights.visual * 100)}%
                          </Typography>
                        </Box>
                        <Slider
                          value={modalityWeights.visual}
                          onChange={(_, value) => adjustWeights('visual', value as number)}
                          min={0}
                          max={1}
                          step={0.05}
                          disabled={isSearching}
                          marks={[
                            { value: 0, label: "0%" },
                            { value: 0.5, label: "50%" },
                            { value: 1, label: "100%" },
                          ]}
                        />
                      </Box>
                      <Box>
                        <Box className="flex justify-between items-center mb-1">
                          <Typography variant="caption">Metadata Embeddings</Typography>
                          <Typography variant="caption" className="font-bold">
                            {Math.round(modalityWeights.metadata * 100)}%
                          </Typography>
                        </Box>
                        <Slider
                          value={modalityWeights.metadata}
                          onChange={(_, value) => adjustWeights('metadata', value as number)}
                          min={0}
                          max={1}
                          step={0.05}
                          disabled={isSearching}
                          marks={[
                            { value: 0, label: "0%" },
                            { value: 0.5, label: "50%" },
                            { value: 1, label: "100%" },
                          ]}
                        />
                      </Box>
                      <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
                        Weights determine how much each modality contributes to the final match score.
                        Higher weights emphasize that modality's importance.
                      </Alert>
                      {hasUnsavedChanges && (
                        <Alert severity="warning" sx={{ fontSize: "0.75rem", mt: 2 }}>
                          You have unsaved changes to the modality weights.
                        </Alert>
                      )}
                      <Box className="flex gap-2 mt-3">
                        <Button
                          variant={hasUnsavedChanges ? "contained" : "outlined"}
                          color={hasUnsavedChanges ? "primary" : "inherit"}
                          size="small"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveAsDefault}
                          disabled={!hasUnsavedChanges || updateSearchConfigMutation.isPending || isSearching}
                          fullWidth
                        >
                          {updateSearchConfigMutation.isPending ? "Saving..." : "Save as Default"}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<RestartAltIcon />}
                          onClick={handleResetToDefault}
                          disabled={!hasUnsavedChanges || isSearching}
                          fullWidth
                        >
                          Reset to Default
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                </Collapse>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Error State */}
        {hasError && (
          <Alert severity="error" className="mb-4">
            Failed to fetch embedding test results. Please try again.
            {embeddingTestMutation.error && (
              <Typography variant="caption" className="block mt-1">
                {(embeddingTestMutation.error as Error).message}
              </Typography>
            )}
          </Alert>
        )}

        {/* Results Section */}
        {searchResults ? (
          <Box>
            {/* Results Header */}
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h6">
                Results for: "<span className="text-primary-600">{searchResults.query}</span>"
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {searchResults.totalMatches} page{searchResults.totalMatches !== 1 ? "s" : ""}{" "}
                matched
              </Typography>
            </Box>

            {/* Result Cards */}
            {searchResults.results.map((result, idx) => (
              <ResultCard key={result.pageId} result={result} rank={idx + 1} />
            ))}
          </Box>
        ) : !hasError ? (
          /* Empty State */
          <Paper elevation={2} className="p-6">
            <Box className="text-center py-12">
              <SearchIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" className="text-gray-600 mb-2">
                No results yet
              </Typography>
              <Typography variant="body2" className="text-gray-500">
                Enter a query above to test your embedding matches
              </Typography>
            </Box>
          </Paper>
        ) : null}

        {/* Recent Queries */}
        {recentQueries.length > 0 && (
          <Paper elevation={2} className="p-6">
            <Typography variant="h6" className="mb-3">
              Recent Queries
            </Typography>
            <Box className="space-y-2">
              {recentQueries.map((recentQuery, idx) => (
                <Box
                  key={idx}
                  className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    setQuery(recentQuery);
                    // Trigger search immediately
                    setTimeout(() => handleSearch(), 0);
                  }}
                >
                  <Typography variant="body2" className="text-gray-700">
                    {recentQuery}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Info Alert */}
        <Alert severity="info">
          {useMultiModal ? (
            <>
              Multi-modal search combines text, visual, and metadata embeddings for more accurate
              matching. Adjust weights to emphasize different aspects of page content. Higher match
              scores indicate better alignment across all modalities.
            </>
          ) : (
            <>
              This tool helps you validate that user queries correctly match your navigation pages.
              Higher match scores indicate better semantic alignment. Enable multi-modal search for
              enhanced accuracy.
            </>
          )}
        </Alert>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSaveSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSaveSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSaveSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Default modality weights saved successfully!
        </Alert>
      </Snackbar>
    </Layout>
  );
}
