import { useQuery } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import { mockApi } from "~/mocks/api";

export const useWebsite = (id: string) => {
  return useQuery({
    queryKey: ["website", id],
    queryFn: () => (mockConfig.enabled ? mockApi.getWebsite(id) : api.getWebsite(id)),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
