import { useMutation } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import { mockApi } from "~/mocks/api";
import type { EmbeddingTestQuery, EmbeddingTestResult } from "~/types";

interface UseEmbeddingTestParams {
  websiteId: string;
}

export const useEmbeddingTest = ({ websiteId }: UseEmbeddingTestParams) => {
  return useMutation({
    mutationFn: (query: EmbeddingTestQuery) =>
      mockConfig.enabled
        ? mockApi.testEmbedding(websiteId, query)
        : api.testEmbedding(websiteId, query),
    retry: 1, // Retry failed requests once
  });
};
