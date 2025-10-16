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
  getUsersByStatus,
  getActiveUsers,
  getHighRiskUsers,
  getLockedUsers,
  getUsersWithMultipleSessions,
  searchUsers,
  getMockUsersResponse,
  getMockUserStats,
  // Student users
  mockStudentUsers,
  getStudentById,
  getActiveStudents,
  getStudentsByLevel,
  searchStudents,
  // Instructor users
  mockInstructorUsers,
  getInstructorById,
  getActiveInstructors,
  getInstructorsByRole,
  searchInstructors
} from './users';

// Export questions mockdata
export {
  mockQuestions,
  getQuestionById,
  getQuestionsBySubject,
  getQuestionsByGrade,
  getQuestionsByDifficulty,
  searchQuestions,
  getMockQuestionsResponse,
  // Enhanced questions
  mockEnhancedQuestions,
  mockQuestionImages,
  mockQuestionTags,
  mockQuestionFeedback,
  getEnhancedQuestionById,
  getEnhancedQuestionsByType,
  getEnhancedQuestionsByDifficulty,
  getMockEnhancedQuestionsResponse,
  // Question codes
  mockQuestionCodes,
  mockMapCodeConfig,
  getQuestionCodeById,
  getQuestionCodesByGrade,
  getQuestionCodesBySubject,
  getQuestionCodesByLevel,
  parseQuestionCode,
  generateQuestionCode,
  getMockQuestionCodesResponse
} from './questions';

// Export courses mockdata
export {
  // Featured courses (frontend)
  mockFrontendCourses,
  mockTutorials,
  getCoursesByCategory,
  getCourseBySlug,
  getFeaturedCourses,
  getPopularCourses,
  // Admin courses
  getMockCoursesResponse
} from './courses';

// Export homepage featured courses
export type { FeaturedCourse } from './homepage-featured-courses';
export {
  featuredCourses as homepageFeaturedCourses,
  getHomepageFeaturedCourses,
  getGradient
} from './homepage-featured-courses';

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
} from './analytics/analytics';

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
} from './content/books';

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
} from './content/faq';

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
} from './content/forum';

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
} from './auth/auth-enhanced';

// Enhanced questions exports are now included in questions export above

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
} from './admin';

// Export admin roles mockdata
export {
  mockPermissions,
  mockRoles,
  adminRolesMockService,
  getPermissionCategories,
  roleHasPermission,
  type Permission,
  type Role
} from './admin';

// Export admin header mockdata
export {
  mockAdminHeaderUser,
  mockNotifications as mockAdminNotifications,
  mockSearchSuggestions,
  adminHeaderMockService,
  getNotificationTypeColor,
  getNotificationTypeIcon,
  formatNotificationTimestamp,
  type AdminUser,
  type AdminNotification,
  type SearchSuggestion
} from './admin';

// Export auth mockdata
export {
  mockAdminUser,
  type User as AuthUser
} from './auth';

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
} from './admin';

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
} from './admin/security';

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
} from './admin/mapcode';

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

// Removed duplicate export - now exported above

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
import { mockAnalytics } from './analytics/analytics';
import { mockSessions } from './sessions';
import { mockSystemNotifications, mockNotificationStats } from './notifications';
import { mockBooks } from './content/books';
import { mockFAQs } from './content/faq';
import { mockForumPosts } from './content/forum';
import { mockSettings } from './settings';
import { mockEnhancedSessions, mockOAuthAccounts, mockResourceAccess, mockUserPreferences, mockAuditLogs, mockNotifications } from './auth/auth-enhanced';
import { mockQuestionCodes, mockEnhancedQuestions, mockQuestionImages, mockQuestionTags, mockQuestionFeedback, mockMapCodeConfig } from './questions';
import { mockProgressionSettings, mockProgressionStatistics, mockProgressionHistory } from './level-progression';
import { mockMapCodeVersions, mockMapCodeStatistics } from './admin/mapcode';

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
