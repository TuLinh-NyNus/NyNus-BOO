// Mock data for sessions - Admin management
import { AdminSession, MockPagination, MockApiResponse } from '../shared/core-types';

// Interface cho user login sessions (khác với exam sessions)
export interface UserLoginSession {
  id: string;
  userId: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };
  ipAddress: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
  };
  userAgent: string;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  location?: string;
}

// Interface cho session statistics
export interface UserSessionStats {
  totalActiveSessions: number;
  uniqueActiveUsers: number;
  uniqueActiveIPs: number;
  averageSessionDuration: number;
  recentViolations: number;
}

// Mock user login sessions data
export const mockUserLoginSessions: UserLoginSession[] = [
  {
    id: 'login-session-001',
    userId: 'student-001',
    user: {
      email: 'hv001@student.nynus.edu.vn',
      firstName: 'Nguyễn',
      lastName: 'Văn An'
    },
    ipAddress: '192.168.1.100',
    deviceInfo: {
      browser: 'Chrome',
      os: 'Windows',
      device: 'Desktop'
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
    location: 'Việt Nam'
  },
  {
    id: 'login-session-002',
    userId: 'student-002',
    user: {
      email: 'hv002@student.nynus.edu.vn',
      firstName: 'Trần',
      lastName: 'Thị Bình'
    },
    ipAddress: '192.168.1.101',
    deviceInfo: {
      browser: 'Firefox',
      os: 'macOS',
      device: 'Desktop'
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0)',
    isActive: true,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    location: 'TP.HCM, Việt Nam'
  },
  {
    id: 'login-session-003',
    userId: 'student-003',
    user: {
      email: 'hv003@student.nynus.edu.vn',
      firstName: 'Lê',
      lastName: 'Minh Cường'
    },
    ipAddress: '192.168.1.102',
    deviceInfo: {
      browser: 'Safari',
      os: 'iOS',
      device: 'Mobile'
    },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23.5 * 60 * 60 * 1000).toISOString(),
    location: 'Đà Nẵng, Việt Nam'
  },
  {
    id: 'login-session-004',
    userId: 'teacher-001',
    user: {
      email: 'gv001@teacher.nynus.edu.vn',
      firstName: 'Phạm',
      lastName: 'Thị Lan'
    },
    ipAddress: '192.168.1.103',
    deviceInfo: {
      browser: 'Chrome',
      os: 'Windows',
      device: 'Desktop'
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isActive: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    location: 'Việt Nam'
  },
  {
    id: 'login-session-005',
    userId: 'student-004',
    user: {
      email: 'hv004@student.nynus.edu.vn',
      firstName: 'Võ',
      lastName: 'Văn Nam'
    },
    ipAddress: '192.168.1.104',
    deviceInfo: {
      browser: 'Edge',
      os: 'Windows',
      device: 'Desktop'
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    isActive: false,
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    location: 'Cần Thơ, Việt Nam'
  }
];

// Mock session statistics
export const mockUserSessionStats: UserSessionStats = {
  totalActiveSessions: 156,
  uniqueActiveUsers: 134,
  uniqueActiveIPs: 142,
  averageSessionDuration: 45, // minutes
  recentViolations: 3
};

// Mock sessions data với realistic information
export const mockSessions: AdminSession[] = [
  {
    id: 'session-001',
    userId: 'student-001',
    userName: 'Nguyễn Văn An',
    userEmail: 'hv001@student.nynus.edu.vn',
    examId: 'exam-001',
    examTitle: 'Kiểm tra Toán 12 - Chương 1',
    startedAt: new Date('2025-01-15T08:30:00Z'),
    endedAt: new Date('2025-01-15T09:15:00Z'),
    duration: 2700, // 45 minutes in seconds
    score: 85,
    totalPoints: 100,
    status: 'completed',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    answers: [
      {
        questionId: 'q-001',
        selectedOption: 'opt-001-a',
        isCorrect: true,
        points: 10,
        timeSpent: 180
      },
      {
        questionId: 'q-002',
        textAnswer: 'x = 3',
        isCorrect: true,
        points: 15,
        timeSpent: 420
      },
      {
        questionId: 'q-006',
        selectedOption: 'true',
        isCorrect: true,
        points: 2,
        timeSpent: 45
      }
    ]
  },
  {
    id: 'session-002',
    userId: 'student-002',
    userName: 'Trần Thị Bình',
    userEmail: 'hv002@student.nynus.edu.vn',
    examId: 'exam-002',
    examTitle: 'Kiểm tra Vật lý 11 - Dao động',
    startedAt: new Date('2025-01-15T14:00:00Z'),
    endedAt: new Date('2025-01-15T14:30:00Z'),
    duration: 1800, // 30 minutes in seconds
    score: 72,
    totalPoints: 100,
    status: 'completed',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    answers: [
      {
        questionId: 'q-003',
        selectedOption: 'opt-003-a',
        isCorrect: true,
        points: 5,
        timeSpent: 120
      }
    ]
  },
  {
    id: 'session-003',
    userId: 'student-003',
    userName: 'Lê Minh Cường',
    userEmail: 'hv003@student.nynus.edu.vn',
    examId: 'exam-001',
    examTitle: 'Kiểm tra Toán 12 - Chương 1',
    startedAt: new Date('2025-01-15T10:00:00Z'),
    status: 'active',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    answers: [
      {
        questionId: 'q-001',
        selectedOption: 'opt-001-b',
        isCorrect: false,
        points: 0,
        timeSpent: 240
      }
    ]
  },
  {
    id: 'session-004',
    userId: 'student-004',
    userName: 'Lê Thị Dung',
    userEmail: 'hv004@student.nynus.edu.vn',
    examId: 'exam-003',
    examTitle: 'Kiểm tra Hóa 10 - Nguyên tử',
    startedAt: new Date('2025-01-14T16:30:00Z'),
    endedAt: new Date('2025-01-14T17:00:00Z'),
    duration: 1800, // 30 minutes
    score: 90,
    totalPoints: 100,
    status: 'completed',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    answers: [
      {
        questionId: 'q-004',
        selectedOption: 'opt-004-a',
        isCorrect: true,
        points: 3,
        timeSpent: 90
      }
    ]
  },
  {
    id: 'session-005',
    userId: 'student-005',
    userName: 'Trần Minh Hoàng',
    userEmail: 'hv005@student.nynus.edu.vn',
    examId: 'exam-004',
    examTitle: 'Kiểm tra Tiếng Anh 9 - Grammar',
    startedAt: new Date('2025-01-14T09:00:00Z'),
    endedAt: new Date('2025-01-14T09:20:00Z'),
    duration: 1200, // 20 minutes
    score: 88,
    totalPoints: 100,
    status: 'completed',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0',
    answers: [
      {
        questionId: 'q-005',
        selectedOption: 'opt-005-a',
        isCorrect: true,
        points: 4,
        timeSpent: 75
      }
    ]
  },
  {
    id: 'session-006',
    userId: 'student-006',
    userName: 'Phạm Thị Lan',
    userEmail: 'hv006@student.nynus.edu.vn',
    examId: 'exam-001',
    examTitle: 'Kiểm tra Toán 12 - Chương 1',
    startedAt: new Date('2025-01-13T20:00:00Z'),
    status: 'abandoned',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    answers: []
  },
  {
    id: 'session-007',
    userId: 'student-007',
    userName: 'Võ Văn Nam',
    userEmail: 'hv007@student.nynus.edu.vn',
    examId: 'exam-002',
    examTitle: 'Kiểm tra Vật lý 11 - Dao động',
    startedAt: new Date('2025-01-13T15:30:00Z'),
    endedAt: new Date('2025-01-13T16:00:00Z'),
    duration: 1800, // 30 minutes
    score: 76,
    totalPoints: 100,
    status: 'completed',
    ipAddress: '192.168.1.106',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    answers: [
      {
        questionId: 'q-003',
        selectedOption: 'opt-003-a',
        isCorrect: true,
        points: 5,
        timeSpent: 95
      }
    ]
  }
];

// Session statistics
export const mockSessionStats = {
  totalSessions: 8934,
  activeSessions: 23,
  completedSessions: 8456,
  abandonedSessions: 455,
  averageSessionDuration: 1680, // seconds (28 minutes)
  averageScore: 76.8,
  completionRate: 94.6, // percentage
  topExams: [
    { examId: 'exam-001', examTitle: 'Kiểm tra Toán 12 - Chương 1', sessions: 1245 },
    { examId: 'exam-002', examTitle: 'Kiểm tra Vật lý 11 - Dao động', sessions: 987 },
    { examId: 'exam-003', examTitle: 'Kiểm tra Hóa 10 - Nguyên tử', sessions: 756 },
    { examId: 'exam-004', examTitle: 'Kiểm tra Tiếng Anh 9 - Grammar', sessions: 654 },
    { examId: 'exam-005', examTitle: 'Kiểm tra Văn 12 - Thơ', sessions: 543 }
  ],
  sessionsByHour: [
    { hour: 0, sessions: 12 },
    { hour: 1, sessions: 8 },
    { hour: 2, sessions: 5 },
    { hour: 3, sessions: 3 },
    { hour: 4, sessions: 2 },
    { hour: 5, sessions: 4 },
    { hour: 6, sessions: 15 },
    { hour: 7, sessions: 45 },
    { hour: 8, sessions: 123 },
    { hour: 9, sessions: 234 },
    { hour: 10, sessions: 298 },
    { hour: 11, sessions: 267 },
    { hour: 12, sessions: 189 },
    { hour: 13, sessions: 156 },
    { hour: 14, sessions: 234 },
    { hour: 15, sessions: 312 },
    { hour: 16, sessions: 278 },
    { hour: 17, sessions: 198 },
    { hour: 18, sessions: 167 },
    { hour: 19, sessions: 234 },
    { hour: 20, sessions: 298 },
    { hour: 21, sessions: 189 },
    { hour: 22, sessions: 123 },
    { hour: 23, sessions: 67 }
  ]
};

// Helper functions for session management
export function getSessionById(id: string): AdminSession | undefined {
  return mockSessions.find(session => session.id === id);
}

export function getAdminSessionsByUser(userId: string): AdminSession[] {
  return mockSessions.filter(session => session.userId === userId);
}

export function getSessionsByExam(examId: string): AdminSession[] {
  return mockSessions.filter(session => session.examId === examId);
}

export function getActiveAdminSessions(): AdminSession[] {
  return mockSessions.filter(session => session.status === 'active');
}

export function getCompletedSessions(): AdminSession[] {
  return mockSessions.filter(session => session.status === 'completed');
}

export function getAbandonedSessions(): AdminSession[] {
  return mockSessions.filter(session => session.status === 'abandoned');
}

export function getSessionsByDateRange(startDate: Date, endDate: Date): AdminSession[] {
  return mockSessions.filter(session => 
    session.startedAt >= startDate && session.startedAt <= endDate
  );
}

export function searchSessions(query: string): AdminSession[] {
  const searchTerm = query.toLowerCase();
  return mockSessions.filter(session => 
    session.userName.toLowerCase().includes(searchTerm) ||
    session.userEmail.toLowerCase().includes(searchTerm) ||
    session.examTitle?.toLowerCase().includes(searchTerm)
  );
}

// Mock API responses
export function getMockSessionsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: 'active' | 'completed' | 'abandoned';
    examId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }
): MockApiResponse<{ sessions: AdminSession[]; pagination: MockPagination }> {
  let filteredSessions = [...mockSessions];

  // Apply filters
  if (filters?.status) {
    filteredSessions = filteredSessions.filter(s => s.status === filters.status);
  }
  if (filters?.examId) {
    filteredSessions = filteredSessions.filter(s => s.examId === filters.examId);
  }
  if (filters?.userId) {
    filteredSessions = filteredSessions.filter(s => s.userId === filters.userId);
  }
  if (filters?.startDate && filters?.endDate) {
    filteredSessions = getSessionsByDateRange(filters.startDate, filters.endDate);
  }
  if (filters?.search) {
    filteredSessions = searchSessions(filters.search);
  }

  // Apply pagination
  const total = filteredSessions.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      sessions: paginatedSessions,
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

export function getMockSessionStatsResponse(): MockApiResponse<typeof mockSessionStats> {
  return {
    success: true,
    data: mockSessionStats,
    message: 'Session statistics retrieved successfully'
  };
}

// Helper functions for user login sessions
export function getUserLoginSessionById(id: string): UserLoginSession | undefined {
  return mockUserLoginSessions.find(session => session.id === id);
}

export function getActiveUserLoginSessions(): UserLoginSession[] {
  return mockUserLoginSessions.filter(session =>
    session.isActive && new Date(session.expiresAt) > new Date()
  );
}

export function getExpiredUserLoginSessions(): UserLoginSession[] {
  return mockUserLoginSessions.filter(session =>
    !session.isActive || new Date(session.expiresAt) <= new Date()
  );
}

export function searchUserLoginSessions(query: string): UserLoginSession[] {
  const searchTerm = query.toLowerCase();
  return mockUserLoginSessions.filter(session =>
    session.user?.email.toLowerCase().includes(searchTerm) ||
    session.user?.firstName.toLowerCase().includes(searchTerm) ||
    session.user?.lastName.toLowerCase().includes(searchTerm) ||
    session.ipAddress.includes(searchTerm)
  );
}

// Mock API responses for user login sessions
export function getMockUserLoginSessionsResponse(): MockApiResponse<UserLoginSession[]> {
  return {
    success: true,
    data: mockUserLoginSessions,
    message: 'User login sessions retrieved successfully'
  };
}

export function getMockUserSessionStatsResponse(): MockApiResponse<UserSessionStats> {
  return {
    success: true,
    data: mockUserSessionStats,
    message: 'User session statistics retrieved successfully'
  };
}
