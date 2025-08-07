// Mock data for users - Admin management với Enhanced User Model
import {
  UserRole,
  UserStatus,
  MockPagination,
  MockApiResponse,
  ProfileVisibility
} from './core-types';
import { AdminUser, UserStats } from './types';

// Mock users data với Enhanced User Model từ AUTH_COMPLETE_GUIDE.md
export const mockUsers: AdminUser[] = [
  // Admin users
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'admin-001',
    email: 'admin@nynus.edu.vn',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,           // Thay vì isActive: true
    emailVerified: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T08:30:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-admin-001',
    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // hashed "admin123"

    // ===== CORE BUSINESS LOGIC =====
    level: null,                         // ADMIN không có level
    maxConcurrentSessions: 5,            // Admin có thể có nhiều sessions hơn

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-15T08:30:00Z'),
    lastLoginIp: '192.168.1.100',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 2,              // Đang có 2 sessions active
    totalResourceAccess: 1250,          // Tổng số lần truy cập tài nguyên
    riskScore: 5,                        // Low risk score cho admin

    // ===== PROFILE INFORMATION =====
    username: 'admin_nynus',
    firstName: 'Nguyễn',
    lastName: 'Quản Trị',
    avatar: '/avatars/admin-001.jpg',
    bio: 'Quản trị viên hệ thống NyNus',
    phone: '+84901234567',
    address: '123 Nguyễn Văn Linh, Q7, TP.HCM',
    school: 'Đại học Bách Khoa TP.HCM',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'male',

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'Super admin - Full access',
    maxConcurrentIPs: 5,                 // Legacy field
    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Chuyên gia quản trị hệ thống giáo dục với 10+ năm kinh nghiệm',
      phoneNumber: '+84901234567',
      completionRate: 100,
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
      totalExamResults: 0,              // Admin không làm exam
      totalCourses: 50,                 // Quản lý 50 courses
      totalLessons: 500,                // Quản lý 500 lessons
      averageScore: 0                   // Admin không có điểm
    }
  },
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'admin-002',
    email: 'admin2@nynus.edu.vn',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date('2024-02-15T00:00:00Z'),
    updatedAt: new Date('2025-01-14T16:45:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-admin-002',
    password_hash: '$2b$12$8HNvnHZyoKV3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // hashed "support123"

    // ===== CORE BUSINESS LOGIC =====
    level: null,                         // ADMIN không có level
    maxConcurrentSessions: 3,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-14T16:45:00Z'),
    lastLoginIp: '192.168.1.101',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 1,              // Đang có 1 session active
    totalResourceAccess: 850,
    riskScore: 8,                        // Low risk score

    // ===== PROFILE INFORMATION =====
    username: 'support_admin',
    firstName: 'Trần',
    lastName: 'Hỗ Trợ',
    avatar: '/avatars/admin-002.jpg',
    bio: 'Quản trị viên hỗ trợ',
    phone: '+84901234568',
    address: '456 Lê Văn Việt, Q9, TP.HCM',
    school: 'Đại học Công Nghệ TP.HCM',
    dateOfBirth: new Date('1990-08-20'),
    gender: 'female',

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'Support admin - Limited access',
    maxConcurrentIPs: 3,
    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Chuyên viên hỗ trợ kỹ thuật với 5+ năm kinh nghiệm',
      phoneNumber: '+84901234568',
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
      totalExamResults: 0,              // Admin không làm exam
      totalCourses: 30,                 // Quản lý 30 courses
      totalLessons: 300,                // Quản lý 300 lessons
      averageScore: 0                   // Admin không có điểm
    }
  },

  // Teacher users (thay vì Instructor theo Enhanced User Model)
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'teacher-001',
    email: 'gv.toan@nynus.edu.vn',
    role: UserRole.TEACHER,              // Thay từ INSTRUCTOR thành TEACHER
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date('2024-03-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T07:20:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-teacher-001',
    password_hash: '$2b$12$9IOwxZyoKV3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // hashed "teacher123"

    // ===== CORE BUSINESS LOGIC =====
    level: 7,                            // TEACHER Level 7 (1-9)
    maxConcurrentSessions: 3,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-15T07:20:00Z'),
    lastLoginIp: '192.168.1.102',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 2,              // Đang có 2 sessions active
    totalResourceAccess: 650,
    riskScore: 12,                       // Low risk score

    // ===== PROFILE INFORMATION =====
    username: 'teacher_toan',
    firstName: 'Lê',
    lastName: 'Văn Toán',
    avatar: '/avatars/teacher-001.jpg',
    bio: 'Giảng viên Toán học',
    phone: '+84901234569',
    address: '789 Võ Văn Tần, Q3, TP.HCM',
    school: 'Trường THPT Nguyễn Du',
    dateOfBirth: new Date('1980-12-10'),
    gender: 'male',

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'Experienced math teacher - Level 7',
    maxConcurrentIPs: 2,
    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Thạc sĩ Toán học, 10 năm kinh nghiệm giảng dạy, chuyên về Đại số và Hình học',
      phoneNumber: '+84901234569',
      completionRate: 88,
      preferences: {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        profileVisibility: ProfileVisibility.PUBLIC,
        notifications: {
          email: true,
          push: false,
          sms: false
        }
      }
    },
    stats: {
      totalExamResults: 0,              // Teacher không làm exam
      totalCourses: 15,                 // Tạo 15 courses
      totalLessons: 120,                // Tạo 120 lessons
      averageScore: 0                   // Teacher không có điểm
    }
  },
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'teacher-002',
    email: 'gv.ly@nynus.edu.vn',
    role: UserRole.TEACHER,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date('2024-03-15T00:00:00Z'),
    updatedAt: new Date('2025-01-14T14:30:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-teacher-002',
    password_hash: '$2b$12$AJPwxZyoKV3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // hashed "physics123"

    // ===== CORE BUSINESS LOGIC =====
    level: 9,                            // TEACHER Level 9 (cao nhất)
    maxConcurrentSessions: 3,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-14T14:30:00Z'),
    lastLoginIp: '192.168.1.103',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 1,
    totalResourceAccess: 720,
    riskScore: 6,

    // ===== PROFILE INFORMATION =====
    username: 'teacher_ly',
    firstName: 'Phạm',
    lastName: 'Thị Lý',
    avatar: '/avatars/teacher-002.jpg',
    bio: 'Giảng viên Vật lý',
    phone: '+84901234570',
    address: '321 Điện Biên Phủ, Q1, TP.HCM',
    school: 'Trường THPT Lê Quý Đôn',
    dateOfBirth: new Date('1982-03-25'),
    gender: 'female',

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'Physics specialist - Level 9 (Master Teacher)',
    maxConcurrentIPs: 2,
    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Tiến sĩ Vật lý, chuyên gia về cơ học lượng tử và vật lý hạt nhân',
      phoneNumber: '+84901234570',
      completionRate: 92,
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
      totalExamResults: 0,              // Teacher không làm exam
      totalCourses: 12,                 // Tạo 12 courses
      totalLessons: 95,                 // Tạo 95 lessons
      averageScore: 0                   // Teacher không có điểm
    }
  },

  // Tutor users (NEW role theo Enhanced User Model)
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'tutor-001',
    email: 'tutor.math@nynus.edu.vn',
    role: UserRole.TUTOR,                // NEW role
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date('2024-06-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T10:30:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-tutor-001',
    password_hash: '$2b$12$CKRwxZyoKV3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // hashed "tutor123"

    // ===== CORE BUSINESS LOGIC =====
    level: 5,                            // TUTOR Level 5 (1-9)
    maxConcurrentSessions: 3,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-15T10:30:00Z'),
    lastLoginIp: '192.168.1.104',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 1,
    totalResourceAccess: 420,
    riskScore: 15,

    // ===== PROFILE INFORMATION =====
    username: 'tutor_math',
    firstName: 'Nguyễn',
    lastName: 'Minh Tutor',
    avatar: '/avatars/tutor-001.jpg',
    bio: 'Gia sư Toán học',
    phone: '+84901234575',
    address: '555 Cách Mạng Tháng 8, Q10, TP.HCM',
    school: 'Đại học Sư Phạm TP.HCM',
    dateOfBirth: new Date('1995-07-15'),
    gender: 'male',

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'Math tutor - Level 5, good student feedback',
    maxConcurrentIPs: 1,

    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Sinh viên năm 4 Sư Phạm Toán, có kinh nghiệm gia sư 2 năm',
      phoneNumber: '+84901234575',
      completionRate: 78,
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
      totalExamResults: 25,             // Tutor cũng làm exam để test
      totalCourses: 3,                  // Hỗ trợ 3 courses
      totalLessons: 45,                 // Hỗ trợ 45 lessons
      averageScore: 8.2                 // Điểm trung bình của tutor
    }
  },

  // Student users
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'student-001',
    email: 'hv001@student.nynus.edu.vn',
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T09:15:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-student-001',
    password_hash: '$2b$12$BKQwxZyoKV3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // hashed "student123"

    // ===== CORE BUSINESS LOGIC =====
    level: 6,                            // STUDENT Level 6 (1-9)
    maxConcurrentSessions: 3,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-15T09:15:00Z'),
    lastLoginIp: '192.168.1.105',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 2,              // Đang học trên 2 devices
    totalResourceAccess: 380,
    riskScore: 18,

    // ===== PROFILE INFORMATION =====
    username: 'student_an',
    firstName: 'Nguyễn',
    lastName: 'Văn An',
    avatar: '/avatars/student-001.jpg',
    bio: 'Học viên lớp 12A1',
    phone: '+84901234571',
    address: '123 Nguyễn Thị Minh Khai, Q3, TP.HCM',
    school: 'Trường THPT Nguyễn Du',
    dateOfBirth: new Date('2006-05-10'),
    gender: 'male',

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'Top performer - Level 6 student',
    maxConcurrentIPs: 1,
    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Học sinh giỏi lớp 12A1, yêu thích Toán và Lý, mục tiêu vào Đại học Bách Khoa',
      phoneNumber: '+84901234571',
      completionRate: 85,
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
      totalExamResults: 45,             // Đã làm 45 bài exam
      totalCourses: 8,                  // Đăng ký 8 courses
      totalLessons: 120,                // Hoàn thành 120 lessons
      averageScore: 8.5                 // Điểm trung bình cao
    }
  },
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'student-002',
    email: 'hv002@student.nynus.edu.vn',
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2025-01-14T20:45:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: 'google-student-002',
    password_hash: '$2b$12$CLRwxZyoKV3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // hashed "student456"

    // ===== CORE BUSINESS LOGIC =====
    level: 3,                            // STUDENT Level 3 (thấp hơn student-001)
    maxConcurrentSessions: 3,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-14T20:45:00Z'),
    lastLoginIp: '192.168.1.106',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 1,
    totalResourceAccess: 180,
    riskScore: 25,

    // ===== PROFILE INFORMATION =====
    username: 'student_binh',
    firstName: 'Trần',
    lastName: 'Thị Bình',
    avatar: '/avatars/student-002.jpg',
    bio: 'Học viên lớp 11B2',
    phone: '+84901234572',
    address: '456 Lê Lợi, Q1, TP.HCM',
    school: 'Trường THPT Trần Phú',
    dateOfBirth: new Date('2007-08-20'),
    gender: 'female',

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'Good progress - Level 3 student, needs more practice',
    maxConcurrentIPs: 1,
    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Học sinh chăm chỉ lớp 11B2, cần cải thiện Toán, giỏi Văn và Anh',
      phoneNumber: '+84901234572',
      completionRate: 72,
      preferences: {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        profileVisibility: ProfileVisibility.FRIENDS,
        notifications: {
          email: true,
          push: false,
          sms: false
        }
      }
    },
    stats: {
      totalExamResults: 32,             // Đã làm 32 bài exam
      totalCourses: 6,                  // Đăng ký 6 courses
      totalLessons: 85,                 // Hoàn thành 85 lessons
      averageScore: 7.2                 // Điểm trung bình khá
    }
  },
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'student-003',
    email: 'hv003@student.nynus.edu.vn',
    role: UserRole.STUDENT,
    status: UserStatus.SUSPENDED,        // Thay vì isActive: false
    emailVerified: false,                // Chưa verify email
    createdAt: new Date('2024-09-01T00:00:00Z'),
    updatedAt: new Date('2024-12-20T15:30:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: null,                      // Không dùng Google OAuth
    password_hash: '$2b$12$DMSwxZyoKV3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // hashed "student789"

    // ===== CORE BUSINESS LOGIC =====
    level: 1,                            // STUDENT Level 1 (thấp nhất)
    maxConcurrentSessions: 3,

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2024-12-20T15:30:00Z'),
    lastLoginIp: '192.168.1.107',
    loginAttempts: 3,                    // Đã thử đăng nhập 3 lần
    lockedUntil: new Date('2025-01-16T00:00:00Z'), // Bị khóa đến ngày mai
    activeSessionsCount: 0,              // Không có session nào
    totalResourceAccess: 45,             // Ít truy cập
    riskScore: 85,                       // High risk score

    // ===== PROFILE INFORMATION =====
    username: 'student_cuong',
    firstName: 'Lê',
    lastName: 'Minh Cường',
    avatar: '/avatars/student-003.jpg',
    bio: 'Học viên lớp 10C3',
    phone: '+84901234573',
    address: '789 Hai Bà Trưng, Q1, TP.HCM',
    school: 'Trường THPT Lê Hồng Phong',
    dateOfBirth: new Date('2008-11-05'),
    gender: 'male',

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'SUSPENDED - High risk score, needs follow up, email not verified',
    maxConcurrentIPs: 1,
    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Học sinh lớp 10C3 cần hỗ trợ thêm, gặp khó khăn trong học tập',
      phoneNumber: '+84901234573',
      completionRate: 45,
      preferences: {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        profileVisibility: ProfileVisibility.PRIVATE,
        notifications: {
          email: false,
          push: false,
          sms: false
        }
      }
    },
    stats: {
      totalExamResults: 15,             // Chỉ làm 15 bài exam
      totalCourses: 3,                  // Đăng ký 3 courses
      totalLessons: 25,                 // Hoàn thành 25 lessons
      averageScore: 5.8                 // Điểm trung bình thấp
    }
  },

  // Guest users (NEW role theo Enhanced User Model)
  {
    // ===== CORE REQUIRED FIELDS =====
    id: 'guest-001',
    email: 'guest001@gmail.com',
    role: UserRole.GUEST,                // NEW role
    status: UserStatus.PENDING_VERIFICATION, // Chờ verify email
    emailVerified: false,
    createdAt: new Date('2025-01-14T18:00:00Z'),
    updatedAt: new Date('2025-01-14T18:00:00Z'),

    // ===== AUTHENTICATION FIELDS =====
    googleId: null,                      // Guest chưa dùng OAuth
    password_hash: '$2b$12$EMTwxZyoKV3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj', // hashed "guest123"

    // ===== CORE BUSINESS LOGIC =====
    level: null,                         // GUEST không có level
    maxConcurrentSessions: 1,            // Guest chỉ 1 session

    // ===== SECURITY TRACKING =====
    lastLoginAt: new Date('2025-01-14T18:00:00Z'),
    lastLoginIp: '192.168.1.108',
    loginAttempts: 0,
    lockedUntil: null,
    activeSessionsCount: 1,              // Đang có 1 session
    totalResourceAccess: 5,              // Rất ít truy cập
    riskScore: 30,                       // Medium risk cho guest

    // ===== PROFILE INFORMATION =====
    username: 'guest_user',
    firstName: 'Khách',
    lastName: 'Hàng',
    avatar: '/avatars/guest-001.jpg',
    bio: 'Khách hàng mới',
    phone: null,                         // Guest không cần phone
    address: null,                       // Guest không cần address
    school: null,                        // Guest không cần school
    dateOfBirth: null,                   // Guest không cần DOB
    gender: null,                        // Guest không cần gender

    // ===== ADMIN SPECIFIC =====
    adminNotes: 'New guest user - pending email verification',
    maxConcurrentIPs: 1,

    // ===== NESTED OBJECTS =====
    profile: {
      bio: 'Khách hàng mới đăng ký, đang khám phá hệ thống',
      phoneNumber: null,
      completionRate: 0,
      preferences: {
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        profileVisibility: ProfileVisibility.PRIVATE,
        notifications: {
          email: true,                   // Guest muốn nhận email
          push: false,
          sms: false
        }
      }
    },
    stats: {
      totalExamResults: 0,              // Guest chưa làm exam
      totalCourses: 0,                  // Guest chưa đăng ký course
      totalLessons: 0,                  // Guest chưa học lesson
      averageScore: 0                   // Guest chưa có điểm
    }
  }
];

