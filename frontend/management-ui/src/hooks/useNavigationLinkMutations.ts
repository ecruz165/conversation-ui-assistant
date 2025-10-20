import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/api/service";
import { mockConfig } from "~/config";
import type { NavigationLink } from "~/types";

interface CreateLinkData {
  websiteId: string;
  data: Partial<NavigationLink>;
}

interface UpdateLinkData {
  linkId: string;
  data: Partial<NavigationLink>;
}

interface DeleteLinkData {
  linkId: string;
}

interface BulkUpdateData {
  linkIds: string[];
  isActive: boolean;
}

interface BulkDeleteData {
  linkIds: string[];
}

// Mock API functions - used when mockConfig.enabled is true
const mockApi = {
  createLink: async (websiteId: string, data: Partial<NavigationLink>): Promise<NavigationLink> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate required fields
    if (!data.intent || !data.displayName || !data.targetUrl) {
      throw new Error("Missing required fields: intent, displayName, and targetUrl are required");
    }

    return {
      id: `link-${Date.now()}`,
      websiteId,
      intent: data.intent,
      displayName: data.displayName,
      targetUrl: data.targetUrl,
      isBookmarkable: data.isBookmarkable ?? true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as NavigationLink;
  },

  updateLink: async (linkId: string, data: Partial<NavigationLink>): Promise<NavigationLink> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      ...data,
      id: linkId,
      updatedAt: new Date().toISOString(),
    } as NavigationLink;
  },

  deleteLink: async (_linkId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  bulkUpdateActive: async (_linkIds: string[], _isActive: boolean): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },

  bulkDelete: async (_linkIds: string[]): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  },
};

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ websiteId, data }: CreateLinkData) =>
      mockConfig.enabled
        ? mockApi.createLink(websiteId, data)
        : api.createNavigationLink(websiteId, data),
    onMutate: async ({ websiteId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["navigationLinks", websiteId] });

      // Snapshot previous value
      const previousLinks = queryClient.getQueryData<NavigationLink[]>([
        "navigationLinks",
        websiteId,
      ]);

      // Validate required fields for optimistic update
      if (!data.intent || !data.displayName || !data.targetUrl) {
        throw new Error("Missing required fields: intent, displayName, and targetUrl are required");
      }

      // Optimistically update
      const optimisticLink: NavigationLink = {
        id: `temp-${Date.now()}`,
        websiteId,
        intent: data.intent,
        displayName: data.displayName,
        targetUrl: data.targetUrl,
        isBookmarkable: data.isBookmarkable ?? true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      } as NavigationLink;

      queryClient.setQueryData<NavigationLink[]>(["navigationLinks", websiteId], (old) => [
        ...(old || []),
        optimisticLink,
      ]);

      return { previousLinks };
    },
    onError: (_err, { websiteId }, context) => {
      // Rollback on error
      if (context?.previousLinks) {
        queryClient.setQueryData(["navigationLinks", websiteId], context.previousLinks);
      }
    },
    onSuccess: (_data, { websiteId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["navigationLinks", websiteId] });
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId, data }: UpdateLinkData) =>
      mockConfig.enabled
        ? mockApi.updateLink(linkId, data)
        : api.updateNavigationLink(data.websiteId || "mock-website-1", linkId, data),
    onMutate: async ({ linkId, data }) => {
      const websiteId = data.websiteId || "mock-website-1";
      await queryClient.cancelQueries({ queryKey: ["navigationLinks", websiteId] });

      const previousLinks = queryClient.getQueryData<NavigationLink[]>([
        "navigationLinks",
        websiteId,
      ]);

      // Optimistically update
      queryClient.setQueryData<NavigationLink[]>(
        ["navigationLinks", websiteId],
        (old) =>
          old?.map((link) =>
            link.id === linkId ? { ...link, ...data, updatedAt: new Date().toISOString() } : link
          ) || []
      );

      return { previousLinks, websiteId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLinks && context?.websiteId) {
        queryClient.setQueryData(["navigationLinks", context.websiteId], context.previousLinks);
      }
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.websiteId) {
        queryClient.invalidateQueries({ queryKey: ["navigationLinks", context.websiteId] });
      }
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId }: DeleteLinkData) =>
      mockConfig.enabled
        ? mockApi.deleteLink(linkId)
        : api.deleteNavigationLink("mock-website-1", linkId),
    onMutate: async ({ linkId }) => {
      const websiteId = "mock-website-1";
      await queryClient.cancelQueries({ queryKey: ["navigationLinks", websiteId] });

      const previousLinks = queryClient.getQueryData<NavigationLink[]>([
        "navigationLinks",
        websiteId,
      ]);

      // Optimistically remove
      queryClient.setQueryData<NavigationLink[]>(
        ["navigationLinks", websiteId],
        (old) => old?.filter((link) => link.id !== linkId) || []
      );

      return { previousLinks, websiteId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLinks && context?.websiteId) {
        queryClient.setQueryData(["navigationLinks", context.websiteId], context.previousLinks);
      }
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.websiteId) {
        queryClient.invalidateQueries({ queryKey: ["navigationLinks", context.websiteId] });
      }
    },
  });
}

export function useBulkUpdateActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkIds, isActive }: BulkUpdateData) =>
      mockConfig.enabled
        ? mockApi.bulkUpdateActive(linkIds, isActive)
        : api.bulkUpdateNavigationLinksActive("mock-website-1", linkIds, isActive),
    onMutate: async ({ linkIds, isActive }) => {
      const websiteId = "mock-website-1";
      await queryClient.cancelQueries({ queryKey: ["navigationLinks", websiteId] });

      const previousLinks = queryClient.getQueryData<NavigationLink[]>([
        "navigationLinks",
        websiteId,
      ]);

      // Optimistically update
      queryClient.setQueryData<NavigationLink[]>(
        ["navigationLinks", websiteId],
        (old) =>
          old?.map((link) =>
            linkIds.includes(link.id)
              ? { ...link, isActive, updatedAt: new Date().toISOString() }
              : link
          ) || []
      );

      return { previousLinks, websiteId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLinks && context?.websiteId) {
        queryClient.setQueryData(["navigationLinks", context.websiteId], context.previousLinks);
      }
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.websiteId) {
        queryClient.invalidateQueries({ queryKey: ["navigationLinks", context.websiteId] });
      }
    },
  });
}

export function useBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkIds }: BulkDeleteData) =>
      mockConfig.enabled
        ? mockApi.bulkDelete(linkIds)
        : api.bulkDeleteNavigationLinks("mock-website-1", linkIds),
    onMutate: async ({ linkIds }) => {
      const websiteId = "mock-website-1";
      await queryClient.cancelQueries({ queryKey: ["navigationLinks", websiteId] });

      const previousLinks = queryClient.getQueryData<NavigationLink[]>([
        "navigationLinks",
        websiteId,
      ]);

      // Optimistically remove
      queryClient.setQueryData<NavigationLink[]>(
        ["navigationLinks", websiteId],
        (old) => old?.filter((link) => !linkIds.includes(link.id)) || []
      );

      return { previousLinks, websiteId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLinks && context?.websiteId) {
        queryClient.setQueryData(["navigationLinks", context.websiteId], context.previousLinks);
      }
    },
    onSuccess: (_data, _variables, context) => {
      if (context?.websiteId) {
        queryClient.invalidateQueries({ queryKey: ["navigationLinks", context.websiteId] });
      }
    },
  });
}
