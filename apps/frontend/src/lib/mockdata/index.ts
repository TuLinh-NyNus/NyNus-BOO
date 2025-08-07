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
  getHighRiskAccess,
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
  getRoleHierarchy,
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
import { mockBooks } from './books';
import { mockFAQs } from './faq';
import { mockForumPosts } from './forum';
import { mockSettings } from './settings';
import { mockEnhancedSessions, mockOAuthAccounts, mockResourceAccess, mockUserPreferences, mockAuditLogs, mockNotifications } from './auth-enhanced';
import { mockQuestionCodes, mockEnhancedQuestions, mockQuestionImages, mockQuestionTags, mockQuestionFeedback, mockMapCodeConfig } from './questions-enhanced';

// Export default object with all mockdata
const mockDataExports = {
  users: mockUsers,
  questions: mockQuestions,
  courses: mockCourses,
  analytics: mockAnalytics,
  sessions: mockSessions,
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
  utils: MockDataUtils,
  constants: MOCK_DATA_CONSTANTS // ✅ Fixed: Use correct constant name
};

export default mockDataExports;
