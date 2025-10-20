import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import type { Website } from "~/types";

export interface UpdateSearchConfigurationData {
  weights: {
    functionality: number;
    content: number;
    purpose: number;
    action: number;
    dataContext: number;
    userTask: number;
  };
  description?: string;
}

// Mock API for search configuration
const mockApi = {
  updateSearchConfiguration: async (
    websiteId: string,
    data: UpdateSearchConfigurationData
  ): Promise<{ success: boolean; updatedAt: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In real implementation, this would update the backend
    console.log(`Updating search config for website ${websiteId}:`, data);

    return {
      success: true,
      updatedAt: new Date().toISOString(),
    };
  },
};

// Update website search configuration (modality weights)
export function useUpdateSearchConfiguration(websiteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSearchConfigurationData) =>
      mockConfig.enabled
        ? mockApi.updateSearchConfiguration(websiteId, data)
        : api.updateSearchConfiguration(websiteId, data),
    onSuccess: (_, variables) => {
      // Update the website cache with new search configuration
      queryClient.setQueryData(["website", websiteId], (oldData: Website | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          searchConfiguration: {
            weights: variables.weights,
            description: variables.description,
            updatedAt: new Date().toISOString(),
          },
        };
      });

      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ["website", websiteId] });
    },
  });
}
