import {
  CompareArrows as CompareIcon,
  FilterList as FilterListIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAnalysisHistory } from "~/hooks";
import type { ScreenshotAnalysisResult } from "~/types";

// Helper function to get status color
function getStatusColor(status: "completed" | "failed" | "processing") {
  if (status === "completed") return "#4caf50";
  if (status === "failed") return "#f44336";
  return "#ff9800";
}

// Helper function to calculate text difference
function calculateDiff(
  text1: string,
  text2: string
): {
  added: number;
  removed: number;
  unchanged: number;
} {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);

  // Simple diff algorithm - count changed words
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const removed = words1.filter((w) => !set2.has(w)).length;
  const added = words2.filter((w) => !set1.has(w)).length;
  const unchanged = Math.min(words1.length, words2.length) - Math.max(added, removed);

  return { added, removed, unchanged: Math.max(0, unchanged) };
}

// Confidence Trend Chart Component
function ConfidenceTrendChart({ entries }: { entries: ScreenshotAnalysisResult[] }) {
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate points
  const maxConfidence = 1.0;
  const minConfidence = 0.0;

  const points = entries
    .map((entry, index) => {
      const x = padding.left + (index / (entries.length - 1 || 1)) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((entry.metadata.confidence - minConfidence) / (maxConfidence - minConfidence)) *
          chartHeight;
      return { x, y, confidence: entry.metadata.confidence, date: entry.metadata.analyzedAt };
    })
    .reverse(); // Reverse to show oldest first

  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <Box>
      <Typography variant="subtitle2" className="font-semibold mb-3 flex items-center gap-2">
        <TrendingUpIcon fontSize="small" />
        Confidence Score Trend
      </Typography>
      <svg
        width={width}
        height={height}
        style={{ maxWidth: "100%", height: "auto" }}
        aria-label="Confidence Score Trend Chart"
      >
        <title>Confidence Score Trend Chart</title>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map((value) => {
          const y =
            padding.top +
            chartHeight -
            ((value - minConfidence) / (maxConfidence - minConfidence)) * chartHeight;
          return (
            <g key={value}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
              <text x={padding.left - 10} y={y + 5} textAnchor="end" fontSize="11" fill="#666">
                {(value * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {/* X axis labels */}
        {points.map((point, index) => {
          if (index % Math.ceil(points.length / 5) === 0 || index === points.length - 1) {
            const date = new Date(point.date);
            return (
              <text
                key={point.date}
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#666"
              >
                {date.toLocaleDateString()}
              </text>
            );
          }
          return null;
        })}

        {/* Line chart */}
        <path d={pathData} fill="none" stroke="#1976d2" strokeWidth="2" />

        {/* Data points */}
        {points.map((point) => (
          <circle
            key={point.date}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#1976d2"
            stroke="white"
            strokeWidth="2"
          >
            <title>{`${(point.confidence * 100).toFixed(1)}% - ${new Date(point.date).toLocaleString()}`}</title>
          </circle>
        ))}
      </svg>
    </Box>
  );
}

// Timeline Entry Component
function TimelineEntry({
  entry,
  isSelected,
  onClick,
}: {
  entry: ScreenshotAnalysisResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const date = new Date(entry.metadata.analyzedAt);

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        p: 2,
        border: "2px solid",
        borderColor: isSelected ? "#1976d2" : "#e0e0e0",
        borderRadius: 2,
        backgroundColor: isSelected ? "#e3f2fd" : "white",
        "&:hover": { borderColor: "#1976d2", backgroundColor: "#f5f5f5" },
        transition: "all 0.2s",
      }}
    >
      <Box className="flex items-start justify-between mb-2">
        <Box className="flex items-center gap-2">
          <Chip
            label={entry.status}
            size="small"
            sx={{
              backgroundColor: getStatusColor(entry.status),
              color: "white",
              fontWeight: "bold",
            }}
          />
          <Typography variant="caption" className="text-gray-600 font-mono">
            {entry.analysisId}
          </Typography>
        </Box>
        <Typography variant="caption" className="text-gray-500">
          {date.toLocaleString()}
        </Typography>
      </Box>

      <Box className="space-y-1">
        <Box className="flex items-center gap-2">
          <Typography variant="caption" className="text-gray-600">
            Model:
          </Typography>
          <Chip label={entry.metadata.modelUsed} size="small" variant="outlined" />
        </Box>
        <Box className="flex items-center gap-2">
          <Typography variant="caption" className="text-gray-600">
            Confidence:
          </Typography>
          <Box className="flex-1 max-w-[100px]">
            <Box
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "#e0e0e0",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${entry.metadata.confidence * 100}%`,
                  backgroundColor: "#4caf50",
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
          <Typography variant="caption" className="font-bold">
            {(entry.metadata.confidence * 100).toFixed(1)}%
          </Typography>
        </Box>
        <Typography variant="caption" className="text-gray-600">
          Regions detected: {entry.regions.length} | Processing: {entry.metadata.processingDuration}
          ms
        </Typography>
      </Box>
    </Box>
  );
}

// Comparison View Component
function ComparisonView({
  entry1,
  entry2,
}: {
  entry1: ScreenshotAnalysisResult;
  entry2: ScreenshotAnalysisResult;
}) {
  // Memoize expensive diff calculation
  const textDiff = useMemo(
    () => calculateDiff(entry1.textContent.extracted, entry2.textContent.extracted),
    [entry1.textContent.extracted, entry2.textContent.extracted]
  );

  const regionDiff = useMemo(() => {
    const diff = {
      added: entry2.regions.length - entry1.regions.length,
      removed: 0,
    };
    if (diff.added < 0) {
      diff.removed = Math.abs(diff.added);
      diff.added = 0;
    }
    return diff;
  }, [entry1.regions.length, entry2.regions.length]);

  const confidenceDiff = entry2.metadata.confidence - entry1.metadata.confidence;

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" className="font-semibold mb-4 flex items-center gap-2">
          <CompareIcon />
          Comparison View
        </Typography>

        {/* Summary Stats */}
        <Box className="grid grid-cols-3 gap-4 mb-6">
          <Paper variant="outlined" className="p-3">
            <Typography variant="caption" className="text-gray-600">
              Confidence Change
            </Typography>
            <Typography
              variant="h6"
              className="font-bold"
              sx={{ color: confidenceDiff >= 0 ? "#4caf50" : "#f44336" }}
            >
              {confidenceDiff >= 0 ? "+" : ""}
              {(confidenceDiff * 100).toFixed(1)}%
            </Typography>
          </Paper>
          <Paper variant="outlined" className="p-3">
            <Typography variant="caption" className="text-gray-600">
              Regions Change
            </Typography>
            <Typography variant="h6" className="font-bold">
              {regionDiff.added > 0 && `+${regionDiff.added}`}
              {regionDiff.removed > 0 && `-${regionDiff.removed}`}
              {regionDiff.added === 0 && regionDiff.removed === 0 && "No change"}
            </Typography>
          </Paper>
          <Paper variant="outlined" className="p-3">
            <Typography variant="caption" className="text-gray-600">
              Text Changes
            </Typography>
            <Typography variant="h6" className="font-bold">
              {textDiff.added + textDiff.removed} words
            </Typography>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Side-by-side comparison */}
        <Box className="grid grid-cols-2 gap-4">
          <Box>
            <Typography variant="subtitle2" className="font-semibold mb-2">
              Version 1 ({new Date(entry1.metadata.analyzedAt).toLocaleDateString()})
            </Typography>
            <Paper variant="outlined" className="p-3">
              <Typography variant="caption" className="text-gray-600 block mb-2">
                Extracted Text ({entry1.textContent.extracted.split(/\s+/).length} words)
              </Typography>
              <Typography variant="body2" className="whitespace-pre-wrap text-sm">
                {entry1.textContent.extracted.substring(0, 200)}...
              </Typography>
              <Typography variant="caption" className="text-gray-600 block mt-3 mb-1">
                Regions: {entry1.regions.length}
              </Typography>
              {entry1.regions.slice(0, 3).map((region) => (
                <Chip
                  key={region.id}
                  label={region.type}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Paper>
          </Box>

          <Box>
            <Typography variant="subtitle2" className="font-semibold mb-2">
              Version 2 ({new Date(entry2.metadata.analyzedAt).toLocaleDateString()})
            </Typography>
            <Paper variant="outlined" className="p-3" sx={{ borderColor: "#1976d2" }}>
              <Typography variant="caption" className="text-gray-600 block mb-2">
                Extracted Text ({entry2.textContent.extracted.split(/\s+/).length} words)
              </Typography>
              <Typography variant="body2" className="whitespace-pre-wrap text-sm">
                {entry2.textContent.extracted.substring(0, 200)}...
              </Typography>
              <Typography variant="caption" className="text-gray-600 block mt-3 mb-1">
                Regions: {entry2.regions.length}
              </Typography>
              {entry2.regions.slice(0, 3).map((region) => (
                <Chip
                  key={region.id}
                  label={region.type}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Paper>
          </Box>
        </Box>

        {/* Change Summary */}
        <Box className="mt-4">
          <Typography variant="subtitle2" className="font-semibold mb-2">
            Change Summary
          </Typography>
          <Box className="space-y-2">
            {textDiff.added > 0 && (
              <Alert severity="info" icon={false}>
                <Typography variant="caption">
                  <strong>+{textDiff.added}</strong> words added to extracted text
                </Typography>
              </Alert>
            )}
            {textDiff.removed > 0 && (
              <Alert severity="warning" icon={false}>
                <Typography variant="caption">
                  <strong>-{textDiff.removed}</strong> words removed from extracted text
                </Typography>
              </Alert>
            )}
            {regionDiff.added > 0 && (
              <Alert severity="success" icon={false}>
                <Typography variant="caption">
                  <strong>+{regionDiff.added}</strong> new region(s) detected
                </Typography>
              </Alert>
            )}
            {regionDiff.removed > 0 && (
              <Alert severity="error" icon={false}>
                <Typography variant="caption">
                  <strong>-{regionDiff.removed}</strong> region(s) no longer detected
                </Typography>
              </Alert>
            )}
            {confidenceDiff !== 0 && (
              <Alert severity={confidenceDiff > 0 ? "success" : "warning"} icon={false}>
                <Typography variant="caption">
                  Analysis confidence {confidenceDiff > 0 ? "increased" : "decreased"} by{" "}
                  <strong>{Math.abs(confidenceDiff * 100).toFixed(1)}%</strong>
                </Typography>
              </Alert>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export function AnalysisHistoryViewer() {
  const { websiteId } = useParams<{ websiteId: string }>();

  // State
  const [page, _setPage] = useState(0);
  const [pageSize] = useState(20);
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [selectedEntry1, setSelectedEntry1] = useState<ScreenshotAnalysisResult | null>(null);
  const [selectedEntry2, setSelectedEntry2] = useState<ScreenshotAnalysisResult | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "comparison">("timeline");

  // Hooks
  const { data, isLoading, refetch } = useAnalysisHistory(websiteId || "", page, pageSize);
  const parentRef = useRef<HTMLDivElement>(null);

  const entries = data?.entries || [];

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    const matchesModel = filterModel === "all" || entry.metadata.modelUsed === filterModel;

    let matchesDate = true;
    if (filterDateRange !== "all") {
      const entryDate = new Date(entry.metadata.analyzedAt);
      const now = new Date();
      const daysAgo = filterDateRange === "7d" ? 7 : filterDateRange === "30d" ? 30 : 90;
      const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      matchesDate = entryDate >= cutoff;
    }

    return matchesModel && matchesDate;
  });

  // Get unique models for filter
  const uniqueModels = Array.from(new Set(entries.map((e) => e.metadata.modelUsed)));

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 152, // 140px + 12px padding
    overscan: 3,
  });

  const handleEntryClick = (entry: ScreenshotAnalysisResult) => {
    if (!selectedEntry1) {
      setSelectedEntry1(entry);
    } else if (!selectedEntry2) {
      setSelectedEntry2(entry);
      setViewMode("comparison");
    } else {
      // Reset and start new selection
      setSelectedEntry1(entry);
      setSelectedEntry2(null);
      setViewMode("timeline");
    }
  };

  const handleClearSelection = () => {
    setSelectedEntry1(null);
    setSelectedEntry2(null);
    setViewMode("timeline");
  };

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold mb-2 flex items-center gap-2">
          <HistoryIcon />
          Analysis History
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          View and compare different versions of page analysis over time
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Paper className="p-4 mb-4">
        <Box className="flex flex-wrap gap-3 items-center">
          <FilterListIcon className="text-gray-600" />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Analysis Model</InputLabel>
            <Select
              value={filterModel}
              label="Analysis Model"
              onChange={(e) => setFilterModel(e.target.value)}
            >
              <MenuItem value="all">All Models</MenuItem>
              {uniqueModels.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={filterDateRange}
            exclusive
            onChange={(_, value) => value && setFilterDateRange(value)}
            size="small"
          >
            <ToggleButton value="all">All Time</ToggleButton>
            <ToggleButton value="7d">Last 7 Days</ToggleButton>
            <ToggleButton value="30d">Last 30 Days</ToggleButton>
            <ToggleButton value="90d">Last 90 Days</ToggleButton>
          </ToggleButtonGroup>

          <Box className="flex-1" />

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            size="small"
          >
            Refresh
          </Button>

          {selectedEntry1 && (
            <Button variant="outlined" onClick={handleClearSelection} size="small">
              Clear Selection
            </Button>
          )}

          <Typography variant="caption" className="text-gray-600">
            {filteredEntries.length} of {entries.length} analyses
          </Typography>
        </Box>
      </Paper>

      {/* Selection Info */}
      {(selectedEntry1 || selectedEntry2) && (
        <Alert severity="info" className="mb-4">
          <Typography variant="body2">
            {selectedEntry1 && !selectedEntry2 && "Select another version to compare"}
            {selectedEntry1 &&
              selectedEntry2 &&
              "Comparing two versions - click any entry to start new selection"}
          </Typography>
        </Alert>
      )}

      {isLoading ? (
        <Box className="flex justify-center p-8">
          <CircularProgress />
        </Box>
      ) : (
        <Box className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Column */}
          <Box className="lg:col-span-1">
            <Typography variant="subtitle1" className="font-semibold mb-3">
              Analysis Timeline
            </Typography>
            <Box ref={parentRef} className="h-[800px] pr-2 overflow-auto">
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const entry = filteredEntries[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <Box sx={{ pb: 1.5 }}>
                        <TimelineEntry
                          entry={entry}
                          isSelected={entry === selectedEntry1 || entry === selectedEntry2}
                          onClick={() => handleEntryClick(entry)}
                        />
                      </Box>
                    </div>
                  );
                })}
              </div>
            </Box>
          </Box>

          {/* Main Content Column */}
          <Box className="lg:col-span-2">
            {viewMode === "comparison" && selectedEntry1 && selectedEntry2 ? (
              <ComparisonView entry1={selectedEntry1} entry2={selectedEntry2} />
            ) : (
              <Box className="space-y-6">
                {/* Trend Chart */}
                {filteredEntries.length > 1 && (
                  <Card>
                    <CardContent>
                      <ConfidenceTrendChart entries={filteredEntries} />
                    </CardContent>
                  </Card>
                )}

                {/* Instructions */}
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" className="font-semibold mb-2">
                      How to Use
                    </Typography>
                    <Box className="space-y-2">
                      <Typography variant="body2" className="text-gray-700">
                        • Click on any analysis version in the timeline to select it
                      </Typography>
                      <Typography variant="body2" className="text-gray-700">
                        • Select a second version to view a detailed comparison
                      </Typography>
                      <Typography variant="body2" className="text-gray-700">
                        • Use filters to narrow down analyses by model or date range
                      </Typography>
                      <Typography variant="body2" className="text-gray-700">
                        • View confidence trends over time in the chart above
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Selected Entry Details */}
                {selectedEntry1 && !selectedEntry2 && (
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" className="font-semibold mb-3">
                        Selected Analysis Details
                      </Typography>
                      <Box className="space-y-3">
                        <Box>
                          <Typography variant="caption" className="text-gray-600">
                            Analysis ID
                          </Typography>
                          <Typography variant="body2" className="font-mono">
                            {selectedEntry1.analysisId}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-600">
                            Analyzed At
                          </Typography>
                          <Typography variant="body2">
                            {new Date(selectedEntry1.metadata.analyzedAt).toLocaleString()}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-600">
                            Extracted Text Preview
                          </Typography>
                          <Paper variant="outlined" className="p-2 mt-1">
                            <Typography variant="body2" className="text-sm">
                              {selectedEntry1.textContent.extracted.substring(0, 300)}...
                            </Typography>
                          </Paper>
                        </Box>
                        <Box>
                          <Typography variant="caption" className="text-gray-600 block mb-1">
                            Detected Regions ({selectedEntry1.regions.length})
                          </Typography>
                          <Box className="flex flex-wrap gap-1">
                            {selectedEntry1.regions.map((region) => (
                              <Chip
                                key={region.id}
                                label={region.type}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {filteredEntries.length === 0 && !isLoading && (
        <Alert severity="info">
          No analysis history found. Try adjusting your filters or upload a screenshot for analysis.
        </Alert>
      )}
    </Box>
  );
}
