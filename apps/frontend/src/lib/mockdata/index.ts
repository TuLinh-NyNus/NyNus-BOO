/**
 * Mock Data Index
 * 
 * Central export file cho tất cả mockdata trong admin system
 * Sử dụng để thay thế API calls trong quá trình migration
 */

// Export types
export * from './types';

// Export users mockdata
export {
  mockUsers,
  getUserById,
  getUsersByRole,
  getActiveUsers,
  searchUsers,
  getMockUsersResponse
} from './users';

// Export questions mockdata
export {
  mockQuestions,
  getQuestionById,
  getQuestionsBySubject,
  getQuestionsByGrade,
  getQuestionsByDifficulty,
  searchQuestions,
  getMockQuestionsResponse
} from './questions';

// Export courses mockdata
export {
  mockCourses,
  getCourseById,
  getCoursesByInstructor,
  getCoursesByCategory,
  getFeaturedCourses,
  getPopularCourses,
  searchCourses,
  getMockCoursesResponse
} from './courses';

// Export analytics mockdata
export {
  mockAnalytics,
  mockSystemMetrics,
  mockRevenueMetrics,
  getAnalyticsOverview,
  getUserGrowthData,
  getQuestionUsageData,
  getTopPerformers,
  getCourseProgressData,
  getMockAnalyticsResponse,
  getMockSystemMetricsResponse,
  getMockRevenueMetricsResponse
} from './analytics';

// Export sessions mockdata
export {
  mockSessions,
  mockSessionStats,
  getSessionById,
  getSessionsByUser,
  getSessionsByExam,
  getActiveSessions,
  getCompletedSessions,
  getAbandonedSessions,
  getSessionsByDateRange,
  searchSessions,
  getMockSessionsResponse,
  getMockSessionStatsResponse
} from './sessions';

// Export notifications mockdata
export {
  mockSystemNotifications,
  mockNotificationStats,
  getNotificationById,
  getNotificationsByUser,
  getUnreadNotifications as getUnreadSystemNotifications,
  getNotificationsByType,
  searchNotifications,
  filterNotificationsByReadStatus,
  getNotificationsByDateRange,
  getMockNotificationsResponse,
  getMockNotificationStatsResponse,
  type SystemNotification,
  type NotificationStats
} from './notifications';

// Export books mockdata
export {
  mockBooks,
  mockBookStats,
  getBookById,
  getBooksByCategory,
  getBooksByAuthor,
  getActiveBooks,
  getTopRatedBooks,
  getMostDownloadedBooks,
  searchBooks,
  getMockBooksResponse,
  getMockBookStatsResponse
} from './books';

// Export FAQ mockdata
export {
  mockFAQs,
  mockFAQStats,
  getFAQById,
  getFAQsByCategory,
  getPublishedFAQs,
  getDraftFAQs,
  getMostViewedFAQs,
  getMostHelpfulFAQs,
  searchFAQs,
  getMockFAQsResponse,
  getMockFAQStatsResponse
} from './faq';

// Export forum mockdata
export {
  mockForumPosts,
  mockForumStats,
  getPostById,
  getPostsByCategory,
  getPostsByAuthor,
  getStickyPosts,
  getLockedPosts,
  getMostViewedPosts,
  getMostRepliedPosts,
  getRecentPosts,
  searchPosts,
  getMockForumPostsResponse,
  getMockForumStatsResponse
} from './forum';

// Export settings mockdata
export {
  mockSettings,
  mockSettingsStats,
  getSettingById,
  getSettingByKey,
  getSettingsByCategory,
  getPublicSettings,
  getPrivateSettings,
  getSettingsByType,
  searchSettings,
  getSettingValue,
  getMockSettingsResponse,
  getMockSettingsStatsResponse
} from './settings';

// Export resource access mockdata
export {
  mockResourceAccessLogs,
  mockResourceAccessStats,
  getResourceAccessById,
  getResourceAccessByUserId,
  getResourceAccessByType,
  getResourceAccessByAction,
  getHighRiskAccess,
  getFailedAccess,
  searchResourceAccess,
  getMockResourceAccessResponse,
  getMockResourceAccessStatsResponse
} from './resource-access';

