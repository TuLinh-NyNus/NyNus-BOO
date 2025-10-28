/**
 * useAnalytics Hook
 * React hook để sử dụng analytics trong components
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import * as analytics from '@/lib/analytics';
import type { AnalyticsEvent, QuestionEvent, SearchEvent } from '@/lib/analytics';

// ===== TYPES =====

export interface UseAnalyticsReturn {
  /** Track custom event */
  trackEvent: typeof analytics.event;
  /** Track question view */
  trackQuestionView: typeof analytics.trackQuestionView;
  /** Track question bookmark */
  trackQuestionBookmark: typeof analytics.trackQuestionBookmark;
  /** Track question share */
  trackQuestionShare: typeof analytics.trackQuestionShare;
  /** Track search */
  trackSearch: typeof analytics.trackSearch;
  /** Track filter apply */
  trackFilterApply: typeof analytics.trackFilterApply;
  /** Track button click */
  trackButtonClick: typeof analytics.trackButtonClick;
  /** Track form submit */
  trackFormSubmit: typeof analytics.trackFormSubmit;
  /** Track error */
  trackError: typeof analytics.trackError;
  /** Check if analytics is enabled */
  isEnabled: boolean;
}

// ===== MAIN HOOK =====

/**
 * useAnalytics Hook
 * Provides analytics tracking functions với automatic pageview tracking
 * 
 * @param options - Hook options
 * @returns Analytics tracking functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackQuestionView, trackButtonClick } = useAnalytics();
 *   
 *   const handleQuestionClick = (id: string) => {
 *     trackQuestionView({ question_id: id });
 *   };
 *   
 *   return <button onClick={() => trackButtonClick('submit_answer')}>Submit</button>;
 * }
 * ```
 */
export function useAnalytics(options?: {
  /** Whether to track pageviews automatically */
  trackPageviews?: boolean;
}): UseAnalyticsReturn {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackPageviews = options?.trackPageviews ?? true;

  // Auto-track pageviews on route change
  useEffect(() => {
    if (!trackPageviews) return;
    
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    analytics.pageview(url);
  }, [pathname, searchParams, trackPageviews]);

  // Memoize tracking functions with correct signatures from analytics.ts
  const trackEvent = useCallback((eventData: AnalyticsEvent) => {
    return analytics.event(eventData);
  }, []);
  const trackQuestionView = useCallback((data: QuestionEvent) => {
    return analytics.trackQuestionView(data);
  }, []);
  const trackQuestionBookmark = useCallback((data: QuestionEvent) => {
    return analytics.trackQuestionBookmark(data);
  }, []);
  const trackQuestionShare = useCallback((data: QuestionEvent & { share_method?: string }) => {
    return analytics.trackQuestionShare(data);
  }, []);
  const trackSearch = useCallback((data: SearchEvent) => {
    return analytics.trackSearch(data);
  }, []);
  const trackFilterApply = useCallback((filterType: string, filterValue: string) => {
    return analytics.trackFilterApply(filterType, filterValue);
  }, []);
  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    return analytics.trackButtonClick(buttonName, location);
  }, []);
  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    return analytics.trackFormSubmit(formName, success);
  }, []);
  const trackError = useCallback((error: Error, context?: string) => {
    return analytics.trackError(error, context);
  }, []);

  return {
    trackEvent,
    trackQuestionView,
    trackQuestionBookmark,
    trackQuestionShare,
    trackSearch,
    trackFilterApply,
    trackButtonClick,
    trackFormSubmit,
    trackError,
    isEnabled: analytics.isAnalyticsEnabled(),
  };
}

// ===== SPECIALIZED HOOKS =====

/**
 * useQuestionAnalytics Hook
 * Specialized hook for question-related analytics
 */
export function useQuestionAnalytics() {
  const { trackQuestionView, trackQuestionBookmark, trackQuestionShare } = useAnalytics({
    trackPageviews: false, // Parent component will handle pageviews
  });

  const trackView = useCallback((questionId: string, questionData?: {
    type?: string;
    category?: string;
    difficulty?: string;
  }) => {
    trackQuestionView({
      question_id: questionId,
      ...questionData,
    });
  }, [trackQuestionView]);

  const trackBookmark = useCallback((questionId: string) => {
    trackQuestionBookmark({ question_id: questionId });
  }, [trackQuestionBookmark]);

  const trackShare = useCallback((questionId: string, method?: string) => {
    trackQuestionShare({
      question_id: questionId,
      share_method: method,
    });
  }, [trackQuestionShare]);

  return {
    trackView,
    trackBookmark,
    trackShare,
  };
}

/**
 * useSearchAnalytics Hook
 * Specialized hook for search-related analytics
 */
export function useSearchAnalytics() {
  const { trackSearch, trackFilterApply } = useAnalytics({
    trackPageviews: false,
  });

  const trackSearchQuery = useCallback((
    query: string,
    filters?: Record<string, unknown>,
    resultCount?: number
  ) => {
    trackSearch({
      search_term: query,
      search_filters: filters,
      result_count: resultCount,
    });
  }, [trackSearch]);

  const trackFilter = useCallback((filterType: string, filterValue: string) => {
    trackFilterApply(filterType, filterValue);
  }, [trackFilterApply]);

  return {
    trackSearchQuery,
    trackFilter,
  };
}

/**
 * useAdminAnalytics Hook
 * Specialized hook for admin-related analytics
 */
export function useAdminAnalytics() {
  return {
    trackCreate: useCallback((type: string) => {
      analytics.trackQuestionCreate({ question_id: '', question_type: type });
    }, []),
    trackUpdate: useCallback((id: string) => {
      analytics.trackQuestionUpdate({ question_id: id });
    }, []),
    trackDelete: useCallback((id: string) => {
      analytics.trackQuestionDelete({ question_id: id });
    }, []),
    trackBulkOp: useCallback((operation: string, count: number) => {
      analytics.trackBulkOperation(operation, count);
    }, []),
  };
}

// ===== EXPORTS =====
export default useAnalytics;

