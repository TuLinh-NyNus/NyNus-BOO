/**
 * Admin Types Index
 * Central export file for all admin-related types
 */

// ===== LAYOUT TYPES =====
export type {
  AdminLayoutProps,
  AdminLayoutConfig,
  AdminLayoutState,
  AdminLayoutActions,
  ResponsiveBreakpoint,
  AdminLayoutContextValue,
  AdminLayoutProviderProps,
  AdminError,
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState,
  AdminThemeConfig,
  AdminThemeContextValue,
  UseAdminLayoutReturn,
  AdminProviderProps,
  AdminErrorProviderProps,
  AdminErrorContextValue,
  ConnectionStatus
} from './layout';

export {
  DEFAULT_ADMIN_LAYOUT_CONFIG
} from './layout';

// ===== NAVIGATION TYPES =====
export type {
  NavigationItem,
  NavigationSection,
  NavigationRoute,
  NavigationIcon,
  NavigationContextValue,
  NavigationProviderProps,
  BreadcrumbItem,
  BreadcrumbProps,
  UseAdminSidebarReturn,
  AdminSidebarProps,
  AdminSidebarConfig
} from './navigation';

export {
  DEFAULT_ADMIN_SIDEBAR_CONFIG
} from './navigation';

// ===== HEADER TYPES =====
export type {
  AdminHeaderProps,
  AdminUser,
  AdminNotification,
  NotificationType,
  SearchResult,
  SearchCategory,
  UserMenuProps,
  AdminNotificationsProps,
  AdminSearchProps,
  AdminHeaderConfig,
  UseAdminSearchReturn
} from './header';

export {
  DEFAULT_ADMIN_HEADER_CONFIG
} from './header';

// ===== SIDEBAR TYPES =====
export * from './sidebar';

// ===== BREADCRUMB TYPES =====
export * from './breadcrumb';

// ===== DASHBOARD TYPES =====
export type {
  DashboardMetrics,
  SystemStatus,
  AdminAnalytics,
  DashboardWidgetType,
  DashboardWidget,
  DashboardWidgetConfig,
  ChartDataPoint,
  ChartSeries,
  ChartConfig,
  ActivityLogEntry,
  RealTimeEvent,
  DashboardState,
  DashboardActions,
  UseDashboardReturn,
  DashboardConfig
} from './dashboard';

export {
  DEFAULT_DASHBOARD_CONFIG
} from './dashboard';

// ===== SECURITY TYPES =====
export type {
  AuditLogEntry,
  AuditLogFilter,
  SecurityEvent,
  SecurityEventType,
  SecuritySeverity,
  Permission,
  PermissionCondition,
  Role,
  UserSession,
  SessionFilter,
  SecuritySettings,
  PasswordPolicy,
  SessionPolicy,
  LoginPolicy,
  AuditPolicy,
  EncryptionSettings,
  SecurityDashboardMetrics,
  SecurityAlert,
  SecurityState,
  SecurityActions,
  UseSecurityReturn
} from './security';

// ===== FORM TYPES =====
export type {
  FormFieldType,
  FormField,
  FormFieldOption,
  FormFieldValidation,
  FormFieldDependency,
  AdminUserForm,
  AdminCourseForm,
  AdminQuestionForm,
  QuestionOptionForm,
  AdminSettingsForm,
  FormState,
  FormActions,
  FormConfig,
  FormSchema,
  FormSection,
  UseFormReturn,
  FormFieldProps,
  BulkOperationForm,
  ImportForm
} from './forms';

export {
  DEFAULT_FORM_CONFIG
} from './forms';

// ===== CONTENT TYPES =====
export type {
  AdminCourse,
  AdminChapter,
  AdminLesson,
  LessonAttachment,
  AdminQuestion,
  QuestionOption,
  QuestionBank,
  AdminBook,
  FAQItem,
  FAQCategory,
  ContentFilter,
  ContentStatistics,
  ContentState,
  ContentActions,
  UseContentReturn
} from './content';

// ===== ADMIN CONSTANTS =====

import { TIMEOUTS, LIMITS } from '@/lib/constants/timeouts';

/**
 * Admin Constants
 * Common constants for admin interface
 */
export const ADMIN_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: LIMITS.ADMIN_DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE: LIMITS.MAX_PAGE_SIZE,

  // File uploads
  MAX_FILE_SIZE_MB: LIMITS.MAX_FILE_SIZE_MB,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],

  // Timeouts
  DEFAULT_TIMEOUT_MS: TIMEOUTS.LONG_TIMEOUT_MS,
  SEARCH_DEBOUNCE_MS: TIMEOUTS.SEARCH_DEBOUNCE_MS,
  NOTIFICATION_TIMEOUT_MS: TIMEOUTS.NOTIFICATION_TIMEOUT_MS,

  // Limits
  MAX_TAGS: LIMITS.MAX_TAGS,
  MAX_CATEGORIES: LIMITS.MAX_CATEGORIES,
  MAX_PERMISSIONS: LIMITS.MAX_PERMISSIONS,

  // Refresh intervals
  DASHBOARD_REFRESH_MS: TIMEOUTS.DASHBOARD_REFRESH_MS,
  NOTIFICATIONS_REFRESH_MS: TIMEOUTS.NOTIFICATIONS_REFRESH_MS,
  SECURITY_REFRESH_MS: TIMEOUTS.SECURITY_REFRESH_MS
} as const;

// ===== DEFAULT VALUES =====

/**
 * Admin Default Values
 * Default values for admin forms and components
 */
export const ADMIN_DEFAULTS = {
  pagination: {
    page: 1,
    limit: 20
  },

  course: {
    level: 'beginner' as const,
    language: 'vi',
    featured: false,
    popular: false,
    isPublished: false,
    hasSubtitles: false,
    hasCertificate: false
  },

  question: {
    type: 'multiple-choice' as const,
    difficulty: 'medium' as const,
    points: 1,
    isActive: true
  },

  user: {
    status: 'PENDING_VERIFICATION' as const,
    emailVerified: false,
    level: 1,
    maxConcurrentSessions: 3
  }
} as const;