// Helper functions for Enhanced User Management
export function getUserById(id: string): AdminUser | undefined {
  return mockUsers.find(user => user.id === id);
}

export function getUsersByRole(role: UserRole): AdminUser[] {
  return mockUsers.filter(user => user.role === role);
}

export function getUsersByStatus(status: UserStatus): AdminUser[] {
  return mockUsers.filter(user => user.status === status);
}

export function getActiveUsers(): AdminUser[] {
  return mockUsers.filter(user => user.status === UserStatus.ACTIVE);
}

export function getHighRiskUsers(): AdminUser[] {
  return mockUsers.filter(user => user.riskScore && user.riskScore > 70);
}

export function getLockedUsers(): AdminUser[] {
  return mockUsers.filter(user => user.lockedUntil && user.lockedUntil > new Date());
}

export function getUsersWithMultipleSessions(): AdminUser[] {
  return mockUsers.filter(user => user.activeSessionsCount > 1);
}

export function searchUsers(query: string): AdminUser[] {
  const searchTerm = query.toLowerCase();
  return mockUsers.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm) ||
    user.lastName?.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm) ||
    user.username?.toLowerCase().includes(searchTerm)
  );
}

// Enhanced Mock API responses với Enhanced User Model
export function getMockUsersResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    role?: UserRole;
    status?: UserStatus;
    emailVerified?: boolean;
    levelMin?: number;
    levelMax?: number;
    riskScoreMin?: number;
    riskScoreMax?: number;
    isLocked?: boolean;
    highRisk?: boolean;
    search?: string;
  }
): MockApiResponse<{ users: AdminUser[]; pagination: MockPagination }> {
  let filteredUsers = [...mockUsers];

  // Apply Enhanced User Model filters
  if (filters?.role) {
    filteredUsers = filteredUsers.filter(user => user.role === filters.role);
  }
  if (filters?.status) {
    filteredUsers = filteredUsers.filter(user => user.status === filters.status);
  }
  if (filters?.emailVerified !== undefined) {
    filteredUsers = filteredUsers.filter(user => user.emailVerified === filters.emailVerified);
  }
  if (filters?.levelMin !== undefined) {
    filteredUsers = filteredUsers.filter(user => user.level !== null && user.level !== undefined && user.level >= filters.levelMin!);
  }
  if (filters?.levelMax !== undefined) {
    filteredUsers = filteredUsers.filter(user => user.level !== null && user.level !== undefined && user.level <= filters.levelMax!);
  }
  if (filters?.riskScoreMin !== undefined) {
    filteredUsers = filteredUsers.filter(user => user.riskScore !== undefined && user.riskScore >= filters.riskScoreMin!);
  }
  if (filters?.riskScoreMax !== undefined) {
    filteredUsers = filteredUsers.filter(user => user.riskScore !== undefined && user.riskScore <= filters.riskScoreMax!);
  }
  if (filters?.isLocked !== undefined) {
    const isLocked = filters.isLocked;
    filteredUsers = filteredUsers.filter(user => {
      const userIsLocked = user.lockedUntil && user.lockedUntil > new Date();
      return isLocked ? userIsLocked : !userIsLocked;
    });
  }
  if (filters?.highRisk !== undefined) {
    const highRisk = filters.highRisk;
    filteredUsers = filteredUsers.filter(user => {
      const userIsHighRisk = user.riskScore && user.riskScore > 70;
      return highRisk ? userIsHighRisk : !userIsHighRisk;
    });
  }
  if (filters?.search) {
    filteredUsers = searchUsers(filters.search);
  }

  // Apply pagination
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  };
}

