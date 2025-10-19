import {
  Close as CloseIcon,
  ContentCopy,
  Edit as EditIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "~/api/service";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Layout } from "~/components/Layout";
import { MetricCard } from "~/components/MetricCard";
import { PageTabs } from "~/components/PageTabs";
import { PageTitle } from "~/components/PageTitle";
import { SkeletonCard } from "~/components/SkeletonCard";
import { WebsiteRegistrationForm } from "~/components/WebsiteRegistrationForm";
import { mockConfig } from "~/config";
import { useSystemMetrics } from "~/hooks/useSystemMetrics";
import { useWebsite } from "~/hooks/useWebsite";
import { mockApi } from "~/mocks/api";
import type { Website } from "~/types";

const tabs = [
  { label: "Overview", value: "overview", path: "/website/overview" },
  { label: "Crawl Management", value: "crawl-management", path: "/website/crawl-management" },
  { label: "Link Management", value: "links", path: "/website/links" },
  { label: "Embeddings Tester", value: "embedding-test", path: "/website/embedding-test" },
  { label: "Widget Code", value: "code", path: "/website/code" },
];

const ACTION_BUTTON_STYLE = { minWidth: 192 };

export function WebsiteOverview() {
  // For now, use the first mock website ID
  const websiteId = "mock-website-1";
  const { data: website, isLoading } = useWebsite(websiteId);
  const { data: metrics } = useSystemMetrics();
  const [isEditing, setIsEditing] = useState(false);
  const [showAppKey, setShowAppKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Prefetch navigation links for faster navigation to Link Management tab
  useEffect(() => {
    if (website) {
      queryClient.prefetchQuery({
        queryKey: ["navigationLinks", websiteId],
        queryFn: () =>
          mockConfig.enabled
            ? mockApi.getNavigationLinks(websiteId)
            : api.getNavigationLinks(websiteId),
      });
    }
  }, [website, websiteId, queryClient]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async (data: Partial<Website>) => {
    // In a real app, this would call an API to update the website
    console.log("Saving website data:", data);
    setIsEditing(false);
    // TODO: Add mutation hook to update website
  };

  const handleCopyAppKey = async () => {
    if (website?.appKey) {
      try {
        await navigator.clipboard.writeText(website.appKey);
        setCopySuccess(true);
      } catch (err) {
        console.error("Failed to copy app key:", err);
      }
    }
  };

  const handleCloseCopyNotification = () => {
    setCopySuccess(false);
  };

  const handleClose = () => {
    navigate("/");
  };

  // Transform Website data to form data structure
  const getFormData = () => {
    if (!website) return undefined;
    return {
      name: website.name,
      type: website.type,
      description: website.description || "",
      containsPII: website.containsPII || false,
      contact: {
        name: website.contact.name,
        email: website.contact.email,
        department: website.contact.department || "",
        phone: website.contact.phone || "",
      },
      domains: {
        primary: website.domains.primary,
        scannableDomains: website.domains.scannableDomains.map((d) => ({
          url: d.domain,
          isActiveForScanning: d.isActive,
          requiresCredentials: website.containsPII || false,
          credentials: { username: "", password: "" },
        })),
      },
    };
  };

  if (!isLoading && !website) {
    return (
      <Layout>
        <Box className="flex items-center justify-center min-h-screen">
          <Typography>Website not found</Typography>
        </Box>
      </Layout>
    );
  }

  if (isEditing) {
    return (
      <Layout>
        {/* Page Title */}
        <Box className="bg-gradient-to-r from-primary-700 to-primary-900 px-page md:px-6 lg:px-8 py-12">
          <Box className="max-w-7xl mx-auto">
            <PageTitle title={`Edit ${website.name}`} subtitle={website.domains.primary} />
          </Box>
        </Box>

        {/* Tabs */}
        <PageTabs tabs={tabs} />

        {/* Edit Form */}
        <WebsiteRegistrationForm
          mode="edit"
          initialData={getFormData()}
          onSubmit={handleSave}
          onCancel={handleCancel}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <ErrorBoundary>
        {/* Page Title */}
        <Box className="bg-gradient-to-r from-primary-700 to-primary-900 px-page md:px-6 lg:px-8 py-12">
          <Box className="max-w-7xl mx-auto flex justify-between items-start">
            <Box className="flex-1">
              <PageTitle title={website?.name || "Unknown"} subtitle={website?.domains?.primary} />
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
          {/* Metrics Section */}
          <Box className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <MetricCard label="Links Indexed" value="4" />
                <Tooltip
                  title={
                    website?.crawlStatus?.lastCrawl
                      ? (() => {
                          const date = new Date(website.crawlStatus.lastCrawl);
                          const month = date
                            .toLocaleString("en-US", { month: "short" })
                            .toUpperCase();
                          const day = date.getDate();
                          const hours = date.getHours();
                          const minutes = date.getMinutes().toString().padStart(2, "0");
                          const period = hours >= 12 ? "PM" : "AM";
                          const hour12 = hours % 12 || 12;
                          return `${month} ${day}, ${date.getFullYear()} at ${hour12}:${minutes}${period}`;
                        })()
                      : ""
                  }
                  arrow
                >
                  <Box>
                    <MetricCard
                      label={`Crawl Status: ${website?.crawlStatus?.status === "completed" ? "Success" : website?.crawlStatus?.status || "Pending"}`}
                      value={
                        website?.crawlStatus?.lastCrawl
                          ? (() => {
                              const date = new Date(website.crawlStatus.lastCrawl);
                              const month = date
                                .toLocaleString("en-US", { month: "short" })
                                .toUpperCase();
                              const day = date.getDate();
                              return `${month} ${day}`;
                            })()
                          : "N/A"
                      }
                    />
                  </Box>
                </Tooltip>
                <MetricCard label="Active Users" value="2" />
                <MetricCard label="Intent Match Rate" value={`${metrics?.intentMatchRate || 0}%`} />
              </>
            )}
          </Box>

          {/* Website Information Section */}
          <Paper elevation={2} className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-semibold">
                Website Information
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={ACTION_BUTTON_STYLE}
              >
                Edit
              </Button>
            </Box>

            <Box className="space-y-4">
              <Box>
                <Typography variant="body2" className="text-gray-600 mb-1">
                  Description
                </Typography>
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
                ) : (
                  <Typography variant="body1" className="text-gray-900 h-8 flex items-center">
                    {website?.description || "No description provided"}
                  </Typography>
                )}
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Application Type
                  </Typography>
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                  ) : (
                    <Chip label={website?.type || "N/A"} className="mt-0" />
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    App Key
                  </Typography>
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                  ) : (
                    <Box className="flex items-center gap-2 h-8">
                      <Typography variant="body1" className="text-gray-900 font-mono text-sm">
                        {website?.appKey
                          ? showAppKey
                            ? website.appKey
                            : "•".repeat(website.appKey.length)
                          : "N/A"}
                      </Typography>
                      <Tooltip title={showAppKey ? "Hide" : "Show"}>
                        <IconButton
                          size="small"
                          onClick={() => setShowAppKey(!showAppKey)}
                          disabled={!website?.appKey}
                        >
                          {showAppKey ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Copy to clipboard">
                        <IconButton
                          size="small"
                          onClick={handleCopyAppKey}
                          disabled={!website?.appKey}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Primary Domain
                  </Typography>
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded w-44 animate-pulse"></div>
                  ) : (
                    <Typography variant="body1" className="text-gray-900 h-8 flex items-center">
                      {website?.domains?.primary || "N/A"}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    {website?.containsPII
                      ? "Contains Sensitive Data / Alt Source to Scan"
                      : "Contains Sensitive Data"}
                  </Typography>
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded w-44 animate-pulse"></div>
                  ) : website?.containsPII ? (
                    <Box className="flex flex-wrap gap-2 items-center h-8">
                      <Chip label="Yes" size="small" />
                      <Typography variant="body2" className="text-gray-400">
                        /
                      </Typography>
                      <Chip
                        label={
                          website.domains.scannableDomains?.find((d) => d.isActive)?.domain ||
                          "Not configured"
                        }
                        size="small"
                      />
                      {website.domains.scannableDomains?.find((d) => d.isActive)?.credentials
                        ?.username && (
                        <Chip
                          label={
                            website.domains.scannableDomains.find((d) => d.isActive)?.credentials
                              ?.username
                          }
                          size="small"
                        />
                      )}
                    </Box>
                  ) : (
                    <Box className="h-8 flex items-center">
                      <Chip label="No" size="small" />
                    </Box>
                  )}
                </Box>
              </Box>
              <Typography variant="subtitle2" className="text-gray-700 mt-4 mb-2">
                Contact Information
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Name
                  </Typography>
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                  ) : (
                    <Typography variant="body1" className="text-gray-900 h-8 flex items-center">
                      {website?.contact?.name || "N/A"}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Email
                  </Typography>
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
                  ) : (
                    <Typography variant="body1" className="text-gray-900 h-8 flex items-center">
                      {website?.contact?.email || "N/A"}
                    </Typography>
                  )}
                </Box>
                {(isLoading || website?.contact?.phone) && (
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Phone
                    </Typography>
                    {isLoading ? (
                      <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
                    ) : (
                      <Typography variant="body1" className="text-gray-900 h-8 flex items-center">
                        {website.contact.phone}
                      </Typography>
                    )}
                  </Box>
                )}
                {(isLoading || website?.contact?.department) && (
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-1">
                      Department
                    </Typography>
                    {isLoading ? (
                      <div className="h-8 bg-gray-200 rounded w-36 animate-pulse"></div>
                    ) : (
                      <Typography variant="body1" className="text-gray-900 h-8 flex items-center">
                        {website.contact.department}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Created At
                  </Typography>
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
                  ) : (
                    <Typography variant="body1" className="text-gray-900 h-8 flex items-center">
                      {website?.createdAt ? new Date(website.createdAt).toLocaleString() : "N/A"}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" className="text-gray-600 mb-1">
                    Last Updated
                  </Typography>
                  {isLoading ? (
                    <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
                  ) : (
                    <Typography variant="body1" className="text-gray-900 h-8 flex items-center">
                      {website?.updatedAt ? new Date(website.updatedAt).toLocaleString() : "N/A"}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Search Configuration Section */}
          <Paper elevation={2} className="p-6">
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-semibold">
                Search Configuration
              </Typography>
              <Button
                variant="outlined"
                component={Link}
                to="/website/embedding-test"
                sx={ACTION_BUTTON_STYLE}
              >
                Test & Configure
              </Button>
            </Box>

            {website?.searchConfiguration?.weights ? (
              <Box className="space-y-4">
                <Typography variant="body2" className="text-gray-600 mb-3">
                  6-Embedding weights for semantic search
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      Functionality
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="flex-1 bg-gray-200 rounded-full h-2">
                        <Box
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${Math.round(website.searchConfiguration.weights.functionality * 100)}%`,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" className="font-semibold min-w-[3ch]">
                        {Math.round(website.searchConfiguration.weights.functionality * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      Content
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="flex-1 bg-gray-200 rounded-full h-2">
                        <Box
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${Math.round(website.searchConfiguration.weights.content * 100)}%`,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" className="font-semibold min-w-[3ch]">
                        {Math.round(website.searchConfiguration.weights.content * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      Purpose
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="flex-1 bg-gray-200 rounded-full h-2">
                        <Box
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.round(website.searchConfiguration.weights.purpose * 100)}%`,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" className="font-semibold min-w-[3ch]">
                        {Math.round(website.searchConfiguration.weights.purpose * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      Action
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="flex-1 bg-gray-200 rounded-full h-2">
                        <Box
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.round(website.searchConfiguration.weights.action * 100)}%`,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" className="font-semibold min-w-[3ch]">
                        {Math.round(website.searchConfiguration.weights.action * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      Data Context
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="flex-1 bg-gray-200 rounded-full h-2">
                        <Box
                          className="bg-orange-600 h-2 rounded-full"
                          style={{
                            width: `${Math.round(website.searchConfiguration.weights.dataContext * 100)}%`,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" className="font-semibold min-w-[3ch]">
                        {Math.round(website.searchConfiguration.weights.dataContext * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      User Task
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="flex-1 bg-gray-200 rounded-full h-2">
                        <Box
                          className="bg-pink-600 h-2 rounded-full"
                          style={{
                            width: `${Math.round(website.searchConfiguration.weights.userTask * 100)}%`,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" className="font-semibold min-w-[3ch]">
                        {Math.round(website.searchConfiguration.weights.userTask * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                {website.searchConfiguration.updatedAt && (
                  <Typography variant="caption" className="text-gray-500 block mt-2">
                    Last updated: {new Date(website.searchConfiguration.updatedAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            ) : (
              <Alert severity="warning">
                No search weights configured. Visit the Embeddings Tester to set up optimized
                6-embedding weights for this website.
              </Alert>
            )}
          </Paper>
        </Box>

        {/* Copy success notification */}
        <Snackbar
          open={copySuccess}
          autoHideDuration={3000}
          onClose={handleCloseCopyNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={handleCloseCopyNotification} severity="success" sx={{ width: "100%" }}>
            App Key copied to clipboard!
          </Alert>
        </Snackbar>
      </ErrorBoundary>
    </Layout>
  );
}
