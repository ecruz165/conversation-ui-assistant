import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import { mockApi } from "~/mocks/api";
import type {
  CrawlConfiguration,
  CrawlHistoryResponse,
  CrawlSchedule,
  StartCrawlResponse,
} from "~/types";

// Crawl Schedule Hooks
export const useCrawlSchedule = (websiteId: string) => {
  return useQuery({
    queryKey: ["crawlSchedule", websiteId],
    queryFn: () =>
      mockConfig.enabled ? mockApi.getCrawlSchedule(websiteId) : api.getCrawlSchedule(websiteId),
  });
};

export const useUpdateCrawlSchedule = (websiteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedule: CrawlSchedule) =>
      mockConfig.enabled
        ? mockApi.updateCrawlSchedule(websiteId, schedule)
        : api.updateCrawlSchedule(websiteId, schedule),
    onSuccess: (data) => {
      // Update the cache with the new schedule
      queryClient.setQueryData(["crawlSchedule", websiteId], data);
    },
    retry: 1,
  });
};

// Crawl Configuration Hooks
export const useCrawlConfiguration = (websiteId: string) => {
  return useQuery({
    queryKey: ["crawlConfiguration", websiteId],
    queryFn: () =>
      mockConfig.enabled
        ? mockApi.getCrawlConfiguration(websiteId)
        : api.getCrawlConfiguration(websiteId),
  });
};

export const useUpdateCrawlConfiguration = (websiteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: CrawlConfiguration) =>
      mockConfig.enabled
        ? mockApi.updateCrawlConfiguration(websiteId, config)
        : api.updateCrawlConfiguration(websiteId, config),
    onMutate: async (newConfig) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["crawlConfiguration", websiteId] });

      // Snapshot previous value
      const previousConfig = queryClient.getQueryData(["crawlConfiguration", websiteId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["crawlConfiguration", websiteId], newConfig);

      // Return context with the previous value
      return { previousConfig };
    },
    onError: (_err, _newConfig, context) => {
      // Rollback on error
      if (context?.previousConfig) {
        queryClient.setQueryData(["crawlConfiguration", websiteId], context.previousConfig);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["crawlConfiguration", websiteId] });
    },
    retry: 1,
  });
};

// Crawl History Hook
export const useCrawlHistory = (websiteId: string, page: number = 0, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["crawlHistory", websiteId, page, pageSize],
    queryFn: () =>
      mockConfig.enabled
        ? mockApi.getCrawlHistory(websiteId, page, pageSize)
        : api.getCrawlHistory(websiteId, page, pageSize),
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  });
};

// Start Crawl Hook
export const useStartCrawl = (websiteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      mockConfig.enabled ? mockApi.startCrawl(websiteId) : api.startCrawl(websiteId),
    onSuccess: () => {
      // Invalidate crawl history to show the new crawl
      queryClient.invalidateQueries({ queryKey: ["crawlHistory", websiteId] });
      // Optionally invalidate website data to update crawl status
      queryClient.invalidateQueries({ queryKey: ["website", websiteId] });
    },
    retry: 1,
  });
};

// Crawl Status Hook (for polling)
export const useCrawlStatus = (websiteId: string, crawlId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["crawlStatus", websiteId, crawlId],
    queryFn: () =>
      mockConfig.enabled
        ? mockApi.getCrawlStatus(websiteId, crawlId)
        : api.getCrawlStatus(websiteId, crawlId),
    // Poll every 5 seconds while enabled
    refetchInterval: enabled ? 5000 : false,
    enabled,
  });
};
