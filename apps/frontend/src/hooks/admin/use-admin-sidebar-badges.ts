'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAdminStats } from '@/contexts/admin-stats-context';
import { BookService } from '@/services/grpc/book.service';
import { NotificationService } from '@/services/grpc/notification.service';
import { useQuestionStore, questionSelectors } from '@/lib/stores/question.store';

type SidebarCounts = {
  users?: number;
  questions?: number;
  books?: number;
  sessions?: number;
  notifications?: number;
};

interface LoadResult {
  updates: SidebarCounts;
  errors: string[];
}

/**
 * Hook to load real data counts for admin sidebar badges.
 * Aggregates system stats, question totals, book totals, and unread notifications.
 * 
 * ✅ FIX: Use refs to prevent dependency loops and rate limit errors
 */
export function useAdminSidebarBadges() {
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats
  } = useAdminStats();
  const questionPagination = useQuestionStore(questionSelectors.pagination);
  const hasFetchedQuestions = useQuestionStore((state) => state.hasFetchedQuestions);
  const questionTotal = hasFetchedQuestions ? questionPagination.total : undefined;

  const [counts, setCounts] = useState<SidebarCounts>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ FIX: Use refs to prevent dependency loops
  const loadCountsRef = useRef<(() => Promise<LoadResult>) | null>(null);
  const initialFetchDoneRef = useRef<boolean>(false);

  /**
   * Load counts that are not provided by AdminStats (books, notifications).
   * ✅ FIX: Keep dependencies but store in ref to prevent loop
   * ✅ FIX: Silent error handling for rate limit - don't push to errors array
   */
  const loadCounts = useCallback(async (): Promise<LoadResult> => {
    const results = await Promise.allSettled([
      BookService.getBookCount(),
      NotificationService.getUnreadCount()
    ]);

    const updates: SidebarCounts = {};
    const errors: string[] = [];

    if (hasFetchedQuestions && questionTotal !== undefined) {
      updates.questions = questionTotal;
    }

    const [booksResult, notificationsResult] = results;

    if (booksResult.status === 'fulfilled') {
      updates.books = booksResult.value;
    } else {
      const reason = booksResult.reason as Error;
      // Only add to errors if not a rate limit issue
      const isRateLimit = reason?.message?.toLowerCase().includes('rate limit');
      if (!isRateLimit) {
        errors.push(reason?.message || 'Unable to load book statistics');
      }
    }

    if (notificationsResult.status === 'fulfilled') {
      updates.notifications = notificationsResult.value;
    } else {
      const reason = notificationsResult.reason as Error;
      // Silent handling for rate limit - notification service already logs warning
      const isRateLimit = reason?.message?.toLowerCase().includes('rate limit');
      if (!isRateLimit) {
        errors.push(reason?.message || 'Unable to load notification statistics');
      }
      // Set notifications to 0 if rate limited (service returns 0 on rate limit)
      if (isRateLimit) {
        updates.notifications = 0;
      }
    }

    return { updates, errors };
  }, [hasFetchedQuestions, questionTotal]);

  // ✅ FIX: Update ref whenever loadCounts changes
  useEffect(() => {
    loadCountsRef.current = loadCounts;
  }, [loadCounts]);

  /**
   * Initial load for non-stat counts.
   * ✅ FIX: Only run once on mount, use ref to access latest loadCounts
   */
  useEffect(() => {
    // Only fetch once on initial mount
    if (initialFetchDoneRef.current) {
      return;
    }
    
    initialFetchDoneRef.current = true;
    let cancelled = false;

    const run = async () => {
      if (!loadCountsRef.current) return;
      
      setLoading(true);
      const { updates, errors } = await loadCountsRef.current();

      if (cancelled) {
        return;
      }

      setCounts((prev) => ({ ...prev, ...updates }));
      setError(errors.length > 0 ? errors.join(' | ') : null);
      setLoading(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []); // Empty dependency - only run once on mount

  /**
   * Update counts when AdminStats context data becomes available or changes.
   */
  useEffect(() => {
    if (!stats) {
      return;
    }

    setCounts((prev) => ({
      ...prev,
      users: stats.total_users ?? 0,
      sessions: stats.active_sessions ?? stats.total_sessions ?? 0
    }));
  }, [stats]);

  useEffect(() => {
    if (!hasFetchedQuestions || questionTotal === undefined) {
      return;
    }

    setCounts((prev) => ({ ...prev, questions: questionTotal }));
  }, [hasFetchedQuestions, questionTotal]);

  /**
   * Manual refresh helper that reloads both AdminStats and supplemental counts.
   * ✅ FIX: Keep refreshStats in dependencies, but loadCounts is accessed via ref
   */
  const refresh = useCallback(async () => {
    if (!loadCountsRef.current) return;
    
    setLoading(true);
    const [{ updates, errors }] = await Promise.all([
      loadCountsRef.current(),
      refreshStats().catch((err) => {
        console.error('[useAdminSidebarBadges] Failed to refresh admin stats', err);
      })
    ]);

    setCounts((prev) => ({ ...prev, ...updates }));
    setError(errors.length > 0 ? errors.join(' | ') : null);
    setLoading(false);
  }, [refreshStats]); // Remove loadCounts from dependencies

  const combinedLoading = useMemo(() => loading || statsLoading, [loading, statsLoading]);
  const combinedError = useMemo(() => error ?? statsError ?? null, [error, statsError]);

  return {
    counts,
    loading: combinedLoading,
    error: combinedError,
    refresh
  };
}

export type UseAdminSidebarBadgesReturn = ReturnType<typeof useAdminSidebarBadges>;
