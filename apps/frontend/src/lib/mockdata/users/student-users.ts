/**
 * Student Users Mockdata
 * Mock data cho student users
 */

import {
  UserRole as MockdataUserRole,
  UserStatus as MockdataUserStatus,
  ProfileVisibility
} from '../core-types';
import { AdminUser } from '../types';

// Import enum types for function parameters
import {
  convertEnumRoleToProtobuf,
  convertEnumStatusToProtobuf,
  isProtobufStatusEqual
} from '@/lib/utils/type-converters';

// Mock student users data
export const mockStudentUsers: AdminUser[] = [
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'student-001',
    email: 'student1@nynus.edu.vn',
    role: convertEnumRoleToProtobuf(MockdataUserRole.STUDENT),
    status: convertEnumStatusToProtobuf(MockdataUserStatus.ACTIVE),
    emailVerified: true,
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T08:30:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-student-001',
    password_hash: '$2b$12$StudentHashExample123456789',

    // ===== CORE BUSINESS LOGIC =====
    level: 1,
    maxConcurrentSessions: 2,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-15T08:30:00Z'),
    lastLoginIp: '192.168.1.101',
    loginAttempts: 0,
    lockedUntil: undefined,
    activeSessionsCount: 1,
    totalResourceAccess: 150,
    riskScore: 10,

    // ===== PROFILE INFORMATION =====
    username: 'student_001',
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    avatar: '/avatars/student-001.svg',
    bio: 'Học sinh lớp 12, đang ôn thi THPT Quốc gia',
    phone: '+84901234568',
    address: '456 Lê Lợi, Q1, TP.HCM',
    school: 'THPT Nguyễn Du',
    dateOfBirth: new Date('2006-03-15'),

    // ===== ADMIN FIELDS =====
    adminNotes: 'Học sinh tích cực, thường xuyên tham gia các khóa học',
    maxConcurrentIPs: 2,

    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Học sinh lớp 12, đang ôn thi THPT Quốc gia',
      phoneNumber: '+84901234568',
      completionRate: 75,
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
      totalExamResults: 25,
      totalCourses: 5,
      totalLessons: 120,
      averageScore: 7.5
    }
  }
];

// Helper functions
export function getStudentById(id: string): AdminUser | undefined {
  return mockStudentUsers.find(student => student.id === id);
}

export function getActiveStudents(): AdminUser[] {
  return mockStudentUsers.filter(student => isProtobufStatusEqual(student.status, MockdataUserStatus.ACTIVE));
}

export function getStudentsByLevel(level: number): AdminUser[] {
  return mockStudentUsers.filter(student => student.level === level);
}

export function searchStudents(query: string): AdminUser[] {
  const searchTerm = query.toLowerCase();
  return mockStudentUsers.filter(student =>
    student.firstName?.toLowerCase().includes(searchTerm) ||
    student.lastName?.toLowerCase().includes(searchTerm) ||
    student.email.toLowerCase().includes(searchTerm) ||
    student.username?.toLowerCase().includes(searchTerm)
  );
}
