/**
 * useLibraryTags Hook
 * React hook for managing library tags
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/ui/use-toast';
import * as LibraryTagsService from '@/services/grpc/library-tags.service';

export function useLibraryTags(params?: LibraryTagsService.ListTagsParams) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['library-tags', params],
    queryFn: () => LibraryTagsService.listTags(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    tags: data?.tags || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
  };
}

export function usePopularTags(limit: number = 20) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['library-tags-popular', limit],
    queryFn: () => LibraryTagsService.getPopularTags(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    tags: data || [],
    isLoading,
    error,
  };
}

export function useTagActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: LibraryTagsService.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-tags'] });
      toast({
        title: 'Tag created',
        description: 'Tag has been created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LibraryTagsService.TagData> }) =>
      LibraryTagsService.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-tags'] });
      toast({
        title: 'Tag updated',
        description: 'Tag has been updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: LibraryTagsService.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-tags'] });
      toast({
        title: 'Tag deleted',
        description: 'Tag has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleTrendingMutation = useMutation({
    mutationFn: ({ id, isTrending }: { id: string; isTrending: boolean }) =>
      LibraryTagsService.toggleTrending(id, isTrending),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-tags'] });
      toast({
        title: 'Trending status updated',
        description: 'Tag trending status has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createTag: createMutation.mutate,
    updateTag: updateMutation.mutate,
    deleteTag: deleteMutation.mutate,
    toggleTrending: toggleTrendingMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingTrending: toggleTrendingMutation.isPending,
  };
}

