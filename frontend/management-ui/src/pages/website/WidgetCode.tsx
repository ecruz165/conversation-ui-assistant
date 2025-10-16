import { Close as CloseIcon, ContentCopy as CopyIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Snackbar,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Layout } from "~/components/Layout";
import { PageTabs } from "~/components/PageTabs";
import { useWebsite } from "~/hooks/useWebsite";

type IntegrationMethod = "script" | "npm" | "webcomponent";

const tabs = [
  { label: "Overview", value: "overview", path: "/website/overview" },
  { label: "Link Management", value: "links", path: "/website/links" },
  { label: "Widget Code", value: "code", path: "/website/code" },
  { label: "Embeddings Tester", value: "embedding-test", path: "/website/embedding-test" },
  { label: "Crawl Management", value: "crawl-management", path: "/website/crawl-management" },
];

// Code generation functions for Web Component
function generateScriptTagCode(websiteId: string, apiKey: string): string {
  return `<!-- Access 360 Chat Widget (Web Component) -->
<script type="module" src="https://cdn.access360.example.com/widget.js"></script>

<!-- Add the widget to your page -->
<access360-chat-widget
  website-id="${websiteId}"
  api-key="${apiKey}"
  position="bottom-right"
  theme="auto">
</access360-chat-widget>`;
}

function generateNpmCode(websiteId: string, apiKey: string): string {
  return `// Install the package
npm install @access360/chat-widget

// Import the web component (registers custom element)
import '@access360/chat-widget';

// Add to your HTML or create programmatically
const widget = document.createElement('access360-chat-widget');
widget.setAttribute('website-id', '${websiteId}');
widget.setAttribute('api-key', '${apiKey}');
widget.setAttribute('position', 'bottom-right');
widget.setAttribute('theme', 'auto');
document.body.appendChild(widget);

// Or use in your HTML template:
// <access360-chat-widget
//   website-id="${websiteId}"
//   api-key="${apiKey}"
//   position="bottom-right"
//   theme="auto">
// </access360-chat-widget>`;
}

function generateWebComponentCode(websiteId: string, apiKey: string): string {
  return `<!-- Web Component Usage in Any Framework -->

<!-- Vue.js -->
<template>
  <access360-chat-widget
    website-id="${websiteId}"
    api-key="${apiKey}"
    position="bottom-right"
    theme="auto">
  </access360-chat-widget>
</template>

<!-- React -->
function App() {
  return (
    <access360-chat-widget
      website-id="${websiteId}"
      api-key="${apiKey}"
      position="bottom-right"
      theme="auto">
    </access360-chat-widget>
  );
}

<!-- Angular -->
<access360-chat-widget
  website-id="${websiteId}"
  api-key="${apiKey}"
  position="bottom-right"
  theme="auto">
</access360-chat-widget>`;
}

export function WidgetCode() {
  const websiteId = "mock-website-1";
  const { data: website, isLoading } = useWebsite(websiteId);
  const navigate = useNavigate();
  const [integrationMethod, setIntegrationMethod] = useState<IntegrationMethod>("script");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleClose = () => {
    navigate("/");
  };

  const handleMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIntegrationMethod(event.target.value as IntegrationMethod);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Generate code based on selected method
  const getGeneratedCode = () => {
    const apiKey = website?.appKey || "your-api-key";
    switch (integrationMethod) {
      case "script":
        return generateScriptTagCode(websiteId, apiKey);
      case "npm":
        return generateNpmCode(websiteId, apiKey);
      case "webcomponent":
        return generateWebComponentCode(websiteId, apiKey);
      default:
        return generateScriptTagCode(websiteId, apiKey);
    }
  };

  // Determine language for syntax highlighting
  const getLanguage = () => {
    switch (integrationMethod) {
      case "script":
        return "html";
      case "npm":
      case "webcomponent":
        return "javascript";
      default:
        return "html";
    }
  };

  // Copy to clipboard handler
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(getGeneratedCode());
      setSnackbar({
        open: true,
        message: "Code copied to clipboard!",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to copy code",
        severity: "error",
      });
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
      <Box className="max-w-7xl mx-auto px-page md:px-6 lg:px-8 py-8 space-y-6">
        {/* Configuration Panel */}
        <Paper elevation={2} className="p-6">
          <Typography variant="h6" className="mb-4">
            Integration Method
          </Typography>
          <FormControl component="fieldset">
            <FormLabel component="legend">Choose how to integrate the widget:</FormLabel>
            <RadioGroup value={integrationMethod} onChange={handleMethodChange} sx={{ mt: 2 }} row>
              <FormControlLabel
                value="script"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" className="font-semibold">
                      Script Tag
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quick setup with CDN script
                    </Typography>
                  </Box>
                }
                sx={{ mr: 4 }}
              />
              <FormControlLabel
                value="npm"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" className="font-semibold">
                      NPM Package
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Install via package manager
                    </Typography>
                  </Box>
                }
                sx={{ mr: 4 }}
              />
              <FormControlLabel
                value="webcomponent"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body1" className="font-semibold">
                      Framework Examples
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      React, Vue, Angular usage
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Code Display Panel */}
        <Paper elevation={2} className="p-6">
          <Box className="flex justify-between items-center mb-4">
            <Typography variant="h6">Integration Code</Typography>
            <Button
              variant="outlined"
              startIcon={<CopyIcon />}
              onClick={handleCopyCode}
              size="small"
            >
              Copy Code
            </Button>
          </Box>
          <Typography variant="body2" className="text-gray-600 mb-4">
            Copy and paste this code into your project:
          </Typography>
          <Box
            sx={{
              maxHeight: "500px",
              overflowY: "auto",
              borderRadius: 1,
              "& pre": {
                margin: 0,
              },
            }}
          >
            <SyntaxHighlighter
              language={getLanguage()}
              style={vscDarkPlus}
              customStyle={{
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
              showLineNumbers
            >
              {getGeneratedCode()}
            </SyntaxHighlighter>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar for copy feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
