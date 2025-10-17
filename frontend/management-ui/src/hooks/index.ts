// Shared React hooks

// Website hooks
export { useWebsite } from "./useWebsite";
export { useWebsites } from "./useWebsites";

// Navigation Link hooks
export { useNavigationLinks } from "./useNavigationLinks";
export {
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  useBulkUpdateActive,
  useBulkDelete,
} from "./useNavigationLinkMutations";

// Embedding & Testing hooks
export { useEmbeddingTest } from "./useEmbeddingTest";
export { useEnhancedEmbeddingTest, useCompareEmbeddings } from "./useEnhancedEmbeddingTest";

// Screenshot Analysis hooks
export {
  useUploadScreenshot,
  useAnalysisJobStatus,
  useAnalysisHistory,
  useAnalysisVersion,
} from "./useScreenshotAnalysis";

// Synthetic Queries hooks
export {
  useSyntheticQueries,
  useGenerateSyntheticQueries,
  useValidateSyntheticQuery,
} from "./useSyntheticQueries";

// Crawl Management hooks
export {
  useCrawlSchedule,
  useUpdateCrawlSchedule,
  useCrawlConfiguration,
  useUpdateCrawlConfiguration,
  useCrawlHistory,
  useStartCrawl,
  useCrawlStatus,
} from "./useCrawlManagement";

// System Metrics hooks
export { useSystemMetrics } from "./useSystemMetrics";

// Search Configuration hooks
export { useUpdateSearchConfiguration } from "./useSearchConfiguration";
