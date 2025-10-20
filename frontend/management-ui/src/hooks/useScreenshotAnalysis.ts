import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import type { ScreenshotAnalysisRequest, ScreenshotAnalysisResult } from "~/types";

// Mock API functions for development
const mockApi = {
  uploadScreenshot: async (
    _websiteId: string,
    request: ScreenshotAnalysisRequest
  ): Promise<ScreenshotAnalysisResult> => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing time

    return {
      pageId: request.pageId || `page-${Date.now()}`,
      analysisId: `analysis-${Date.now()}`,
      status: "completed",
      screenshot: {
        url: request.screenshotUrl,
        dimensions: { width: 1920, height: 1080 },
        format: "png",
        size: 245760,
      },
      regions: [
        {
          id: "region-1",
          type: "header",
          boundingBox: { x: 0, y: 0, width: 1920, height: 80 },
          confidence: 0.95,
          description: "Navigation header with logo and menu items",
        },
        {
          id: "region-2",
          type: "content",
          boundingBox: { x: 0, y: 80, width: 1920, height: 800 },
          confidence: 0.92,
          description: "Main content area with form and text",
        },
      ],
      textContent: {
        extracted: "Sample extracted text from screenshot",
        headings: ["Welcome", "Sign In"],
        links: [{ text: "Forgot Password", href: "/reset" }],
        buttons: ["Sign In", "Create Account"],
        formFields: [
          { label: "Email", type: "email" },
          { label: "Password", type: "password" },
        ],
      },
      visualSummary: {
        colorPalette: ["#1976d2", "#ffffff", "#f5f5f5"],
        layout: "single-column",
        density: "moderate",
        brandElements: {
          logo: { x: 20, y: 20, width: 120, height: 40 },
          primaryColor: "#1976d2",
        },
      },
      embeddings: {
        fullPage: new Array(1536).fill(0).map(() => Math.random()),
        regions: [
          {
            regionId: "region-1",
            embedding: new Array(1536).fill(0).map(() => Math.random()),
          },
          {
            regionId: "region-2",
            embedding: new Array(1536).fill(0).map(() => Math.random()),
          },
        ],
      },
      metadata: {
        analyzedAt: new Date().toISOString(),
        processingDuration: 2000,
        modelUsed: "gpt-4-vision",
        confidence: 0.93,
      },
    };
  },

  getAnalysisStatus: async (
    websiteId: string,
    _analysisId: string
  ): Promise<ScreenshotAnalysisResult> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Return completed status with mock data
    return mockApi.uploadScreenshot(websiteId, {
      websiteId,
      analysisOptions: { generateEmbeddings: true, detectRegions: true, extractText: true },
    });
  },

  getAnalysisHistory: async (
    websiteId: string,
    page: number,
    pageSize: number
  ): Promise<{
    entries: ScreenshotAnalysisResult[];
    total: number;
    page: number;
    pageSize: number;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockEntry = await mockApi.uploadScreenshot(websiteId, {
      websiteId,
      analysisOptions: { generateEmbeddings: true, detectRegions: true, extractText: true },
    });

    return {
      entries: [mockEntry, { ...mockEntry, analysisId: `analysis-${Date.now() - 1000}` }],
      total: 2,
      page,
      pageSize,
    };
  },
};

// Upload screenshot for analysis
export function useUploadScreenshot(websiteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ScreenshotAnalysisRequest) =>
      mockConfig.enabled
        ? mockApi.uploadScreenshot(websiteId, request)
        : api.uploadScreenshotForAnalysis(websiteId, request),
    onSuccess: () => {
      // Invalidate analysis history when new analysis completes
      queryClient.invalidateQueries({ queryKey: ["analysisHistory", websiteId] });
    },
    retry: 1,
  });
}

// Poll analysis job status
export function useAnalysisJobStatus(websiteId: string, analysisId: string | null) {
  return useQuery({
    queryKey: ["analysisJob", websiteId, analysisId],
    queryFn: () =>
      mockConfig.enabled
        ? mockApi.getAnalysisStatus(websiteId, analysisId ?? "")
        : api.getAnalysisJobStatus(websiteId, analysisId ?? ""),
    enabled: !!analysisId, // Only run when analysisId is available
    staleTime: 1000 * 60, // 1 minute for status checks
    refetchInterval: (query) => {
      // Poll every 2 seconds if status is "processing", otherwise stop
      const status = query.state.data?.status;
      return status === "processing" ? 2000 : false;
    },
  });
}

// Get analysis history
export function useAnalysisHistory(websiteId: string, page: number = 0, pageSize: number = 10) {
  return useQuery({
    queryKey: ["analysisHistory", websiteId, page, pageSize],
    queryFn: () =>
      mockConfig.enabled
        ? mockApi.getAnalysisHistory(websiteId, page, pageSize)
        : api.getAnalysisHistory(websiteId, page, pageSize),
  });
}

// Get specific analysis version
export function useAnalysisVersion(
  websiteId: string,
  pageId: string | null,
  version: number | null
) {
  return useQuery({
    queryKey: ["analysisVersion", websiteId, pageId, version],
    queryFn: () => api.getAnalysisVersion(websiteId, pageId ?? "", version ?? 0),
    enabled: !!pageId && !!version, // Only run when both are available
  });
}
