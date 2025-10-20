import { useMutation } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import { mockEmbeddingTestResult } from "~/mocks/data";
import type { EmbeddingTestQuery, EmbeddingTestResult } from "~/types";

// Mock API for enhanced embedding tests
const mockApi = {
  testEnhancedEmbedding: async (
    _websiteId: string,
    query: EmbeddingTestQuery
  ): Promise<EmbeddingTestResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Use the enhanced mock data from mocks/data.ts
    // This data includes both enhanced scores and legacy modalityScores
    const mockResults: EmbeddingTestResult = {
      ...mockEmbeddingTestResult,
      query: query.query, // Use the actual query from the request
    };

    // Filter by minConfidence if provided
    if (query.minConfidence) {
      mockResults.results = mockResults.results.filter(
        (result) => result.matchScore >= (query.minConfidence ?? 0)
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
    _websiteId: string,
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
