/**
 * Instructor Users Mockdata
 * Mock data cho instructor/teacher users
 */

import {
  UserRole,
  UserStatus,
  ProfileVisibility
} from '../core-types';
import { AdminUser } from '../types';

// Mock instructor users data
export const mockInstructorUsers: AdminUser[] = [
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'instructor-001',
    email: 'instructor1@nynus.edu.vn',
    role: UserRole.TEACHER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date('2024-06-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T08:30:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-instructor-001',
    password_hash: '$2b$12$InstructorHashExample123456789',

    // ===== CORE BUSINESS LOGIC =====
    level: null, // Instructors không có level
    maxConcurrentSessions: 3,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-15T08:30:00Z'),
    lastLoginIp: '192.168.1.102',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 1,
    totalResourceAccess: 500,
    riskScore: 5,

    // ===== PROFILE INFORMATION =====
    username: 'instructor_math',
    firstName: 'Trần',
    lastName: 'Thị B',
    avatar: '/avatars/instructor-001.jpg',
    bio: 'Giáo viên Toán học với 10 năm kinh nghiệm',
    phone: '+84901234569',
    address: '789 Nguyễn Huệ, Q1, TP.HCM',
    school: 'Đại học Sư phạm TP.HCM',
    dateOfBirth: new Date('1985-07-20'),

    // ===== ADMIN FIELDS =====
    adminNotes: 'Giáo viên xuất sắc, có nhiều đóng góp cho hệ thống',
    maxConcurrentIPs: 3,

    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Giáo viên Toán học với 10 năm kinh nghiệm',
      phoneNumber: '+84901234569',
      completionRate: 95,
      preferences: {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        profileVisibility: ProfileVisibility.PUBLIC,
        notifications: {
          email: true,
          push: true,
          sms: true
        }
      }
    },
    stats: {
      totalExamResults: 0, // Instructors không làm exam
      totalCourses: 15, // Số khóa học đã tạo
      totalLessons: 200, // Số bài học đã tạo
      averageScore: 0 // Không áp dụng cho instructors
    }
  },
  {
    // ===== TUTOR USER =====
    id: 'tutor-001',
    email: 'tutor1@nynus.edu.vn',
    role: UserRole.TUTOR,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date('2024-08-15T00:00:00Z'),
    updatedAt: new Date('2025-01-15T08:30:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-tutor-001',
    password_hash: '$2b$12$TutorHashExample123456789',

    // ===== CORE BUSINESS LOGIC =====
    level: null, // Tutors không có level
    maxConcurrentSessions: 2,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-15T08:30:00Z'),
    lastLoginIp: '192.168.1.103',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 1,
    totalResourceAccess: 200,
    riskScore: 8,

    // ===== PROFILE INFORMATION =====
    username: 'tutor_physics',
    firstName: 'Lê',
    lastName: 'Văn C',
    avatar: '/avatars/tutor-001.jpg',
    bio: 'Sinh viên năm 4 Vật lý, hỗ trợ học sinh lớp 11-12',
    phone: '+84901234570',
    address: '321 Điện Biên Phủ, Q3, TP.HCM',
    school: 'Đại học Khoa học Tự nhiên',
    dateOfBirth: new Date('2002-11-10'),

    // ===== ADMIN FIELDS =====
    adminNotes: 'Tutor tích cực, được học sinh đánh giá cao',
    maxConcurrentIPs: 2,

    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Sinh viên năm 4 Vật lý, hỗ trợ học sinh lớp 11-12',
      phoneNumber: '+84901234570',
      completionRate: 80,
      preferences: {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        profileVisibility: ProfileVisibility.PUBLIC,
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      }
    },
    stats: {
      totalExamResults: 0, // Tutors không làm exam
      totalCourses: 3, // Số khóa học hỗ trợ
      totalLessons: 50, // Số bài học hỗ trợ
      averageScore: 0 // Không áp dụng cho tutors
    }
  }
];

// Helper functions
export function getInstructorById(id: string): AdminUser | undefined {
  return mockInstructorUsers.find(instructor => instructor.id === id);
}

export function getActiveInstructors(): AdminUser[] {
  return mockInstructorUsers.filter(instructor => instructor.status === UserStatus.ACTIVE);
}

export function getInstructorsByRole(role: UserRole): AdminUser[] {
  return mockInstructorUsers.filter(instructor => instructor.role === role);
}

export function searchInstructors(query: string): AdminUser[] {
  const searchTerm = query.toLowerCase();
  return mockInstructorUsers.filter(instructor =>
    instructor.firstName?.toLowerCase().includes(searchTerm) ||
    instructor.lastName?.toLowerCase().includes(searchTerm) ||
    instructor.email.toLowerCase().includes(searchTerm) ||
    instructor.username?.toLowerCase().includes(searchTerm)
  );
}
