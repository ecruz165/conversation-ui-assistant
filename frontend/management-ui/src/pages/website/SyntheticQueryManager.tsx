import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Error as ErrorIcon,
  FilterList as FilterListIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  useGenerateSyntheticQueries,
  useSyntheticQueries,
  useValidateSyntheticQuery,
} from "~/hooks";
import type { QueryType, SyntheticQuery } from "~/types";

export function SyntheticQueryManager() {
  const websiteId = "website-1"; // This should come from route params in real app

  // State management
  const [filterStatus, setFilterStatus] = useState<"all" | "validated" | "unvalidated">("all");
  const [filterQueryType, setFilterQueryType] = useState<QueryType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQueries, setSelectedQueries] = useState<string[]>([]);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});

  // Generate dialog state
  const [generateCount, setGenerateCount] = useState(5);
  const [generateTypes, setGenerateTypes] = useState<QueryType[]>([
    "show_me",
    "i_want_to",
    "where_can_i",
    "navigate_to",
    "find_my",
    "how_do_i",
  ]);
  const [generatePageId, setGeneratePageId] = useState<string>("");

  // Hooks
  const { data: queries = [], isLoading, refetch } = useSyntheticQueries(websiteId);
  const generateMutation = useGenerateSyntheticQueries(websiteId);
  const validateMutation = useValidateSyntheticQuery(websiteId);

  // Filter queries
  const filteredQueries = queries.filter((q) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "validated" && q.validated) ||
      (filterStatus === "unvalidated" && !q.validated);

    const matchesType = filterQueryType === "all" || q.queryType === filterQueryType;

    const matchesSearch =
      searchTerm === "" ||
      q.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.expectedPageId.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  // Calculate distribution
  const distribution: Record<QueryType, number> = {
    show_me: 0,
    i_want_to: 0,
    where_can_i: 0,
    navigate_to: 0,
    find_my: 0,
    how_do_i: 0,
    other: 0,
  };

  queries.forEach((q) => {
    if (q.queryType) {
      distribution[q.queryType]++;
    }
  });

  const totalQueries = queries.length;

  // Handlers
  const handleGenerate = async () => {
    await generateMutation.mutateAsync({
      count: generateCount,
      queryTypes: generateTypes,
      pageId: generatePageId || undefined,
      useMultiModal: true,
    });
    setGenerateDialogOpen(false);
    refetch();
  };

  const handleValidateOne = async (query: SyntheticQuery) => {
    const result = await validateMutation.mutateAsync({
      query: query.query,
      expectedPageId: query.expectedPageId,
    });
    setValidationResults((prev) => ({ ...prev, [query.id]: result.isValid }));
  };

  const handleValidateBatch = async () => {
    for (const queryId of selectedQueries) {
      const query = queries.find((q) => q.id === queryId);
      if (query) {
        await handleValidateOne(query);
      }
    }
    setSelectedQueries([]);
  };

  const handleToggleQueryType = (type: QueryType) => {
    setGenerateTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(filteredQueries, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `synthetic-queries-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const handleExportCSV = () => {
    const headers = ["Query", "Type", "Expected Page", "Validated", "Match Score"];
    const rows = filteredQueries.map((q) => [
      `"${q.query}"`,
      q.queryType || "",
      q.expectedPageId,
      q.validated ? "Yes" : "No",
      q.matchScore?.toFixed(2) || "N/A",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `synthetic-queries-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleSelectAll = () => {
    if (selectedQueries.length === filteredQueries.length) {
      setSelectedQueries([]);
    } else {
      setSelectedQueries(filteredQueries.map((q) => q.id));
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "#9e9e9e";
    if (score >= 0.9) return "#4caf50";
    if (score >= 0.7) return "#ff9800";
    return "#ff5722";
  };

  const queryTypeLabels: Record<QueryType, string> = {
    show_me: "Show Me",
    i_want_to: "I Want To",
    where_can_i: "Where Can I",
    navigate_to: "Navigate To",
    find_my: "Find My",
    how_do_i: "How Do I",
    other: "Other",
  };

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold mb-2">
          Synthetic Query Manager
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          Generate, manage, and validate synthetic test queries for training and testing your
          navigation system
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent>
            <Typography variant="caption" className="text-gray-600">
              Total Queries
            </Typography>
            <Typography variant="h5" className="font-bold">
              {queries.length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="caption" className="text-gray-600">
              Validated
            </Typography>
            <Typography variant="h5" className="font-bold text-green-600">
              {queries.filter((q) => q.validated).length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="caption" className="text-gray-600">
              Unvalidated
            </Typography>
            <Typography variant="h5" className="font-bold text-orange-600">
              {queries.filter((q) => !q.validated).length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="caption" className="text-gray-600">
              Avg Match Score
            </Typography>
            <Typography variant="h5" className="font-bold">
              {queries.filter((q) => q.matchScore).length > 0
                ? (
                    queries
                      .filter((q) => q.matchScore)
                      .reduce((sum, q) => sum + (q.matchScore || 0), 0) /
                    queries.filter((q) => q.matchScore).length
                  ).toFixed(2)
                : "N/A"}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Query Type Distribution */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="subtitle1" className="font-semibold mb-3">
            Query Type Distribution
          </Typography>
          <Box className="space-y-2">
            {(Object.keys(distribution) as QueryType[]).map((type) => {
              const count = distribution[type];
              const percentage = totalQueries > 0 ? (count / totalQueries) * 100 : 0;

              return (
                <Box key={type}>
                  <Box className="flex justify-between items-center mb-1">
                    <Typography variant="caption" className="font-medium capitalize">
                      {queryTypeLabels[type]}
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      {count} ({percentage.toFixed(0)}%)
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
                        backgroundColor: "#1976d2",
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <Paper className="p-4 mb-4">
        <Box className="flex flex-wrap gap-3 items-center">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            Generate Queries
          </Button>

          <Button
            variant="outlined"
            startIcon={<PlayArrowIcon />}
            onClick={handleValidateBatch}
            disabled={selectedQueries.length === 0 || validateMutation.isPending}
          >
            Validate Selected ({selectedQueries.length})
          </Button>

          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Refresh
          </Button>

          <Box className="flex-1" />

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportJSON}
            size="small"
          >
            Export JSON
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            size="small"
          >
            Export CSV
          </Button>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper className="p-4 mb-4">
        <Box className="flex flex-wrap gap-3 items-center">
          <FilterListIcon className="text-gray-600" />

          <TextField
            size="small"
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
          />

          <ToggleButtonGroup
            value={filterStatus}
            exclusive
            onChange={(_, value) => value && setFilterStatus(value)}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="validated">Validated</ToggleButton>
            <ToggleButton value="unvalidated">Unvalidated</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Query Type</InputLabel>
            <Select
              value={filterQueryType}
              label="Query Type"
              onChange={(e) => setFilterQueryType(e.target.value as QueryType | "all")}
            >
              <MenuItem value="all">All Types</MenuItem>
              {(Object.keys(queryTypeLabels) as QueryType[]).map((type) => (
                <MenuItem key={type} value={type}>
                  {queryTypeLabels[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" className="text-gray-600">
            {filteredQueries.length} of {queries.length} queries
          </Typography>
        </Box>
      </Paper>

      {/* Query Table */}
      {isLoading ? (
        <Box className="flex justify-center p-8">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedQueries.length === filteredQueries.length &&
                      filteredQueries.length > 0
                    }
                    indeterminate={
                      selectedQueries.length > 0 && selectedQueries.length < filteredQueries.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" className="font-semibold">
                    Query
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" className="font-semibold">
                    Type
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" className="font-semibold">
                    Expected Page
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" className="font-semibold">
                    Status
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" className="font-semibold">
                    Match Score
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" className="font-semibold">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQueries.map((query) => (
                <TableRow
                  key={query.id}
                  hover
                  sx={{ backgroundColor: validationResults[query.id] === false ? "#fff3e0" : "" }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedQueries.includes(query.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQueries([...selectedQueries, query.id]);
                        } else {
                          setSelectedQueries(selectedQueries.filter((id) => id !== query.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{query.query}</Typography>
                    {query.createdAt && (
                      <Typography variant="caption" className="text-gray-500">
                        Created: {new Date(query.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {query.queryType && (
                      <Chip
                        label={queryTypeLabels[query.queryType]}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-mono text-xs">
                      {query.expectedPageId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {query.validated ? (
                      <Box className="flex items-center gap-1">
                        <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />
                        <Typography variant="caption" className="text-green-700">
                          Validated
                        </Typography>
                      </Box>
                    ) : validationResults[query.id] === false ? (
                      <Box className="flex items-center gap-1">
                        <ErrorIcon fontSize="small" sx={{ color: "#ff5722" }} />
                        <Typography variant="caption" className="text-orange-700">
                          Failed
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" className="text-gray-500">
                        Unvalidated
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {query.matchScore ? (
                      <Box className="flex items-center gap-2">
                        <Box
                          sx={{
                            width: 40,
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
                              width: `${query.matchScore * 100}%`,
                              backgroundColor: getScoreColor(query.matchScore),
                              borderRadius: 3,
                            }}
                          />
                        </Box>
                        <Typography variant="caption" className="font-medium">
                          {(query.matchScore * 100).toFixed(0)}%
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" className="text-gray-500">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-1">
                      <Button
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => handleValidateOne(query)}
                        disabled={validateMutation.isPending}
                      >
                        Validate
                      </Button>
                      <Button size="small" startIcon={<EditIcon />} disabled>
                        Edit
                      </Button>
                      <Button size="small" startIcon={<DeleteIcon />} color="error" disabled>
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredQueries.length === 0 && !isLoading && (
        <Alert severity="info" className="mt-4">
          No queries found matching your filters. Try adjusting your search or filters, or generate
          new queries.
        </Alert>
      )}

      {/* Generate Queries Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Synthetic Queries</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            <TextField
              fullWidth
              type="number"
              label="Number of Queries"
              value={generateCount}
              onChange={(e) => setGenerateCount(Number.parseInt(e.target.value))}
              inputProps={{ min: 1, max: 50 }}
              helperText="Generate between 1 and 50 queries"
            />

            <TextField
              fullWidth
              label="Target Page ID (Optional)"
              value={generatePageId}
              onChange={(e) => setGeneratePageId(e.target.value)}
              placeholder="Leave empty for all pages"
              helperText="Specify a page ID to generate queries for a specific page"
            />

            <Box>
              <Typography variant="subtitle2" className="mb-2">
                Query Types to Generate
              </Typography>
              <FormGroup>
                {(Object.keys(queryTypeLabels) as QueryType[]).map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={generateTypes.includes(type)}
                        onChange={() => handleToggleQueryType(type)}
                      />
                    }
                    label={queryTypeLabels[type]}
                  />
                ))}
              </FormGroup>
            </Box>

            <Alert severity="info">
              AI will generate synthetic queries based on your website's content and structure.
              Multi-modal embeddings will be used for better query generation.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generateMutation.isPending || generateTypes.length === 0}
          >
            {generateMutation.isPending ? "Generating..." : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
