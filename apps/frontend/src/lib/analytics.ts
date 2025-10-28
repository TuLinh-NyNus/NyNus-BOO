/**
 * Analytics Utility Library
 * Google Analytics 4 (GA4) integration cho tracking user behavior
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

// ===== TYPES =====

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

export interface PageViewEvent {
  page_path: string;
  page_title: string;
  page_location: string;
  [key: string]: unknown;
}

export interface QuestionEvent {
  question_id: string;
  question_type?: string;
  category?: string;
  difficulty?: string;
}

export interface SearchEvent {
  search_term: string;
  search_filters?: Record<string, unknown>;
  result_count?: number;
}

// ===== GLOBAL GTAG DECLARATION =====

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

// ===== CONFIGURATION =====

/**
 * Get GA4 Measurement ID from environment
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Check if analytics is enabled
 */
export const isAnalyticsEnabled = (): boolean => {
  return Boolean(
    GA_MEASUREMENT_ID && 
    typeof window !== 'undefined' && 
    window.gtag
  );
};

// ===== CORE FUNCTIONS =====

/**
 * Initialize Google Analytics
 * Should be called in _app.tsx or root layout
 */
export const initAnalytics = (): void => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('[Analytics] GA_MEASUREMENT_ID not found in environment variables');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  console.log('[Analytics] Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
};

/**
 * Send pageview event to GA4
 * @param url - Page URL
 */
export const pageview = (url: string, title?: string): void => {
  if (!isAnalyticsEnabled()) return;

  const event: PageViewEvent = {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  };

  window.gtag!('event', 'page_view', event);
  
  console.log('[Analytics] Page view tracked:', event);
};

/**
 * Send custom event to GA4
 * @param event - Event data
 */
export const event = (eventData: AnalyticsEvent): void => {
  if (!isAnalyticsEnabled()) return;

  const { action, category, label, value, ...otherParams } = eventData;

  window.gtag!('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...otherParams,
  });

  console.log('[Analytics] Event tracked:', eventData);
};

// ===== QUESTION-SPECIFIC EVENTS =====

/**
 * Track question view event
 */
export const trackQuestionView = (data: QuestionEvent): void => {
  event({
    action: 'view_question',
    category: 'Questions',
    label: data.question_id,
    question_id: data.question_id,
    question_type: data.question_type,
    question_category: data.category,
    question_difficulty: data.difficulty,
  });
};

/**
 * Track question bookmark event
 */
export const trackQuestionBookmark = (data: QuestionEvent): void => {
  event({
    action: 'bookmark_question',
    category: 'Questions',
    label: data.question_id,
    question_id: data.question_id,
  });
};

/**
 * Track question share event
 */
export const trackQuestionShare = (data: QuestionEvent & { share_method?: string }): void => {
  event({
    action: 'share_question',
    category: 'Questions',
    label: data.question_id,
    question_id: data.question_id,
    share_method: data.share_method || 'unknown',
  });
};

// ===== SEARCH EVENTS =====

/**
 * Track search query event
 */
export const trackSearch = (data: SearchEvent): void => {
  event({
    action: 'search',
    category: 'Search',
    label: data.search_term,
    search_term: data.search_term,
    search_filters: data.search_filters ? JSON.stringify(data.search_filters) : undefined,
    result_count: data.result_count,
  });
};

/**
 * Track filter application
 */
export const trackFilterApply = (filterType: string, filterValue: string): void => {
  event({
    action: 'apply_filter',
    category: 'Filters',
    label: `${filterType}: ${filterValue}`,
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// ===== ADMIN EVENTS =====

/**
 * Track question creation (admin)
 */
export const trackQuestionCreate = (data: QuestionEvent): void => {
  event({
    action: 'create_question',
    category: 'Admin',
    label: data.question_type,
    question_type: data.question_type,
  });
};

/**
 * Track question update (admin)
 */
export const trackQuestionUpdate = (data: QuestionEvent): void => {
  event({
    action: 'update_question',
    category: 'Admin',
    label: data.question_id,
    question_id: data.question_id,
  });
};

/**
 * Track question delete (admin)
 */
export const trackQuestionDelete = (data: QuestionEvent): void => {
  event({
    action: 'delete_question',
    category: 'Admin',
    label: data.question_id,
    question_id: data.question_id,
  });
};

/**
 * Track bulk operation (admin)
 */
export const trackBulkOperation = (operation: string, count: number): void => {
  event({
    action: 'bulk_operation',
    category: 'Admin',
    label: operation,
    operation_type: operation,
    item_count: count,
  });
};

// ===== ERROR TRACKING =====

/**
 * Track errors for monitoring
 */
export const trackError = (error: Error, context?: string): void => {
  event({
    action: 'error',
    category: 'Errors',
    label: error.message,
    error_message: error.message,
    error_stack: error.stack?.substring(0, 500), // Limit stack trace length
    error_context: context,
  });
};

// ===== USER INTERACTIONS =====

/**
 * Track button clicks
 */
export const trackButtonClick = (buttonName: string, location?: string): void => {
  event({
    action: 'button_click',
    category: 'Engagement',
    label: buttonName,
    button_name: buttonName,
    button_location: location,
  });
};

/**
 * Track form submissions
 */
export const trackFormSubmit = (formName: string, success: boolean): void => {
  event({
    action: 'form_submit',
    category: 'Forms',
    label: formName,
    form_name: formName,
    form_success: success,
  });
};

// ===== CONSENT MANAGEMENT =====

/**
 * Update analytics consent
 * For GDPR compliance
 */
export const updateConsent = (granted: boolean): void => {
  if (!isAnalyticsEnabled()) return;

  window.gtag!('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
  });

  console.log('[Analytics] Consent updated:', granted ? 'granted' : 'denied');
};

// ===== REACT HOOK =====

/**
 * useAnalytics Hook
 * React hook for accessing analytics functions
 */
export const useAnalytics = () => {
  return {
    trackEvent: event,
    trackPageView: pageview,
    trackQuestionView,
    trackQuestionBookmark,
    trackQuestionShare,
    trackSearch,
    trackFilterApply,
    trackQuestionCreate,
    trackQuestionUpdate,
    trackQuestionDelete,
    trackBulkOperation,
    trackError,
    trackButtonClick,
    trackFormSubmit,
    updateConsent,
    isEnabled: isAnalyticsEnabled(),
  };
};

// ===== EXPORTS =====
const analyticsModule = {
  init: initAnalytics,
  pageview,
  event,
  trackQuestionView,
  trackQuestionBookmark,
  trackQuestionShare,
  trackSearch,
  trackFilterApply,
  trackQuestionCreate,
  trackQuestionUpdate,
  trackQuestionDelete,
  trackBulkOperation,
  trackError,
  trackButtonClick,
  trackFormSubmit,
  updateConsent,
  isEnabled: isAnalyticsEnabled,
};

export default analyticsModule;
