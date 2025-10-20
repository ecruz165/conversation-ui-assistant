import {
  Add as AddIcon,
  CheckCircle,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Error,
  HourglassEmpty,
  Pending,
  Search as SearchIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  LinearProgress,
  Table as MuiTable,
  Paper,
  Snackbar,
  Switch,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  type GroupingState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "~/components/Layout";
import { LinkDetailDialog } from "~/components/LinkDetailDialog";
import { LinkForm } from "~/components/LinkForm";
import { PageTabs } from "~/components/PageTabs";
import { useDebounce } from "~/hooks";
import {
  useBulkDelete,
  useBulkUpdateActive,
  useCreateLink,
  useDeleteLink,
  useUpdateLink,
} from "~/hooks/useNavigationLinkMutations";
import { useNavigationLinks } from "~/hooks/useNavigationLinks";
import { useWebsite } from "~/hooks/useWebsite";
import type { NavigationLink } from "~/types";

const tabs = [
  { label: "Overview", value: "overview", path: "/website/overview" },
  { label: "Crawl Management", value: "crawl-management", path: "/website/crawl-management" },
  { label: "Link Management", value: "links", path: "/website/links" },
  { label: "Embeddings Tester", value: "embedding-test", path: "/website/embedding-test" },
  { label: "Widget Code", value: "code", path: "/website/code" },
];

export function LinkManagement() {
  const websiteId = "mock-website-1";
  const { data: website, isLoading: websiteLoading } = useWebsite(websiteId);
  const { data: links = [], isLoading: linksLoading } = useNavigationLinks(websiteId);
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<NavigationLink | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchInput, setSearchInput] = useState("");
  const globalFilter = useDebounce(searchInput, 300); // Debounce search input
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Filter state - array for multiple selections with OR logic
  const [activeFilters, setActiveFilters] = useState<
    Array<"active" | "inactive" | "has_embeddings" | "no_embeddings" | "bookmarkable" | "journey">
  >([]);

  // Bulk operations state
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Notification state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Mutation hooks
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const bulkUpdateActive = useBulkUpdateActive();
  const bulkDeleteMutation = useBulkDelete();

  // Toggle filter selection (OR logic)
  const handleFilterToggle = (
    filter: "active" | "inactive" | "has_embeddings" | "no_embeddings" | "bookmarkable" | "journey"
  ) => {
    setActiveFilters((prev) => {
      const newFilters = prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter];
      return newFilters;
    });
  };

  // Clear all filters and search
  const handleClearFilters = () => {
    setActiveFilters([]);
    setSearchInput("");
  };

  // Filter links based on active filters (OR logic)
  const filteredLinks = useMemo(() => {
    if (activeFilters.length === 0) {
      return links;
    }

    return links.filter((link) => {
      return activeFilters.some((filter) => {
        switch (filter) {
          case "active":
            return link.isActive === true;
          case "inactive":
            return link.isActive === false;
          case "has_embeddings":
            return link.embeddingStatus === "completed";
          case "no_embeddings":
            return link.embeddingStatus !== "completed";
          case "bookmarkable":
            return link.isBookmarkable === true;
          case "journey":
            return link.isBookmarkable === false;
          default:
            return false;
        }
      });
    });
  }, [links, activeFilters]);

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

  const columns: ColumnDef<NavigationLink>[] = [
    ...(bulkMode
      ? [
          {
            id: "select",
            header: ({ table }) => (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <Checkbox
                  checked={table.getIsAllRowsSelected()}
                  indeterminate={table.getIsSomeRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                  size="small"
                />
              </motion.div>
            ),
            cell: ({ row }) => (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, delay: 0.05 }}
              >
                <Checkbox
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  onChange={row.getToggleSelectedHandler()}
                  onClick={(e) => e.stopPropagation()}
                  size="small"
                />
              </motion.div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "displayName",
      header: "Page/View Name",
      cell: ({ row }) => (
        <Tooltip
          title={row.original.isBookmarkable ? "Bookmarkable" : "Journey"}
          placement="top"
          arrow
        >
          <Box
            sx={{
              borderLeft: 4,
              borderColor: row.original.isBookmarkable ? "success.main" : "info.main",
              pl: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "48px",
            }}
          >
            <Typography variant="body2" className="font-medium">
              {row.original.displayName}
            </Typography>
            {row.original.description && (
              <Typography variant="caption" className="text-gray-600">
                {row.original.description}
              </Typography>
            )}
          </Box>
        </Tooltip>
      ),
    },
    {
      accessorKey: "targetUrl",
      header: "Link",
      cell: ({ getValue }) => {
        const url = getValue<string>();
        // Split URL by parameters (text within curly braces)
        // Handles both path params (/users/{id}) and query params (?search={term})
        const parts = url.split(/(\{[^}]+\})/);

        return (
          <Typography variant="body2" className="font-mono text-xs">
            {parts.map((part, index) => {
              // Check if this part is a parameter
              if (part.match(/^\{[^}]+\}$/)) {
                return (
                  <span key={index} className="font-bold text-primary-600">
                    {part}
                  </span>
                );
              }
              return <span key={index}>{part}</span>;
            })}
          </Typography>
        );
      },
    },
    {
      accessorKey: "embeddingStatus",
      header: "Embedding",
      cell: ({ row }) => (
        <Box className="flex items-center gap-1">
          {getStatusIcon(row.original.embeddingStatus)}
          {row.original.embeddingStatus === "processing" && <LinearProgress className="w-16" />}
        </Box>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onChange={(e) => {
            e.stopPropagation();
            handleToggleActive(row.original.id, row.original.isActive);
          }}
          onClick={(e) => e.stopPropagation()}
          size="small"
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Box className="flex gap-1">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditLink(row.original);
            }}
            title="Edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLink(row.original.id);
            }}
            color="error"
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredLinks,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      grouping,
      rowSelection,
    },
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableGrouping: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGroupingChange: setGrouping,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchableFields = [row.original.displayName, row.original.targetUrl];
      return searchableFields.some((field) =>
        field?.toLowerCase().includes(filterValue.toLowerCase())
      );
    },
    getRowId: (row) => row.id,
  });

  const handleAddLink = () => {
    setSelectedLink(null);
    setEditMode(false);
    setFormOpen(true);
  };

  const handleEditLink = (link: NavigationLink) => {
    setSelectedLink(link);
    setEditMode(true);
    setDetailOpen(false);
    setFormOpen(true);
  };

  const handleViewLink = (link: NavigationLink) => {
    setSelectedLink(link);
    setDetailOpen(true);
  };

  const handleDeleteLink = (linkId: string) => {
    deleteLink.mutate(
      { linkId },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: "Link deleted successfully",
            severity: "success",
          });
        },
        onError: (error) => {
          setSnackbar({
            open: true,
            message: `Failed to delete link: ${error.message}`,
            severity: "error",
          });
        },
      }
    );
  };

  const handleToggleActive = (linkId: string, currentStatus: boolean) => {
    updateLink.mutate(
      {
        linkId,
        data: { id: linkId, websiteId, isActive: !currentStatus },
      },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: `Link ${!currentStatus ? "activated" : "deactivated"} successfully`,
            severity: "success",
          });
        },
        onError: (error) => {
          setSnackbar({
            open: true,
            message: `Failed to update link: ${error.message}`,
            severity: "error",
          });
        },
      }
    );
  };

  const handleFormSubmit = async (data: Partial<NavigationLink>) => {
    if (editMode && selectedLink) {
      // Update existing link
      updateLink.mutate(
        {
          linkId: selectedLink.id,
          data: { ...data, id: selectedLink.id, websiteId },
        },
        {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: "Link updated successfully",
              severity: "success",
            });
            setFormOpen(false);
          },
          onError: (error) => {
            setSnackbar({
              open: true,
              message: `Failed to update link: ${error.message}`,
              severity: "error",
            });
          },
        }
      );
    } else {
      // Create new link
      createLink.mutate(
        {
          websiteId,
          data,
        },
        {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: "Link created successfully",
              severity: "success",
            });
            setFormOpen(false);
          },
          onError: (error) => {
            setSnackbar({
              open: true,
              message: `Failed to create link: ${error.message}`,
              severity: "error",
            });
          },
        }
      );
    }
  };

  // Bulk operations handlers
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleBulkActivate = () => {
    const selectedIds = selectedRows.map((row) => row.original.id);
    bulkUpdateActive.mutate(
      { linkIds: selectedIds, isActive: true },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: `${selectedIds.length} ${selectedIds.length === 1 ? "link" : "links"} activated successfully`,
            severity: "success",
          });
          setRowSelection({});
        },
        onError: (error) => {
          setSnackbar({
            open: true,
            message: `Failed to activate links: ${error.message}`,
            severity: "error",
          });
        },
      }
    );
  };

  const handleBulkDeactivate = () => {
    const selectedIds = selectedRows.map((row) => row.original.id);
    bulkUpdateActive.mutate(
      { linkIds: selectedIds, isActive: false },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: `${selectedIds.length} ${selectedIds.length === 1 ? "link" : "links"} deactivated successfully`,
            severity: "success",
          });
          setRowSelection({});
        },
        onError: (error) => {
          setSnackbar({
            open: true,
            message: `Failed to deactivate links: ${error.message}`,
            severity: "error",
          });
        },
      }
    );
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = () => {
    const selectedIds = selectedRows.map((row) => row.original.id);
    bulkDeleteMutation.mutate(
      { linkIds: selectedIds },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: `${selectedIds.length} ${selectedIds.length === 1 ? "link" : "links"} deleted successfully`,
            severity: "success",
          });
          setBulkDeleteDialogOpen(false);
          setRowSelection({});
        },
        onError: (error) => {
          setSnackbar({
            open: true,
            message: `Failed to delete links: ${error.message}`,
            severity: "error",
          });
        },
      }
    );
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialogOpen(false);
  };

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setRowSelection({}); // Clear selection when toggling bulk mode
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (websiteLoading || linksLoading) {
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
          <Box>
            <Typography variant="h4" className="font-bold text-white">
              {website.name}
            </Typography>
            <Typography variant="body1" className="mt-2 text-white/90">
              {website.domains.primary}
            </Typography>
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
            <Box className="flex gap-2">
              <Button
                variant={bulkMode ? "contained" : "outlined"}
                onClick={handleToggleBulkMode}
                sx={{ minWidth: "120px" }}
              >
                {bulkMode ? "Exit Bulk" : "Bulk"}
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddLink}
                sx={{ minWidth: "120px" }}
              >
                Add Link
              </Button>
            </Box>
          </Box>

          {/* Bulk Operations Toolbar */}
          <AnimatePresence mode="wait">
            {bulkMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="mb-4"
              >
                <Box
                  className="px-3 rounded flex items-center justify-between"
                  sx={{
                    height: "48px",
                    bgcolor: "primary.50",
                    border: 1,
                    borderColor: "rgba(0, 0, 0, 0.23)",
                    "&:hover": {
                      borderColor: "rgba(0, 0, 0, 0.87)",
                    },
                  }}
                >
                  <Box className="flex items-center gap-2">
                    <Typography
                      variant="body2"
                      className="font-medium"
                      sx={{ color: "primary.main" }}
                    >
                      {selectedCount > 0
                        ? `${selectedCount} ${selectedCount === 1 ? "item" : "items"} selected`
                        : "No items selected"}
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ToggleOnIcon />}
                      onClick={handleBulkActivate}
                      disabled={selectedCount === 0}
                      sx={{ fontSize: "0.8125rem", py: 0.5, minHeight: "unset" }}
                    >
                      Activate
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ToggleOffIcon />}
                      onClick={handleBulkDeactivate}
                      disabled={selectedCount === 0}
                      sx={{ fontSize: "0.8125rem", py: 0.5, minHeight: "unset" }}
                    >
                      Deactivate
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleBulkDeleteClick}
                      disabled={selectedCount === 0}
                      sx={{ fontSize: "0.8125rem", py: 0.5, minHeight: "unset" }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Filter Controls */}
          <Box className="mb-6">
            <Box className="flex flex-col gap-3">
              {/* Search Input */}
              <TextField
                fullWidth
                placeholder="Search by name or link..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "48px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Filter Buttons */}
              <Box className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                <Button
                  variant={activeFilters.length === 0 ? "contained" : "outlined"}
                  size="small"
                  onClick={handleClearFilters}
                  sx={{ py: 0.25, minHeight: "unset", fontSize: "0.8125rem" }}
                >
                  All
                </Button>
                <Button
                  variant={activeFilters.includes("bookmarkable") ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleFilterToggle("bookmarkable")}
                  sx={{ py: 0.25, minHeight: "unset", fontSize: "0.8125rem" }}
                >
                  Bookmarkable
                </Button>
                <Button
                  variant={activeFilters.includes("journey") ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleFilterToggle("journey")}
                  sx={{ py: 0.25, minHeight: "unset", fontSize: "0.8125rem" }}
                >
                  Journey
                </Button>
                <Button
                  variant={activeFilters.includes("has_embeddings") ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleFilterToggle("has_embeddings")}
                  sx={{ py: 0.25, minHeight: "unset", fontSize: "0.8125rem" }}
                >
                  Has Embeddings
                </Button>
                <Button
                  variant={activeFilters.includes("no_embeddings") ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleFilterToggle("no_embeddings")}
                  sx={{ py: 0.25, minHeight: "unset", fontSize: "0.8125rem" }}
                >
                  No Embeddings
                </Button>
                <Button
                  variant={activeFilters.includes("active") ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleFilterToggle("active")}
                  sx={{ py: 0.25, minHeight: "unset", fontSize: "0.8125rem" }}
                >
                  Active
                </Button>
                <Button
                  variant={activeFilters.includes("inactive") ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleFilterToggle("inactive")}
                  sx={{ py: 0.25, minHeight: "unset", fontSize: "0.8125rem" }}
                >
                  Inactive
                </Button>
              </Box>
            </Box>
          </Box>

          {!filteredLinks || filteredLinks.length === 0 ? (
            <Box className="text-center py-12">
              <Typography variant="body1" className="text-gray-600">
                {activeFilters.length > 0
                  ? "No links match the selected filters"
                  : "No navigation links configured yet"}
              </Typography>
              {activeFilters.length > 0 ? (
                <Button variant="outlined" onClick={handleClearFilters} className="mt-4">
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddLink}
                  className="mt-4"
                >
                  Add Your First Link
                </Button>
              )}
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
                            : flexRender(header.column.columnDef.header, header.getContext())}
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
                      sx={{ cursor: "pointer" }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} sx={{ height: "48px", minHeight: "48px" }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
        mode={editMode ? "edit" : "create"}
      />

      {/* Link Detail Dialog */}
      <LinkDetailDialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        link={selectedLink}
        onEdit={handleEditLink}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteCancel}
        aria-labelledby="bulk-delete-dialog-title"
        aria-describedby="bulk-delete-dialog-description"
      >
        <DialogTitle id="bulk-delete-dialog-title">Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="bulk-delete-dialog-description">
            Are you sure you want to delete {selectedCount} selected{" "}
            {selectedCount === 1 ? "link" : "links"}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleBulkDeleteCancel}
            color="inherit"
            disabled={bulkDeleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkDeleteConfirm}
            color="error"
            variant="contained"
            disabled={bulkDeleteMutation.isPending}
          >
            {bulkDeleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