// Export enhanced authentication mockdata
export {
  mockEnhancedSessions,
  mockOAuthAccounts,
  mockResourceAccess,
  mockUserPreferences,
  mockAuditLogs,
  mockNotifications,
  getSessionsByUser as getEnhancedSessionsByUser,
  getActiveSessions as getActiveEnhancedSessions,
  getResourceAccessByUser,
  getHighRiskAccess as getHighRiskAccessAuth,
  getUnreadNotifications,
  getAuditLogsByUser,
  getMockEnhancedSessionsResponse
} from './auth-enhanced';

// Export enhanced questions mockdata
export {
  mockQuestionCodes,
  mockEnhancedQuestions,
  mockQuestionImages,
  mockQuestionTags,
  mockQuestionFeedback,
  mockMapCodeConfig,
  getQuestionsByCode,
  getQuestionsByStatus,
  getQuestionsByType,
  translateQuestionCode,
  searchEnhancedQuestions,
  getMockEnhancedQuestionsResponse
} from './questions-enhanced';

// Export admin dashboard mockdata
export {
  mockDashboardMetrics,
  mockSystemStatus,
  mockRecentActivities,
  adminDashboardMockService,
  getFormattedDashboardMetrics,
  getSystemStatusWithLabels,
  getActivitySeverityColor,
  type DashboardMetrics,
  type SystemStatus,
  type RecentActivity
} from './admin-dashboard';

// Export admin roles mockdata
export {
  mockPermissions,
  mockRoles,
  adminRolesMockService,
  getPermissionCategories,
  roleHasPermission,
  type Permission,
  type Role
} from './admin-roles';

// Export admin header mockdata
export {
  mockAdminUser,
  mockNotifications as mockAdminNotifications,
  mockSearchSuggestions,
  adminHeaderMockService,
  getNotificationTypeColor,
  getNotificationTypeIcon,
  formatNotificationTimestamp,
  type AdminUser,
  type AdminNotification,
  type SearchSuggestion
} from './admin-header';

// Export admin sidebar mockdata
export {
  mockMainNavigation,
  mockManagementNavigation,
  mockSystemNavigation,
  mockAdvancedNavigation,
  mockNavigationSections,
  mockUserPermissions,
  adminSidebarMockService,
  NavigationUtils,
  type NavigationItem,
  type NavigationSection,
  type UserPermissions
} from './admin-sidebar';

// Export security mockdata
export {
  mockSecurityMetrics,
  mockSecurityEvents,
  mockAuditStats,
  mockEnhancedAuditLogs,
  getSecurityMetrics,
  getSecurityEvents,
  getAuditLogs,
  getAuditStats,
  securityMockService,
  type SecurityMetrics,
  type SecurityEvent,
  type AuditLog,
  type AuditStats
} from './security';

// Export level progression mockdata
export {
  mockProgressionSettings,
  mockProgressionStatistics,
  mockAuditLogs as mockProgressionAuditLogs,
  mockProgressionHistory,
  getProgressionSettings,
  getProgressionStatistics,
  getAuditLogs as getProgressionAuditLogs,
  getProgressionHistory,
  updateProgressionSettings,
  type ProgressionSettings,
  type ProgressionStatistics,
  type AuditLogEntry as ProgressionAuditLogEntry,
  type ProgressionHistoryEntry
} from './level-progression';

// Export mapcode mockdata
export {
  mockMapCodeVersions,
  mockMapCodeStatistics,
  getMapCodeVersions,
  activateMapCodeVersion,
  deleteMapCodeVersion,
  exportMapCodeVersion,
  saveMapCodeVersion,
  type MapCodeVersion,
  type MapCodeStatistics
} from './mapcode';

// Export user management mockdata
export {
  mockBulkOperations,
  mockPromotionRequests,
  mockUserActivities,
  mockUserSessions,
  mockSecurityEvents as mockUserSecurityEvents,
  performBulkRolePromotion,
  getPromotionRequests,
  getUserActivities,
  getUserSessions,
  getSecurityEvents as getUserSecurityEvents,
  terminateUserSession,
  resolveSecurityEvent,
  type BulkRolePromotionData,
  type BulkOperationResult,
  type PromotionWorkflowStep,
  type PromotionRequest,
  type UserActivity,
  type UserSession,
  type SecurityEvent as UserSecurityEvent,
  type UserFilterOptions
} from './user-management';

