'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BookService, type BackendBook } from '@/services/grpc/book.service';
import type { AdminBook } from '@/lib/mockdata/types';

export type BookSortField = 'created_at' | 'download_count' | 'rating' | 'title';
export type BookSortOrder = 'asc' | 'desc';

export interface AdminBookFilters {
  category?: string;
  fileType?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: BookSortField;
  sortOrder?: BookSortOrder;
}

export interface UseAdminBooksResult {
  books: AdminBook[];
  total: number;
  totalActive: number;
  loading: boolean;
  error: string | null;
  isFallback: boolean;
  refresh: () => Promise<void>;
}

const DEFAULT_LIMIT = 50;

function mapBackendBookToAdmin(book: BackendBook): AdminBook {
  const parseDate = (value?: string) => {
    if (!value) {
      return new Date();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const sanitizeFileType = (value?: string): AdminBook['fileType'] => {
    const normalized = (value ?? 'pdf').toLowerCase();
    if (normalized === 'epub' || normalized === 'doc' || normalized === 'ppt') {
      return normalized;
    }
    return 'pdf';
  };

  return {
    id: book.id,
    title: book.title ?? 'Untitled book',
    description: book.description ?? '',
    author: book.author ?? 'Unknown author',
    isbn: book.isbn,
    publisher: book.publisher,
    publishedDate: book.publishedDate ? new Date(book.publishedDate) : undefined,
    category: book.category ?? 'Uncategorized',
    tags: book.tags ?? [],
    coverImage: book.coverImage,
    fileUrl: book.fileUrl,
    fileSize: book.fileSize,
    fileType: sanitizeFileType(book.fileType),
    isActive: Boolean(book.isActive),
    downloadCount: book.downloadCount ?? 0,
    rating: book.rating ?? 0,
    reviews: book.reviews ?? 0,
    createdAt: parseDate(book.createdAt),
    updatedAt: parseDate(book.updatedAt),
  };
}

export function useAdminBooks(filters: AdminBookFilters): UseAdminBooksResult {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalActive, setTotalActive] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await BookService.listBooks({
        pagination: {
          page: filtersRef.current.page ?? 1,
          limit: filtersRef.current.limit ?? DEFAULT_LIMIT,
        },
        category: filtersRef.current.category,
        fileType: filtersRef.current.fileType,
        isActive: filtersRef.current.isActive,
        search: filtersRef.current.search,
        sortBy: filtersRef.current.sortBy,
        sortOrder: filtersRef.current.sortOrder,
      });

      setIsFallback(Boolean(result.isFallback));

      if (!result.success && !result.isFallback) {
        setBooks([]);
        setTotal(0);
        setTotalActive(0);
        setError(result.message || result.errors?.[0] || 'Unable to load books');
        return;
      }

      const mappedBooks = (result.books ?? []).map(mapBackendBookToAdmin);
      setBooks(mappedBooks);
      setTotal(result.pagination?.totalCount ?? mappedBooks.length);
      setTotalActive(result.totalActive ?? 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load books';
      setError(message);
      setBooks([]);
      setTotal(0);
      setTotalActive(0);
      setIsFallback(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks().catch(() => {
      /** error state handled inside fetchBooks */
    });
  }, [fetchBooks, filters.category, filters.fileType, filters.isActive, filters.search, filters.page, filters.limit, filters.sortBy, filters.sortOrder]);

  const refresh = useCallback(async () => {
    await fetchBooks();
  }, [fetchBooks]);

  return useMemo(
    () => ({
      books,
      total,
      totalActive,
      loading,
      error,
      isFallback,
      refresh,
    }),
    [books, total, totalActive, loading, error, isFallback, refresh],
  );
}
