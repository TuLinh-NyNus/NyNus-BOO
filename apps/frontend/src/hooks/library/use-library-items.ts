'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type LibraryItemView,
  type LibraryFilterInput,
  type LibraryListParams,
  LibraryService,
} from '@/services/grpc/library.service';

export type LibrarySortField = 'created_at' | 'download_count' | 'rating' | 'title';
export type LibrarySortOrder = 'asc' | 'desc';

export interface UseLibraryItemsParams {
  pagination?: LibraryListParams['pagination'];
  search?: string;
  sortBy?: LibrarySortField;
  sortOrder?: LibrarySortOrder;
  filter?: LibraryFilterInput;
  useSearchRpc?: boolean;
}

export interface UseLibraryItemsResult {
  items: LibraryItemView[];
  totalCount: number;
  totalPages: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  refresh: () => Promise<void>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;

export function useLibraryItems(params: UseLibraryItemsParams): UseLibraryItemsResult {
  const [items, setItems] = useState<LibraryItemView[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(params.pagination?.page ?? DEFAULT_PAGE);
  const [limit, setLimit] = useState<number>(params.pagination?.limit ?? DEFAULT_LIMIT);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    const currentParams = paramsRef.current;
    const { pagination, search, sortBy, sortOrder, filter, useSearchRpc } = currentParams;

    try {
      const requestPayload: LibraryListParams = {
        pagination: {
          page: pagination?.page ?? page ?? DEFAULT_PAGE,
          limit: pagination?.limit ?? limit ?? DEFAULT_LIMIT,
        },
        search,
        sortBy,
        sortOrder,
        filter,
      };

      const result = useSearchRpc
        ? await LibraryService.searchItems(requestPayload)
        : await LibraryService.listItems(requestPayload);

      setIsFallback(Boolean(result.isFallback));

      if (!result.success && !result.isFallback) {
        setItems([]);
        setTotalCount(0);
        setTotalPages(0);
        setError(result.errors?.[0] ?? result.message ?? 'Không thể tải danh sách thư viện');
        return;
      }

      const paginationResp = result.pagination;
      setItems(result.items ?? []);
      setTotalCount(paginationResp?.totalCount ?? result.items.length ?? 0);
      setTotalPages(paginationResp?.totalPages ?? 0);
      setPage(paginationResp?.page ?? (pagination?.page ?? DEFAULT_PAGE));
      setLimit(paginationResp?.limit ?? (pagination?.limit ?? DEFAULT_LIMIT));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách thư viện';
      setError(message);
      setItems([]);
      setTotalCount(0);
      setTotalPages(0);
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchItems().catch(() => {
      /* trạng thái lỗi đã xử lý bên trong */
    });
  }, [
    fetchItems,
    params.pagination?.page,
    params.pagination?.limit,
    params.search,
    params.sortBy,
    params.sortOrder,
    params.filter?.bookType,
    params.filter?.difficultyLevel,
    params.filter?.examType,
    params.filter?.grades,
    params.filter?.subjects,
    params.filter?.tags,
    params.filter?.types,
    params.filter?.videoQuality,
    params.filter?.province,
    params.filter?.academicYear,
    params.filter?.requiredRole,
    params.filter?.onlyActive,
    params.filter?.minLevel,
    params.filter?.maxLevel,
    params.useSearchRpc,
  ]);

  const refresh = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  return useMemo(
    () => ({
      items,
      totalCount,
      totalPages,
      page,
      limit,
      loading,
      error,
      isFallback,
      refresh,
    }),
    [items, totalCount, totalPages, page, limit, loading, error, isFallback, refresh],
  );
}

export default useLibraryItems;
