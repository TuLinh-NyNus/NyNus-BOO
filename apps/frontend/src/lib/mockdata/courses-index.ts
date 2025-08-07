/**
 * Courses Mock Data Index
 * Export tất cả courses-related data và functions
 */

// Export types
export type {
  MockCourse,
  MockTutorial,
  MockLesson,
  MockChapter,
  MockResource,
  MockReview,
  MockProgress,
  MockTutorialFilterParams,
  SearchFilters,
  AdvancedSearchFilters,
  SortOption,
  MockTutorialsResponse,
  MockCoursesResponse
} from './courses-types';

// Export data
export {
  mockFrontendCourses,
  mockTutorials,
  getCoursesByCategory,
  getCourseBySlug,
  getFeaturedCourses,
  getPopularCourses
} from './courses-frontend';

// Export course details
export {
  mockChapters,
  mockLessons,
  mockResources,
  mockReviews,
  getChaptersByCourseId,
  getReviewsByCourseId,
  getLessonById,
  getLessonsByCourseId
} from './course-details';
