// Shared React hooks

// Crawl Management hooks
export {
  useCrawlConfiguration,
  useCrawlHistory,
  useCrawlSchedule,
  useCrawlStatus,
  useStartCrawl,
  useUpdateCrawlConfiguration,
  useUpdateCrawlSchedule,
} from "./useCrawlManagement";
export { useDebounce } from "./useDebounce";
// Embedding & Testing hooks
export { useEmbeddingTest } from "./useEmbeddingTest";
export { useCompareEmbeddings, useEnhancedEmbeddingTest } from "./useEnhancedEmbeddingTest";
export { useIntersectionObserver } from "./useIntersectionObserver";
export {
  useBulkDelete,
  useBulkUpdateActive,
  useCreateLink,
  useDeleteLink,
  useUpdateLink,
} from "./useNavigationLinkMutations";
// Navigation Link hooks
export { useNavigationLinks } from "./useNavigationLinks";
// Screenshot Analysis hooks
export {
  useAnalysisHistory,
  useAnalysisJobStatus,
  useAnalysisVersion,
  useUploadScreenshot,
} from "./useScreenshotAnalysis";
// Search Configuration hooks
export { useUpdateSearchConfiguration } from "./useSearchConfiguration";

// Synthetic Queries hooks
export {
  useGenerateSyntheticQueries,
  useSyntheticQueries,
  useValidateSyntheticQuery,
} from "./useSyntheticQueries";
// System Metrics hooks
export { useSystemMetrics } from "./useSystemMetrics";
// Website hooks
export { useWebsite } from "./useWebsite";
export { useWebsites } from "./useWebsites";
