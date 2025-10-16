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
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "~/components/ErrorBoundary";
import { Layout } from "~/components/Layout";
import { MetricCard } from "~/components/MetricCard";
import { PageTabs } from "~/components/PageTabs";
import { PageTitle } from "~/components/PageTitle";
import { SkeletonCard } from "~/components/SkeletonCard";
import { WebsiteRegistrationForm } from "~/components/WebsiteRegistrationForm";
import { useSystemMetrics } from "~/hooks/useSystemMetrics";
import { useWebsite } from "~/hooks/useWebsite";
import type { Website } from "~/types";

const tabs = [
  { label: "Overview", value: "overview", path: "/website/overview" },
  { label: "Link Management", value: "links", path: "/website/links" },
  { label: "Widget Code", value: "code", path: "/website/code" },
  { label: "Embeddings Tester", value: "embedding-test", path: "/website/embedding-test" },
  { label: "Crawl Management", value: "crawl-management", path: "/website/crawl-management" },
];

export function WebsiteOverview() {
  // For now, use the first mock website ID
  const websiteId = "mock-website-1";
  const { data: website, isLoading } = useWebsite(websiteId);
  const { data: metrics } = useSystemMetrics();
  const [isEditing, setIsEditing] = useState(false);
  const [showAppKey, setShowAppKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();

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
          requiresCredentials: false,
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
                <MetricCard
                  label={`Crawl Status: ${website?.crawlStatus?.status === "completed" ? "Success" : website?.crawlStatus?.status || "Pending"}`}
                  value={
                    website?.crawlStatus?.lastCrawl
                      ? new Date(website.crawlStatus.lastCrawl).toLocaleDateString()
                      : "N/A"
                  }
                />
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
              <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEdit}>
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
                    <Chip label={website?.type || "N/A"} className="mt-1" />
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
                  <Typography variant="body2" className="text-gray-600 mb-2">
                    Scannable Domain
                  </Typography>
                  {isLoading ? (
                    <div className="flex flex-wrap gap-2">
                      <div className="h-7 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-7 bg-gray-200 rounded w-36 animate-pulse"></div>
                    </div>
                  ) : (
                    <Box className="flex flex-wrap gap-2">
                      {website?.domains?.scannableDomains
                        ?.filter((d) => d.isActive)
                        .map((domainObj, index) => (
                          <Chip key={index} label={domainObj.domain} variant="outlined" />
                        ))}
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
