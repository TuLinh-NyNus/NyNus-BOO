'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  type LibraryItemView,
  LibraryService,
} from '@/services/grpc/library.service';

export interface UseLibraryItemResult {
  item: LibraryItemView | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLibraryItem(id: string | undefined): UseLibraryItemResult {
  const [item, setItem] = useState<LibraryItemView | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) {
      setItem(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await LibraryService.getItem(id);
      if (!result.success || !result.item) {
        setItem(null);
        setError(result.errors?.[0] ?? result.message ?? 'Không thể tải nội dung');
        return;
      }
      setItem(result.item);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải nội dung';
      setError(message);
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem().catch(() => {
      /* handled inside */
    });
  }, [fetchItem]);

  const refresh = useCallback(async () => {
    await fetchItem();
  }, [fetchItem]);

  return useMemo(
    () => ({
      item,
      loading,
      error,
      refresh,
    }),
    [item, loading, error, refresh],
  );
}

export default useLibraryItem;
