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
  UserPermissions,
  AdminSidebarProps,
  NavItemProps,
  NavSectionProps,
  AdminLogoProps,
  SidebarState,
  SidebarActions,
  AdminSidebarConfig,
  NavigationBadgeType,
  NavigationBadge,
  ActiveNavigationDetection,
  NavigationContextValue,
  NavigationProviderProps,
  UseAdminSidebarReturn,
  BreadcrumbItem,
  BreadcrumbProps,
  NavigationIcon,
  NavigationPermission,
  NavigationRoute,
  NavigationItemId,
  NavigationSectionId
} from './navigation';

export {
  DEFAULT_ADMIN_SIDEBAR_CONFIG
} from './navigation';

// ===== HEADER TYPES =====
export type {
  AdminHeaderProps,
  AdminNotification,
  NotificationType,
  SearchCategory,
  SearchSuggestion,
  SearchResult,
  SearchResponse,
  SearchBarProps,
  SearchDropdownProps,
  UserMenuProps,
  NotificationDropdownProps,
  AdminSearchProps,
  SearchSuggestionsProps,
  AdminUserMenuProps,
  ThemeToggleProps,
  AdminNotificationsProps,
  NotificationItemProps,
  HeaderSearchState,
  HeaderSearchActions,
  HeaderNotificationsState,
  HeaderNotificationsActions,
  HeaderUserState,
  HeaderUserActions,
  UseAdminSearchReturn,
  UseAdminNotificationsReturn,
  UseAdminUserReturn,
  AdminHeaderConfig
} from './header';

export {
  DEFAULT_ADMIN_HEADER_CONFIG,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_TYPE_ICONS,
  SEARCH_TYPE_ICONS
} from './header';

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

// ===== UTILITY TYPES =====

// Import types for type guards
import type { AdminError } from './layout';
import type { NavigationItem } from './navigation';
import type { AdminNotification } from './header';
import type { SecurityEvent } from './security';

/**
 * Admin Type Guards
 * Type guards for admin types
 */
export const adminTypeGuards = {
  isAdminError: (obj: unknown): obj is AdminError => {
    return obj !== null && typeof obj === 'object' &&
           typeof (obj as AdminError).id === 'string' &&
           typeof (obj as AdminError).message === 'string';
  },

  isNavigationItem: (obj: unknown): obj is NavigationItem => {
    return obj !== null && typeof obj === 'object' &&
           typeof (obj as NavigationItem).id === 'string' &&
           typeof (obj as NavigationItem).name === 'string' &&
           typeof (obj as NavigationItem).href === 'string';
  },

  isAdminNotification: (obj: unknown): obj is AdminNotification => {
    return obj !== null && typeof obj === 'object' &&
           typeof (obj as AdminNotification).id === 'string' &&
           typeof (obj as AdminNotification).title === 'string';
  },

  isSecurityEvent: (obj: unknown): obj is SecurityEvent => {
    return obj !== null && typeof obj === 'object' &&
           typeof (obj as SecurityEvent).id === 'string' &&
           typeof (obj as SecurityEvent).type === 'string';
  }
};

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
