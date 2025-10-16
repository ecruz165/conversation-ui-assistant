import { useQuery } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import { mockApi } from "~/mocks/api";

export const useSystemMetrics = () => {
  return useQuery({
    queryKey: ["systemMetrics"],
    queryFn: () => (mockConfig.enabled ? mockApi.getSystemMetrics() : api.getSystemMetrics()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
