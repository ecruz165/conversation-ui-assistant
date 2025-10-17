import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import type {
  GenerateSyntheticQueriesData,
  GeneratedQuery,
  QueryType,
  SyntheticQuery,
  ValidateSyntheticQueryData,
  ValidateSyntheticQueryResult,
} from "~/types";

// Mock API for synthetic queries
const mockApi = {
  getSyntheticQueries: async (
    websiteId: string,
    pageId?: string
  ): Promise<SyntheticQuery[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allQueries: SyntheticQuery[] = [
      {
        id: "sq-1",
        query: "How do I change my account settings?",
        queryType: "how_do_i",
        expectedPageId: "page-1",
        validated: true,
        matchScore: 0.95,
        createdAt: "2025-01-15T10:00:00Z",
        lastValidated: "2025-01-16T14:30:00Z",
      },
      {
        id: "sq-2",
        query: "Where can I update my profile information?",
        queryType: "where_can_i",
        expectedPageId: "page-2",
        validated: true,
        matchScore: 0.88,
        createdAt: "2025-01-15T10:05:00Z",
        lastValidated: "2025-01-16T14:35:00Z",
      },
      {
        id: "sq-3",
        query: "I want to update my password",
        queryType: "i_want_to",
        expectedPageId: "page-3",
        validated: false,
        createdAt: "2025-01-15T10:10:00Z",
      },
      {
        id: "sq-4",
        query: "Show me my security options",
        queryType: "show_me",
        expectedPageId: "page-3",
        validated: true,
        matchScore: 0.92,
        createdAt: "2025-01-15T10:15:00Z",
        lastValidated: "2025-01-16T14:40:00Z",
      },
      {
        id: "sq-5",
        query: "Navigate to billing settings",
        queryType: "navigate_to",
        expectedPageId: "page-4",
        validated: true,
        matchScore: 0.96,
        createdAt: "2025-01-15T10:20:00Z",
        lastValidated: "2025-01-16T14:45:00Z",
      },
      {
        id: "sq-6",
        query: "Find my subscription details",
        queryType: "find_my",
        expectedPageId: "page-5",
        validated: false,
        createdAt: "2025-01-15T10:25:00Z",
      },
      {
        id: "sq-7",
        query: "Show me the dashboard",
        queryType: "show_me",
        expectedPageId: "page-6",
        validated: true,
        matchScore: 0.89,
        createdAt: "2025-01-15T10:30:00Z",
        lastValidated: "2025-01-16T14:50:00Z",
      },
      {
        id: "sq-8",
        query: "How do I contact support?",
        queryType: "how_do_i",
        expectedPageId: "page-7",
        validated: false,
        createdAt: "2025-01-15T10:35:00Z",
      },
    ];

    return pageId
      ? allQueries.filter((q) => q.expectedPageId === pageId)
      : allQueries;
  },

  generateSyntheticQueries: async (
    websiteId: string,
    data: GenerateSyntheticQueriesData
  ): Promise<GeneratedQuery[]> => {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate AI generation time

    const count = data.count || 5;
    const queryTypes: QueryType[] = data.queryTypes || [
      "show_me",
      "i_want_to",
      "where_can_i",
      "navigate_to",
      "find_my",
      "how_do_i",
    ];
    const queries: GeneratedQuery[] = [];

    const templates: Record<QueryType, string[]> = {
      show_me: ["Show me", "Display", "Let me see"],
      i_want_to: ["I want to", "I need to", "Help me"],
      where_can_i: ["Where can I", "Where do I", "How can I find"],
      navigate_to: ["Navigate to", "Take me to", "Go to"],
      find_my: ["Find my", "Where is my", "Show my"],
      how_do_i: ["How do I", "How can I", "What's the way to"],
      other: ["Help with", "Assistance for", "Guide me to"],
    };

    for (let i = 0; i < count; i++) {
      const queryType = queryTypes[i % queryTypes.length];
      const template = templates[queryType][Math.floor(Math.random() * templates[queryType].length)];
      queries.push({
        query: `${template} ${data.pageId ? `page ${data.pageId}` : `item ${i + 1}`}`,
        queryType,
        expectedPageId: data.pageId || `page-${i + 1}`,
        confidence: 0.7 + Math.random() * 0.3, // Random confidence between 0.7-1.0
      });
    }

    return queries;
  },

  validateSyntheticQuery: async (
    websiteId: string,
    data: ValidateSyntheticQueryData
  ): Promise<ValidateSyntheticQueryResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate validation - randomly pass/fail for demo
    const matchScore = 0.6 + Math.random() * 0.4; // Random score between 0.6-1.0
    const isValid = matchScore >= 0.8;
    const actualBestMatch = isValid ? data.expectedPageId : `page-${Math.floor(Math.random() * 5)}`;

    return {
      query: data.query,
      expectedPageId: data.expectedPageId,
      actualBestMatch,
      matchScore,
      isValid,
      issues: !isValid
        ? [
            "Query matched different page than expected",
            "Consider adding more specific keywords",
            "Visual embedding similarity is low",
          ]
        : undefined,
    };
  },
};

// Get synthetic queries (optionally filtered by pageId)
export function useSyntheticQueries(websiteId: string, pageId?: string) {
  return useQuery({
    queryKey: ["syntheticQueries", websiteId, pageId],
    queryFn: () =>
      mockConfig.enabled
        ? mockApi.getSyntheticQueries(websiteId, pageId)
        : api.getSyntheticQueries(websiteId, pageId),
  });
}

// Generate new synthetic queries
export function useGenerateSyntheticQueries(websiteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateSyntheticQueriesData) =>
      mockConfig.enabled
        ? mockApi.generateSyntheticQueries(websiteId, data)
        : api.generateSyntheticQueries(websiteId, data),
    onSuccess: (data, variables) => {
      // Invalidate queries list to refetch with new generated queries
      queryClient.invalidateQueries({
        queryKey: ["syntheticQueries", websiteId, variables.pageId],
      });
    },
    retry: 1,
  });
}

// Validate a synthetic query
export function useValidateSyntheticQuery(websiteId: string) {
  return useMutation({
    mutationFn: (data: ValidateSyntheticQueryData) =>
      mockConfig.enabled
        ? mockApi.validateSyntheticQuery(websiteId, data)
        : api.validateSyntheticQuery(websiteId, data),
    retry: 1,
  });
}
