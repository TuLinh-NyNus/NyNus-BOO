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

/**
 * Admin Constants
 * Common constants for admin interface
 */
export const ADMIN_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File uploads
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],

  // Timeouts
  DEFAULT_TIMEOUT_MS: 30000,
  SEARCH_DEBOUNCE_MS: 300,
  NOTIFICATION_TIMEOUT_MS: 5000,

  // Limits
  MAX_TAGS: 10,
  MAX_CATEGORIES: 50,
  MAX_PERMISSIONS: 100,

  // Refresh intervals
  DASHBOARD_REFRESH_MS: 30000,
  NOTIFICATIONS_REFRESH_MS: 60000,
  SECURITY_REFRESH_MS: 10000
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
