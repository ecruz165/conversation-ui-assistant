import {
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "~/components/Layout";
import { PageTabs } from "~/components/PageTabs";
import { PageTitle } from "~/components/PageTitle";
import { useWebsite } from "~/hooks/useWebsite";

type CrawlFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "manual";

type CrawlStatus = "completed" | "in-progress" | "failed" | "cancelled";

interface CrawlHistoryEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: CrawlStatus;
  pagesIndexed: number;
  changes: number;
  duration?: number; // in seconds
}

// Mock crawl history data
const mockCrawlHistory: CrawlHistoryEntry[] = [
  {
    id: "1",
    startTime: new Date("2025-01-15T14:30:00"),
    endTime: new Date("2025-01-15T14:35:42"),
    status: "completed",
    pagesIndexed: 142,
    changes: 12,
    duration: 342,
  },
  {
    id: "2",
    startTime: new Date("2025-01-14T09:00:00"),
    endTime: new Date("2025-01-14T09:04:18"),
    status: "completed",
    pagesIndexed: 138,
    changes: 5,
    duration: 258,
  },
  {
    id: "3",
    startTime: new Date("2025-01-13T09:00:00"),
    endTime: new Date("2025-01-13T09:03:45"),
    status: "failed",
    pagesIndexed: 87,
    changes: 0,
    duration: 225,
  },
  {
    id: "4",
    startTime: new Date("2025-01-12T09:00:00"),
    endTime: new Date("2025-01-12T09:05:15"),
    status: "completed",
    pagesIndexed: 135,
    changes: 8,
    duration: 315,
  },
  {
    id: "5",
    startTime: new Date("2025-01-11T09:00:00"),
    status: "cancelled",
    pagesIndexed: 45,
    changes: 0,
    duration: 90,
  },
];

const tabs = [
  { label: "Overview", value: "overview", path: "/website/overview" },
  { label: "Crawl Management", value: "crawl-management", path: "/website/crawl-management" },
  { label: "Link Management", value: "links", path: "/website/links" },
  { label: "Embeddings Tester", value: "embedding-test", path: "/website/embedding-test" },
  { label: "Widget Code", value: "code", path: "/website/code" },
];

const ACTION_BUTTON_STYLE = { minWidth: 192 };
const SECTION_DESCRIPTION_CLASS = "text-gray-600 mb-4 pb-2";

