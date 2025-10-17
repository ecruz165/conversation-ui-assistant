import { useMutation } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import type { EmbeddingTestQuery, EmbeddingTestResult } from "~/types";

// Mock API for enhanced embedding tests
const mockApi = {
  testEnhancedEmbedding: async (
    websiteId: string,
    query: EmbeddingTestQuery
  ): Promise<EmbeddingTestResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResults: EmbeddingTestResult = {
      query: query.query,
      totalMatches: 3,
      results: [
        {
          pageId: "page-1",
          title: "User Account Settings",
          url: "/account/settings",
          description: "Manage your account preferences and personal information",
          matchScore: 0.92,
          modalityScores: query.useMultiModal
            ? [
                { modality: "text", score: 0.88, contributionWeight: 0.5 },
                { modality: "visual", score: 0.95, contributionWeight: 0.3 },
                { modality: "metadata", score: 0.89, contributionWeight: 0.2 },
              ]
            : undefined,
          matchedIntents: ["account", "settings", "preferences"],
          slots: {
            matched: 0,
            total: 0,
            required: [],
          },
          isBestMatch: true,
          visualPreview: "/screenshots/account-settings.png",
          matchedVisualElements: query.useMultiModal
            ? [
                {
                  type: "form",
                  description: "Account settings form",
                  location: { x: 200, y: 100, width: 600, height: 400 },
                },
                {
                  type: "button",
                  description: "Save Settings button",
                  location: { x: 200, y: 520, width: 120, height: 40 },
                  text: "Save Settings",
                },
              ]
            : undefined,
          analysisData: {
            hasForm: true,
            interactionComplexity: "medium",
            contentDensity: "moderate",
          },
        },
        {
          pageId: "page-2",
          title: "Profile Management",
          url: "/profile",
          description: "Update your profile information and photo",
          matchScore: 0.78,
          modalityScores: query.useMultiModal
            ? [
                { modality: "text", score: 0.82, contributionWeight: 0.5 },
                { modality: "visual", score: 0.75, contributionWeight: 0.3 },
                { modality: "metadata", score: 0.73, contributionWeight: 0.2 },
              ]
            : undefined,
          matchedIntents: ["profile", "account"],
          slots: {
            matched: 0,
            total: 0,
            required: [],
          },
          isBestMatch: false,
          analysisData: {
            hasForm: true,
            interactionComplexity: "low",
            contentDensity: "sparse",
          },
        },
        {
          pageId: "page-3",
          title: "Security Settings",
          url: "/account/security",
          description: "Manage password and two-factor authentication",
          matchScore: 0.65,
          modalityScores: query.useMultiModal
            ? [
                { modality: "text", score: 0.70, contributionWeight: 0.5 },
                { modality: "visual", score: 0.62, contributionWeight: 0.3 },
                { modality: "metadata", score: 0.58, contributionWeight: 0.2 },
              ]
            : undefined,
          matchedIntents: ["security", "account"],
          slots: {
            matched: 0,
            total: 0,
            required: [],
          },
          isBestMatch: false,
          analysisData: {
            hasForm: true,
            interactionComplexity: "high",
            contentDensity: "moderate",
          },
        },
      ],
      searchMetadata: query.useMultiModal
        ? {
            multiModalUsed: true,
            averageConfidence: 0.78,
            modalitiesUsed: ["text", "visual", "metadata"],
            searchDuration: 1500,
          }
        : {
            multiModalUsed: false,
            averageConfidence: 0.78,
            modalitiesUsed: ["text"],
            searchDuration: 800,
          },
    };

    // Filter by minConfidence if provided
    if (query.minConfidence) {
      mockResults.results = mockResults.results.filter(
        (result) => result.matchScore >= query.minConfidence!
      );
      mockResults.totalMatches = mockResults.results.length;
    }

    // Limit results if maxResults is provided
    if (query.maxResults && query.maxResults < mockResults.results.length) {
      mockResults.results = mockResults.results.slice(0, query.maxResults);
    }

    return mockResults;
  },

  compareEmbeddings: async (
    websiteId: string,
    data: {
      pageId: string;
      comparisonType: "text-vs-visual" | "old-vs-new" | "multiple";
      versions?: number[];
    }
  ): Promise<{
    pageId: string;
    comparisons: Array<{
      type: string;
      similarity: number;
      differences: string[];
    }>;
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      pageId: data.pageId,
      comparisons: [
        {
          type: data.comparisonType,
          similarity: 0.87,
          differences: [
            "Text embeddings focus more on semantic meaning",
            "Visual embeddings capture layout and design elements",
            "Combined approach provides 12% better accuracy",
          ],
        },
      ],
    };
  },
};

// Test enhanced embedding with multi-modal support
export function useEnhancedEmbeddingTest(websiteId: string) {
  return useMutation({
    mutationFn: (query: EmbeddingTestQuery) =>
      mockConfig.enabled
        ? mockApi.testEnhancedEmbedding(websiteId, query)
        : api.testEnhancedEmbedding(websiteId, query),
    retry: 1,
  });
}

// Compare embeddings (text vs visual, old vs new, etc.)
export function useCompareEmbeddings(websiteId: string) {
  return useMutation({
    mutationFn: (data: {
      pageId: string;
      comparisonType: "text-vs-visual" | "old-vs-new" | "multiple";
      versions?: number[];
    }) =>
      mockConfig.enabled
        ? mockApi.compareEmbeddings(websiteId, data)
        : api.compareEmbeddings(websiteId, data),
    retry: 1,
  });
}
