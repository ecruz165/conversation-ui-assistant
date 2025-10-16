import { useQuery } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import { mockApi } from "~/mocks/api";

export const useWebsites = () => {
  return useQuery({
    queryKey: ["websites"],
    queryFn: () => (mockConfig.enabled ? mockApi.getWebsites() : api.getWebsites()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
