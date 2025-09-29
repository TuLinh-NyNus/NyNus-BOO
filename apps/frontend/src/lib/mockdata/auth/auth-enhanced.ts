// Enhanced authentication mockdata based on AUTH_COMPLETE_GUIDE.md
import {
  MockApiResponse,
  MockPagination,
  NotificationType,
  ResourceType,
  AccessAction,
  ProfileVisibility
} from '../core-types';

// Enhanced User Session với device fingerprinting
export interface EnhancedUserSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  sessionToken: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  location: string; // City, Country từ IP
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}

// OAuth Account data
export interface OAuthAccount {
  id: string;
  userId: string;
  provider: string; // google, facebook, github
  providerAccountId: string;
  type: string; // oauth, oidc
  scope?: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  tokenType?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Resource Access Tracking
export interface ResourceAccess {
  id: string;
  userId: string;
  userName: string;
  resourceType: ResourceType; // ✅ Use enum from core-types
  resourceId: string;
  resourceTitle: string;
  action: AccessAction; // ✅ Use enum from core-types
  ipAddress: string;
  userAgent?: string;
  sessionToken?: string;
  isValidAccess: boolean;
  riskScore: number; // 0-100
  duration?: number; // seconds
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// User Preferences
export interface UserPreferences {
  id: string;
  userId: string;
  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  // Learning preferences
  autoPlayVideos: boolean;
  defaultVideoQuality: '480p' | '720p' | '1080p';
  playbackSpeed: number;
  // Privacy settings
  profileVisibility: ProfileVisibility; // ✅ Use enum from core-types
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  // Localization
  timezone: string;
  language: string;
  dateFormat: string;
  updatedAt: Date;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string; // LOGIN, LOGOUT, UPDATE_PROFILE, etc.
  resource?: string; // USER, COURSE, ENROLLMENT
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  userName: string;
  type: NotificationType; // ✅ Use enum from core-types
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

// Mock Enhanced User Sessions
export const mockEnhancedSessions: EnhancedUserSession[] = [
  {
    id: 'session-enh-001',
    userId: 'student-001',
    userName: 'Nguyễn Văn An',
    userEmail: 'hv001@student.nynus.edu.vn',
    sessionToken: 'sess_1a2b3c4d5e6f7g8h9i0j',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    deviceFingerprint: 'fp_win10_chrome_1920x1080_vn',
    location: 'Việt Nam',
    isActive: true,
    lastActivity: new Date('2025-01-15T10:30:00Z'),
    expiresAt: new Date('2025-01-16T10:30:00Z'),
    createdAt: new Date('2025-01-15T08:30:00Z')
  },
  {
    id: 'session-enh-002',
    userId: 'student-001',
    userName: 'Nguyễn Văn An',
    userEmail: 'hv001@student.nynus.edu.vn',
    sessionToken: 'sess_2b3c4d5e6f7g8h9i0j1k',
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    deviceFingerprint: 'fp_ios17_safari_390x844_vn',
    location: 'TP.HCM, Việt Nam',
    isActive: true,
    lastActivity: new Date('2025-01-15T09:45:00Z'),
    expiresAt: new Date('2025-01-16T09:45:00Z'),
    createdAt: new Date('2025-01-15T07:45:00Z')
  },
  {
    id: 'session-enh-003',
    userId: 'instructor-001',
    userName: 'Lê Văn Toán',
    userEmail: 'gv.toan@nynus.edu.vn',
    sessionToken: 'sess_3c4d5e6f7g8h9i0j1k2l',
    ipAddress: '203.162.4.191',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    deviceFingerprint: 'fp_macos_chrome_2560x1440_vn',
    location: 'Đà Nẵng, Việt Nam',
    isActive: true,
    lastActivity: new Date('2025-01-15T11:15:00Z'),
    expiresAt: new Date('2025-01-16T11:15:00Z'),
    createdAt: new Date('2025-01-15T06:15:00Z')
  }
];

// Mock OAuth Accounts
export const mockOAuthAccounts: OAuthAccount[] = [
  {
    id: 'oauth-001',
    userId: 'student-001',
    provider: 'google',
    providerAccountId: '1234567890123456789',
    type: 'oauth',
    scope: 'openid email profile',
    accessToken: 'ya29.a0AfH6SMC...',
    refreshToken: '1//04...',
    idToken: 'eyJhbGciOiJSUzI1NiIs...',
    expiresAt: 1705392000, // Unix timestamp
    tokenType: 'Bearer',
    createdAt: new Date('2025-01-15T08:30:00Z'),
    updatedAt: new Date('2025-01-15T10:30:00Z')
  },
  {
    id: 'oauth-002',
    userId: 'instructor-001',
    provider: 'google',
    providerAccountId: '9876543210987654321',
    type: 'oauth',
    scope: 'openid email profile',
    accessToken: 'ya29.b0AfH6SMD...',
    refreshToken: '1//05...',
    idToken: 'eyJhbGciOiJSUzI1NiJt...',
    expiresAt: 1705395600,
    tokenType: 'Bearer',
    createdAt: new Date('2025-01-15T06:15:00Z'),
    updatedAt: new Date('2025-01-15T11:15:00Z')
  }
];

// Mock Resource Access Logs
export const mockResourceAccess: ResourceAccess[] = [
  {
    id: 'access-001',
    userId: 'student-001',
    userName: 'Nguyễn Văn An',
    resourceType: ResourceType.COURSE, // ✅ Use enum
    resourceId: 'course-001',
    resourceTitle: 'Toán học lớp 12 - Ôn thi THPT Quốc gia',
    action: AccessAction.VIEW, // ✅ Use enum
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    sessionToken: 'sess_1a2b3c4d5e6f7g8h9i0j',
    isValidAccess: true,
    riskScore: 10,
    duration: 1800, // 30 minutes
    metadata: { page: 'course-overview', referrer: 'dashboard' },
    createdAt: new Date('2025-01-15T08:45:00Z')
  },
  {
    id: 'access-002',
    userId: 'student-001',
    userName: 'Nguyễn Văn An',
    resourceType: ResourceType.VIDEO, // ✅ Fixed: Use enum
    resourceId: 'video-001',
    resourceTitle: 'Bài 1: Tính đơn điệu của hàm số',
    action: AccessAction.STREAM, // ✅ Fixed: Use enum
    ipAddress: '10.0.0.50', // Different IP - mobile
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    sessionToken: 'sess_2b3c4d5e6f7g8h9i0j1k',
    isValidAccess: true,
    riskScore: 25, // Higher due to IP change
    duration: 2700, // 45 minutes
    metadata: { quality: '720p', completed: true },
    createdAt: new Date('2025-01-15T09:00:00Z')
  },
  {
    id: 'access-003',
    userId: 'student-002',
    userName: 'Trần Thị Bình',
    resourceType: ResourceType.PDF, // ✅ Fixed: Use enum
    resourceId: 'pdf-001',
    resourceTitle: 'Bài tập Toán 12 nâng cao',
    action: AccessAction.DOWNLOAD, // ✅ Fixed: Use enum
    ipAddress: '203.162.4.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    sessionToken: 'sess_4d5e6f7g8h9i0j1k2l3m',
    isValidAccess: false, // Suspicious activity
    riskScore: 85, // High risk
    duration: 5, // Very quick download
    metadata: { fileSize: '45MB', downloadSpeed: 'very_fast' },
    createdAt: new Date('2025-01-15T10:15:00Z')
  }
];

// Mock User Preferences
export const mockUserPreferences: UserPreferences[] = [
  {
    id: 'pref-001',
    userId: 'student-001',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    autoPlayVideos: true,
    defaultVideoQuality: '720p',
    playbackSpeed: 1.25,
    profileVisibility: ProfileVisibility.PUBLIC, // ✅ Fixed: Use enum
    showOnlineStatus: true,
    allowDirectMessages: true,
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    dateFormat: 'DD/MM/YYYY',
    updatedAt: new Date('2025-01-10T00:00:00Z')
  },
  {
    id: 'pref-002',
    userId: 'instructor-001',
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    autoPlayVideos: false,
    defaultVideoQuality: '1080p',
    playbackSpeed: 1.0,
    profileVisibility: ProfileVisibility.PUBLIC, // ✅ Fixed: Use enum
    showOnlineStatus: false,
    allowDirectMessages: true,
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    dateFormat: 'DD/MM/YYYY',
    updatedAt: new Date('2025-01-08T00:00:00Z')
  }
];

// Mock Audit Logs
export const mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-001',
    userId: 'student-001',
    userName: 'Nguyễn Văn An',
    action: 'LOGIN',
    resource: 'USER',
    resourceId: 'student-001',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    sessionId: 'sess_1a2b3c4d5e6f7g8h9i0j',
    success: true,
    metadata: { loginMethod: 'google_oauth', deviceType: 'desktop' },
    createdAt: new Date('2025-01-15T08:30:00Z')
  },
  {
    id: 'audit-002',
    userId: 'student-002',
    userName: 'Trần Thị Bình',
    action: 'LOGIN_FAILED',
    resource: 'USER',
    resourceId: 'student-002',
    ipAddress: '203.162.4.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    success: false,
    errorMessage: 'Invalid password',
    metadata: { attemptCount: 3, loginMethod: 'email_password' },
    createdAt: new Date('2025-01-15T10:00:00Z')
  },
  {
    id: 'audit-003',
    userId: 'admin-001',
    userName: 'Nguyễn Quản Trị',
    action: 'USER_SUSPENDED',
    resource: 'USER',
    resourceId: 'student-003',
    oldValues: { status: 'ACTIVE' },
    newValues: { status: 'SUSPENDED' },
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    sessionId: 'sess_admin_001',
    success: true,
    metadata: { reason: 'Suspicious activity detected', riskScore: 95 },
    createdAt: new Date('2025-01-15T10:20:00Z')
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'student-001',
    userName: 'Nguyễn Văn An',
    type: NotificationType.SECURITY_ALERT, // ✅ Fixed: Use enum
    title: 'Đăng nhập từ thiết bị mới',
    message: 'Tài khoản của bạn đã được đăng nhập từ iPhone tại TP.HCM lúc 16:45 ngày 15/01/2025. Nếu không phải bạn, vui lòng thay đổi mật khẩu ngay.',
    data: { deviceType: 'iPhone', location: 'TP.HCM', ipAddress: '10.0.0.50' },
    isRead: false,
    createdAt: new Date('2025-01-15T09:45:00Z'),
    expiresAt: new Date('2025-01-22T09:45:00Z')
  },
  {
    id: 'notif-002',
    userId: 'student-001',
    userName: 'Nguyễn Văn An',
    type: NotificationType.COURSE_UPDATE, // ✅ Fixed: Use enum
    title: 'Bài học mới đã có sẵn',
    message: 'Bài học "Cực trị hàm số nâng cao" đã được thêm vào khóa học "Toán học lớp 12". Hãy xem ngay!',
    data: { courseId: 'course-001', lessonId: 'lesson-new-001' },
    isRead: true,
    readAt: new Date('2025-01-15T10:00:00Z'),
    createdAt: new Date('2025-01-15T09:30:00Z')
  },
  {
    id: 'notif-003',
    userId: 'student-002',
    userName: 'Trần Thị Bình',
    type: NotificationType.SYSTEM_MESSAGE, // ✅ Fixed: Use enum
    title: 'Bảo trì hệ thống',
    message: 'Hệ thống sẽ được bảo trì từ 2:00-4:00 sáng ngày 16/01/2025. Trong thời gian này, bạn có thể không truy cập được một số tính năng.',
    data: { maintenanceStart: '2025-01-16T02:00:00Z', maintenanceEnd: '2025-01-16T04:00:00Z' },
    isRead: false,
    createdAt: new Date('2025-01-15T08:00:00Z'),
    expiresAt: new Date('2025-01-16T05:00:00Z')
  }
];

// Helper functions
export function getSessionsByUser(userId: string): EnhancedUserSession[] {
  return mockEnhancedSessions.filter(session => session.userId === userId);
}

export function getActiveSessions(): EnhancedUserSession[] {
  return mockEnhancedSessions.filter(session => session.isActive);
}

export function getResourceAccessByUser(userId: string): ResourceAccess[] {
  return mockResourceAccess.filter(access => access.userId === userId);
}

export function getHighRiskAccess(): ResourceAccess[] {
  return mockResourceAccess.filter(access => access.riskScore >= 70);
}

export function getUnreadNotifications(userId: string): Notification[] {
  return mockNotifications.filter(notif => notif.userId === userId && !notif.isRead);
}

export function getAuditLogsByUser(userId: string): AuditLog[] {
  return mockAuditLogs.filter(log => log.userId === userId);
}

// Mock API responses
export function getMockEnhancedSessionsResponse(
  page: number = 1,
  limit: number = 10,
  filters?: { userId?: string; isActive?: boolean }
): MockApiResponse<{ sessions: EnhancedUserSession[]; pagination: MockPagination }> {
  let filteredSessions = [...mockEnhancedSessions];

  if (filters?.userId) {
    filteredSessions = filteredSessions.filter(s => s.userId === filters.userId);
  }
  if (filters?.isActive !== undefined) {
    filteredSessions = filteredSessions.filter(s => s.isActive === filters.isActive);
  }

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