// Export role management mockdata
export {
  mockPermissionCategories,
  mockPermissionLevels,
  mockRolePermissions,
  mockRoleHierarchy,
  mockRoleRelationships,
  mockPromotionPaths,
  mockPermissionTemplates,
  getRoleHierarchy,
  getPermissionMatrix,
  getRolePermissions,
  updateRolePermissions,
  getPermissionTemplates,
  applyPermissionTemplate,
  createPermissionTemplate,
  validateRolePromotion,
  type RolePermission,
  type PermissionCategory,
  type PermissionLevel,
  type RoleHierarchyNode,
  type RoleRelationship,
  type PromotionPath,
  type PermissionTemplate,
  type PermissionMatrixResponse,
  type RoleHierarchyResponse
} from './role-management';

// Export homepage mockdata
export {
  heroData,
  featuresData,
  aiLearningData,
  type HeroData,
  type FeaturesData,
  type AILearningData,
  type FeatureItem
} from './homepage';

export {
  featuredCourses,
  getGradient,
  type FeaturedCourse
} from './featured-courses';

export {
  homepageFAQData,
  type HomepageFAQ
} from './homepage-faq';

// ✅ REMOVED: Duplicate utility functions - now imported from utils.ts
// Import consolidated utilities
import { MockDataUtils } from './utils';

// ✅ REMOVED: Remaining duplicate utility functions
// All utilities are now available from MockDataUtils imported above

// ✅ REMOVED: Duplicate constants - now imported from core-types.ts
// Import consolidated constants
import { MOCK_DATA_CONSTANTS } from './core-types';

// Import all mockdata for default export
import { mockUsers } from './users';
import { mockQuestions } from './questions';
import { mockCourses } from './courses';
import { mockAnalytics } from './analytics';
import { mockSessions } from './sessions';
import { mockSystemNotifications, mockNotificationStats } from './notifications';
import { mockBooks } from './books';
import { mockFAQs } from './faq';
import { mockForumPosts } from './forum';
import { mockSettings } from './settings';
import { mockEnhancedSessions, mockOAuthAccounts, mockResourceAccess, mockUserPreferences, mockAuditLogs, mockNotifications } from './auth-enhanced';
import { mockQuestionCodes, mockEnhancedQuestions, mockQuestionImages, mockQuestionTags, mockQuestionFeedback, mockMapCodeConfig } from './questions-enhanced';
import { mockProgressionSettings, mockProgressionStatistics, mockProgressionHistory } from './level-progression';
import { mockMapCodeVersions, mockMapCodeStatistics } from './mapcode';

// Export default object with all mockdata
const mockDataExports = {
  users: mockUsers,
  questions: mockQuestions,
  courses: mockCourses,
  analytics: mockAnalytics,
  sessions: mockSessions,
  systemNotifications: mockSystemNotifications,
  notificationStats: mockNotificationStats,
  books: mockBooks,
  faqs: mockFAQs,
  forum: mockForumPosts,
  settings: mockSettings,
  // Enhanced authentication data
  enhancedSessions: mockEnhancedSessions,
  oauthAccounts: mockOAuthAccounts,
  resourceAccess: mockResourceAccess,
  userPreferences: mockUserPreferences,
  auditLogs: mockAuditLogs,
  notifications: mockNotifications,
  // Enhanced questions data
  questionCodes: mockQuestionCodes,
  enhancedQuestions: mockEnhancedQuestions,
  questionImages: mockQuestionImages,
  questionTags: mockQuestionTags,
  questionFeedback: mockQuestionFeedback,
  mapCodeConfig: mockMapCodeConfig,
  // Level progression data
  progressionSettings: mockProgressionSettings,
  progressionStatistics: mockProgressionStatistics,
  progressionHistory: mockProgressionHistory,
  // MapCode data
  mapCodeVersions: mockMapCodeVersions,
  mapCodeStatistics: mockMapCodeStatistics,
  utils: MockDataUtils,
  constants: MOCK_DATA_CONSTANTS // ✅ Fixed: Use correct constant name
};

export default mockDataExports;
