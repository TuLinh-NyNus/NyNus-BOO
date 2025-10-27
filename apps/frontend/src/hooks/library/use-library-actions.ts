'use client';

import { useCallback, useState } from 'react';

import {
  type LibraryItemResult,
  type RateItemResult,
  type BookmarkItemResult,
  type DownloadItemResult,
  type LibraryUploadState,
  LibraryService,
} from '@/services/grpc/library.service';

interface ActionState {
  loading: boolean;
  error: string | null;
}

export interface LibraryActions {
  approve: (id: string, status: LibraryUploadState) => Promise<LibraryItemResult>;
  rate: (id: string, rating: number, review?: string) => Promise<RateItemResult>;
  bookmark: (id: string, bookmarked: boolean) => Promise<BookmarkItemResult>;
  download: (id: string) => Promise<DownloadItemResult>;
  state: ActionState;
}

export function useLibraryActions(): LibraryActions {
  const [state, setState] = useState<ActionState>({
    loading: false,
    error: null,
  });

  const wrap = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setState({ loading: true, error: null });
      try {
        const result = await fn();
        if ((result as any)?.success === false) {
          const message = (result as any)?.errors?.[0] ?? (result as any)?.message ?? 'Thao tác thất bại';
          setState({ loading: false, error: message });
        } else {
          setState({ loading: false, error: null });
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Thao tác thất bại';
        setState({ loading: false, error: message });
        throw err;
      }
    },
    [],
  );

  const approve = useCallback(
    async (id: string, status: LibraryUploadState) =>
      wrap(() => LibraryService.approveItem(id, status)),
    [wrap],
  );

  const rate = useCallback(
    async (id: string, rating: number, review?: string) =>
      wrap(() => LibraryService.rateItem(id, rating, review)),
    [wrap],
  );

  const bookmark = useCallback(
    async (id: string, bookmarked: boolean) =>
      wrap(() => LibraryService.bookmarkItem(id, bookmarked)),
    [wrap],
  );

  const download = useCallback(
    async (id: string) =>
      wrap(() => LibraryService.downloadItem(id)),
    [wrap],
  );

  return {
    approve,
    rate,
    bookmark,
    download,
    state,
  };
}

export default useLibraryActions;
