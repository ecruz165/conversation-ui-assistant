import { useQuery } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import { mockApi } from "~/mocks/api";

export const useNavigationLinks = (websiteId: string) => {
  return useQuery({
    queryKey: ["navigationLinks", websiteId],
    queryFn: () =>
      mockConfig.enabled
        ? mockApi.getNavigationLinks(websiteId)
        : api.getNavigationLinks(websiteId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