// Enhanced UserStats calculation function
export function getMockUserStats(): UserStats {
  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(user => user.status === UserStatus.ACTIVE).length;
  const inactiveUsers = mockUsers.filter(user => user.status === UserStatus.INACTIVE).length;
  const suspendedUsers = mockUsers.filter(user => user.status === UserStatus.SUSPENDED).length;
  const pendingVerificationUsers = mockUsers.filter(user => user.status === UserStatus.PENDING_VERIFICATION).length;

  // Role distribution
  const guestUsers = mockUsers.filter(user => user.role === UserRole.GUEST).length;
  const studentUsers = mockUsers.filter(user => user.role === UserRole.STUDENT).length;
  const tutorUsers = mockUsers.filter(user => user.role === UserRole.TUTOR).length;
  const teacherUsers = mockUsers.filter(user => user.role === UserRole.TEACHER).length;
  const adminUsers = mockUsers.filter(user => user.role === UserRole.ADMIN).length;

  // Security metrics
  const highRiskUsers = mockUsers.filter(user => user.riskScore && user.riskScore > 70).length;
  const lockedUsers = mockUsers.filter(user => user.lockedUntil && user.lockedUntil > new Date()).length;
  const multipleSessionUsers = mockUsers.filter(user => user.activeSessionsCount > 1).length;

  // Calculate new users (mock data)
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newUsersToday = mockUsers.filter(user => {
    const createdDate = new Date(user.createdAt);
    return createdDate.toDateString() === today.toDateString();
  }).length;

  const newUsersThisWeek = mockUsers.filter(user => {
    const createdDate = new Date(user.createdAt);
    return createdDate >= oneWeekAgo;
  }).length;

  const newUsersThisMonth = mockUsers.filter(user => {
    const createdDate = new Date(user.createdAt);
    return createdDate >= oneMonthAgo;
  }).length;

  // Calculate growth percentage (mock calculation)
  const growthPercentage = totalUsers > 0 ? Math.round((newUsersThisMonth / totalUsers) * 100) : 0;

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    pendingVerificationUsers,
    newUsersToday,
    newUsersThisWeek,
    newUsersThisMonth,
    growthPercentage,
    guestUsers,
    studentUsers,
    tutorUsers,
    teacherUsers,
    adminUsers,
    highRiskUsers,
    lockedUsers,
    multipleSessionUsers
  };
}
