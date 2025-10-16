import {
  CheckCircle as CheckCircleIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "~/components/Layout";
import { PageTabs } from "~/components/PageTabs";
import { PageTitle } from "~/components/PageTitle";
import { useEmbeddingTest } from "~/hooks/useEmbeddingTest";
import { useWebsite } from "~/hooks/useWebsite";
import type { PageMatch, SlotInfo } from "~/types";

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
    </Paper>
  );
}

const tabs = [
  { label: "Overview", value: "overview", path: "/website/overview" },
  { label: "Link Management", value: "links", path: "/website/links" },
  { label: "Widget Code", value: "code", path: "/website/code" },
  { label: "Embeddings Tester", value: "embedding-test", path: "/website/embedding-test" },
  { label: "Crawl Management", value: "crawl-management", path: "/website/crawl-management" },
];

export function EmbeddingTest() {
  const websiteId = "mock-website-1";
  const { data: website, isLoading } = useWebsite(websiteId);
  const navigate = useNavigate();

  // Embedding test mutation
  const embeddingTestMutation = useEmbeddingTest({ websiteId });

  // Query input state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

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

    // Call the API using the mutation
    embeddingTestMutation.mutate(
      { query: trimmed },
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
  }, [query, validateQuery, embeddingTestMutation]);

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
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={!isQueryValid || isSearching}
                startIcon={<SearchIcon />}
              >
                {isSearching ? "Searching..." : "Test Query"}
              </Button>
              {isSearching && (
                <Typography variant="body2" color="text.secondary">
                  Analyzing embeddings...
                </Typography>
              )}
            </Box>
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
          This tool helps you validate that user queries correctly match your navigation pages.
          Higher match scores indicate better semantic alignment between the query and page content.
        </Alert>
      </Box>
    </Layout>
  );
}