export function CrawlManagement() {
  const websiteId = "mock-website-1";
  const { data: website, isLoading } = useWebsite(websiteId);
  const navigate = useNavigate();

  // Schedule form state
  const [frequency, setFrequency] = useState<CrawlFrequency>("manual");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 0 = Sunday, 1 = Monday, etc.
  const [timezone, setTimezone] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [scheduleActive, setScheduleActive] = useState(false);

  // Track initial schedule values
  const [initialSchedule, setInitialSchedule] = useState({
    frequency: "manual",
    scheduledTime: "09:00",
    dayOfWeek: 1,
  });
  const hasScheduleChanges =
    frequency !== initialSchedule.frequency ||
    scheduledTime !== initialSchedule.scheduledTime ||
    dayOfWeek !== initialSchedule.dayOfWeek;

  // Configuration form state
  const [crawlDepth, setCrawlDepth] = useState<number>(3);
  const [maxPages, setMaxPages] = useState<number>(100);
  const [depthError, setDepthError] = useState<string>("");
  const [maxPagesError, setMaxPagesError] = useState<string>("");
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // Track initial config values
  const [initialConfig, setInitialConfig] = useState({ crawlDepth: 3, maxPages: 100 });
  const hasConfigChanges =
    crawlDepth !== initialConfig.crawlDepth || maxPages !== initialConfig.maxPages;

  // Crawl history table state
  const [crawlHistory, setCrawlHistory] = useState<CrawlHistoryEntry[]>(mockCrawlHistory);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof CrawlHistoryEntry>("startTime");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [isStartingCrawl, setIsStartingCrawl] = useState(false);

  // Detect timezone on mount
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detectedTimezone);
  }, []);

  const handleClose = () => {
    navigate("/");
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would call an API to save the schedule
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Saving schedule:", { frequency, scheduledTime, dayOfWeek, timezone });
      setScheduleActive(frequency !== "manual");
      // Update initial values to match current values after successful save
      setInitialSchedule({ frequency, scheduledTime, dayOfWeek });
    } catch (error) {
      console.error("Failed to save schedule:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get day name from number
  const getDayName = (dayNum: number): string => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum];
  };

  // Convert 24-hour time to 12-hour format for display
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Validate crawl depth
  const validateCrawlDepth = (value: number): string => {
    if (value < 1) return "Crawl depth must be at least 1";
    if (value > 10) return "Crawl depth cannot exceed 10";
    return "";
  };

  // Validate max pages
  const validateMaxPages = (value: number): string => {
    if (value < 10) return "Max pages must be at least 10";
    if (value > 10000) return "Max pages cannot exceed 10,000";
    return "";
  };

  // Handle crawl depth change
  const handleCrawlDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setCrawlDepth(value);
      setDepthError(validateCrawlDepth(value));
    }
  };

  // Handle max pages change
  const handleMaxPagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setMaxPages(value);
      setMaxPagesError(validateMaxPages(value));
    }
  };

  // Save configuration
  const handleSaveConfiguration = async () => {
    // Validate before saving
    const depthErr = validateCrawlDepth(crawlDepth);
    const pagesErr = validateMaxPages(maxPages);

    if (depthErr || pagesErr) {
      setDepthError(depthErr);
      setMaxPagesError(pagesErr);
      return;
    }

    setIsSavingConfig(true);
    try {
      // In a real app, this would call an API to save the configuration
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Saving configuration:", { crawlDepth, maxPages });
      setConfigSaved(true);
      // Update initial values to match current values after successful save
      setInitialConfig({ crawlDepth, maxPages });
    } catch (error) {
      console.error("Failed to save configuration:", error);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Format duration as 'Xm Ys'
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "-";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  // Get status badge color and label
  const getStatusBadge = (status: CrawlStatus) => {
    switch (status) {
      case "completed":
        return (
          <Chip
            label="Completed"
            color="success"
            size="small"
            sx={{ color: "white", minWidth: 84 }}
          />
        );
      case "in-progress":
        return (
          <Chip
            label="In Progress"
            color="info"
            size="small"
            icon={<CircularProgress size={14} sx={{ color: "white" }} />}
          />
        );
      case "failed":
        return <Chip label="Failed" color="error" size="small" sx={{ minWidth: 84 }} />;
      case "cancelled":
        return <Chip label="Cancelled" color="default" size="small" />;
    }
  };

  // Handle table sorting
  const handleRequestSort = (property: keyof CrawlHistoryEntry) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  // Start crawl
  const handleStartCrawl = async () => {
    setIsStartingCrawl(true);
    try {
      // In a real app, this would call an API to start a crawl
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Starting crawl...");
      // Add new in-progress crawl to history
      const newCrawl: CrawlHistoryEntry = {
        id: `${Date.now()}`,
        startTime: new Date(),
        status: "in-progress",
        pagesIndexed: 0,
        changes: 0,
      };
      setCrawlHistory([newCrawl, ...crawlHistory]);
    } catch (error) {
      console.error("Failed to start crawl:", error);
    } finally {
      setIsStartingCrawl(false);
    }
  };

  // Check if there's an active crawl
  const hasActiveCrawl = crawlHistory.some((entry) => entry.status === "in-progress");

  // Sort and paginate data
  const sortedHistory = [...crawlHistory].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    if (aValue < bValue) return order === "asc" ? -1 : 1;
    if (aValue > bValue) return order === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedHistory = sortedHistory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        {/* Crawl Schedule Section */}
        <Paper elevation={2} className="p-6">
          <Box className="flex items-center gap-2 mb-4">
            <CalendarIcon color="primary" />
            <Typography variant="h6" className="font-semibold">
              Crawl Schedule
            </Typography>
          </Box>
          <Typography variant="body2" className={SECTION_DESCRIPTION_CLASS}>
            Configure when and how often your website should be crawled to keep your content index
            and embeddings up to date.
          </Typography>

          {/* Active Schedule Status Banner */}
          {scheduleActive && (
            <Alert severity="success" className="mb-4">
              Active Schedule: {frequency.charAt(0).toUpperCase() + frequency.slice(1)} crawl
              {(frequency === "weekly" || frequency === "biweekly" || frequency === "monthly") && (
                <> on {getDayName(dayOfWeek)}s</>
              )}{" "}
              at {formatTime12Hour(scheduledTime)} ({timezone})
            </Alert>
          )}

          <Divider className="my-4" />

          {/* Schedule Form */}
          <Box className="space-y-4">
            {/* Frequency Selector */}
            <FormControl fullWidth>
              <InputLabel id="frequency-label">Crawl Frequency</InputLabel>
              <Select
                labelId="frequency-label"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as CrawlFrequency)}
                label="Crawl Frequency"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="biweekly">Bi-weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="manual">Manual Only</MenuItem>
              </Select>
            </FormControl>

            {/* Day of Week Selector - Shown for Weekly, Bi-weekly, and Monthly */}
            {(frequency === "weekly" || frequency === "biweekly" || frequency === "monthly") && (
              <FormControl fullWidth>
                <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                <Select
                  labelId="day-of-week-label"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value as number)}
                  label="Day of Week"
                >
                  <MenuItem value={0}>Sunday</MenuItem>
                  <MenuItem value={1}>Monday</MenuItem>
                  <MenuItem value={2}>Tuesday</MenuItem>
                  <MenuItem value={3}>Wednesday</MenuItem>
                  <MenuItem value={4}>Thursday</MenuItem>
                  <MenuItem value={5}>Friday</MenuItem>
                  <MenuItem value={6}>Saturday</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Time Picker - Hidden when Manual Only */}
            {frequency !== "manual" && (
              <>
                <TextField
                  fullWidth
                  type="time"
                  label="Scheduled Time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText={`Time in ${timezone} (${formatTime12Hour(scheduledTime)})`}
                />
              </>
            )}

            {/* Save Button */}
            <Box className="flex justify-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSchedule}
                disabled={isSaving || !hasScheduleChanges}
                sx={ACTION_BUTTON_STYLE}
              >
                {isSaving ? "Saving..." : hasScheduleChanges ? "Save Changes" : "Save Schedule"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Crawl Configuration Section */}
        <Paper elevation={2} className="p-6">
          <Box className="flex items-center gap-2 mb-4">
            <SettingsIcon color="primary" />
            <Typography variant="h6" className="font-semibold">
              Crawl Configuration
            </Typography>
          </Box>
          <Typography variant="body2" className={SECTION_DESCRIPTION_CLASS}>
            Set crawl parameters including depth limits, URL patterns, and content filters to
            optimize your website indexing.
          </Typography>

          {/* Last Crawl Status Banner */}
          {website?.crawlStatus?.lastCrawl && (
            <Alert severity="info" className="mb-4">
              Last crawl: {new Date(website.crawlStatus.lastCrawl).toLocaleString()} •{" "}
              {website.crawlStatus.pagesIndexed} pages indexed • Status:{" "}
              {website.crawlStatus.status}
            </Alert>
          )}

          {/* Configuration Saved Banner */}
          {configSaved && (
            <Alert severity="success" className="mb-4">
              Configuration saved successfully! Changes will take effect on the next crawl.
            </Alert>
          )}

          <Divider className="my-4" />

          {/* Configuration Form */}
          <Box className="space-y-4">
            {/* Two-column grid on desktop, single column on mobile */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crawl Depth Input */}
              <TextField
                fullWidth
                type="number"
                label="Crawl Depth"
                value={crawlDepth}
                onChange={handleCrawlDepthChange}
                error={!!depthError}
                helperText={depthError || "Maximum link depth to follow (1-10)"}
                inputProps={{
                  min: 1,
                  max: 10,
                }}
              />

              {/* Max Pages Input */}
              <TextField
                fullWidth
                type="number"
                label="Maximum Pages"
                value={maxPages}
                onChange={handleMaxPagesChange}
                error={!!maxPagesError}
                helperText={maxPagesError || "Maximum number of pages to index (10-10,000)"}
                inputProps={{
                  min: 10,
                  max: 10000,
                }}
              />
            </Box>

            {/* Save Button */}
            <Box className="flex justify-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveConfiguration}
                disabled={isSavingConfig || !hasConfigChanges || !!depthError || !!maxPagesError}
                sx={ACTION_BUTTON_STYLE}
              >
                {isSavingConfig
                  ? "Saving..."
                  : hasConfigChanges
                    ? "Save Changes"
                    : "Save Configuration"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Crawl History Section */}
        <Paper elevation={2} className="p-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <HistoryIcon color="primary" />
              <Typography variant="h6" className="font-semibold">
                Crawl History
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartCrawl}
              disabled={hasActiveCrawl || isStartingCrawl}
              sx={ACTION_BUTTON_STYLE}
            >
              {isStartingCrawl ? "Starting..." : "Start Crawl"}
            </Button>
          </Box>
          <Typography variant="body2" className={SECTION_DESCRIPTION_CLASS}>
            View past crawl operations, their results, and any errors or warnings that occurred
            during indexing.
          </Typography>

          <Divider className="my-4" />

          {/* History Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "startTime"}
                      direction={orderBy === "startTime" ? order : "asc"}
                      onClick={() => handleRequestSort("startTime")}
                    >
                      Date & Time
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "status"}
                      direction={orderBy === "status" ? order : "asc"}
                      onClick={() => handleRequestSort("status")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "pagesIndexed"}
                      direction={orderBy === "pagesIndexed" ? order : "asc"}
                      onClick={() => handleRequestSort("pagesIndexed")}
                    >
                      Pages
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "duration"}
                      direction={orderBy === "duration" ? order : "asc"}
                      onClick={() => handleRequestSort("duration")}
                    >
                      Duration
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">
                    <TableSortLabel
                      active={orderBy === "changes"}
                      direction={orderBy === "changes" ? order : "asc"}
                      onClick={() => handleRequestSort("changes")}
                    >
                      Changes
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedHistory.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>{entry.startTime.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell align="right">{entry.pagesIndexed}</TableCell>
                    <TableCell>{formatDuration(entry.duration)}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: entry.changes > 0 ? "success.main" : "text.secondary",
                          fontWeight: entry.changes > 0 ? "bold" : "normal",
                        }}
                      >
                        {entry.changes > 0 ? `+${entry.changes}` : entry.changes}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={crawlHistory.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Layout>
  );
}
