/**
 * Users Mockdata Index
 * Central export file cho tất cả users mockdata
 */

// Export admin users mockdata
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
  getMockUserStats
} from './admin-users';

// Export student users mockdata
export {
  mockStudentUsers,
  getStudentById,
  getActiveStudents,
  getStudentsByLevel,
  searchStudents
} from './student-users';

// Export instructor users mockdata
export {
  mockInstructorUsers,
  getInstructorById,
  getActiveInstructors,
  getInstructorsByRole,
  searchInstructors
} from './instructor-users';
