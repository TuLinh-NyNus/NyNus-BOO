/**
 * User Management Mock Data
 * Mock data cho user management system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { UserRole, type UserRole as UserRoleType } from '@/types/user/roles';

/**
 * Interface cho bulk role promotion data
 */
export interface BulkRolePromotionData {
  userIds: string[];
  targetRole: UserRoleType;
  reason: string;
  notifyUsers: boolean;
  scheduledAt?: string;
  performedBy: string;
}

/**
 * Interface cho bulk operation result
 */
export interface BulkOperationResult {
  id: string;
  operation: 'ROLE_PROMOTION' | 'BULK_SUSPEND' | 'BULK_ACTIVATE' | 'BULK_DELETE';
  totalUsers: number;
  successCount: number;
  failedCount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  errors: Array<{
    userId: string;
    error: string;
  }>;
  performedBy: string;
}

/**
 * Interface cho promotion workflow step
 */
export interface PromotionWorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  timestamp?: string;
  duration?: number;
  details?: Record<string, unknown>;
}

/**
 * Interface cho promotion request
 */
export interface PromotionRequest {
  id: string;
  userId: string;
  currentRole: UserRoleType;
  targetRole: UserRoleType;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'IN_PROGRESS';
  workflow: PromotionWorkflowStep[];
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Interface cho user activity
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, unknown>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

/**
 * Interface cho user session
 */
export interface UserSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device: string;
  browser: string;
  startTime: string;
  lastActivity: string;
  isActive: boolean;
  duration: number; // in minutes
}

/**
 * Interface cho security event
 */
export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'LOGIN_ATTEMPT' | 'PASSWORD_CHANGE' | 'SUSPICIOUS_ACTIVITY' | 'ACCOUNT_LOCKED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  ipAddress: string;
  details: Record<string, unknown>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

/**
 * Interface cho user filter options
 */
export interface UserFilterOptions {
  roles: UserRoleType[];
  statuses: string[];
  dateRange: {
    from: string;
    to: string;
  };
  riskLevels: string[];
  activityLevel: 'ALL' | 'ACTIVE' | 'INACTIVE';
  emailVerified?: boolean;
}

/**
 * Mock bulk operations
 */
export const mockBulkOperations: BulkOperationResult[] = [
  {
    id: 'bulk-001',
    operation: 'ROLE_PROMOTION',
    totalUsers: 25,
    successCount: 23,
    failedCount: 2,
    status: 'COMPLETED',
    startedAt: '2024-07-15T10:30:00Z',
    completedAt: '2024-07-15T10:35:00Z',
    errors: [
      {
        userId: 'user-123',
        error: 'User không đủ điều kiện để thăng cấp'
      },
      {
        userId: 'user-456',
        error: 'User đã có role cao hơn'
      }
    ],
    performedBy: 'admin-001',
  },
  {
    id: 'bulk-002',
    operation: 'BULK_SUSPEND',
    totalUsers: 10,
    successCount: 10,
    failedCount: 0,
    status: 'COMPLETED',
    startedAt: '2024-07-14T14:20:00Z',
    completedAt: '2024-07-14T14:22:00Z',
    errors: [],
    performedBy: 'admin-001',
  },
];

/**
 * Mock promotion requests
 */
export const mockPromotionRequests: PromotionRequest[] = [
  {
    id: 'promotion-001',
    userId: 'user-789',
    currentRole: UserRole.USER_ROLE_STUDENT,
    targetRole: UserRole.USER_ROLE_TEACHER,
    reason: 'Hoàn thành xuất sắc các khóa học và có kinh nghiệm giảng dạy',
    requestedBy: 'admin-001',
    requestedAt: '2024-07-15T09:00:00Z',
    status: 'IN_PROGRESS',
    workflow: [
      {
        id: 'step-1',
        title: 'Kiểm tra điều kiện',
        description: 'Xác minh user đạt đủ điều kiện thăng cấp',
        status: 'COMPLETED',
        timestamp: '2024-07-15T09:05:00Z',
        duration: 5,
      },
      {
        id: 'step-2',
        title: 'Cập nhật quyền',
        description: 'Cập nhật permissions và role trong hệ thống',
        status: 'IN_PROGRESS',
        timestamp: '2024-07-15T09:10:00Z',
      },
      {
        id: 'step-3',
        title: 'Thông báo user',
        description: 'Gửi email thông báo về việc thăng cấp',
        status: 'PENDING',
      },
    ],
    user: {
      id: 'user-789',
      email: 'teacher.candidate@nynus.edu.vn',
      firstName: 'Nguyễn',
      lastName: 'Văn D',
    },
  },
];

/**
 * Mock user activities
 */
export const mockUserActivities: UserActivity[] = [
  {
    id: 'activity-001',
    userId: 'user-123',
    action: 'LOGIN',
    resource: 'AUTH',
    timestamp: '2024-07-15T14:30:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      loginMethod: 'EMAIL_PASSWORD',
      success: true,
    },
    riskLevel: 'LOW',
  },
  {
    id: 'activity-002',
    userId: 'user-123',
    action: 'QUESTION_CREATE',
    resource: 'QUESTION',
    resourceId: 'q-456',
    timestamp: '2024-07-15T14:45:00Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    details: {
      questionType: 'MULTIPLE_CHOICE',
      category: 'Toán học',
      difficulty: 'MEDIUM',
    },
    riskLevel: 'LOW',
  },
];

/**
 * Mock user sessions
 */
export const mockUserSessions: UserSession[] = [
  {
    id: 'session-001',
    userId: 'user-123',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: 'Hà Nội, Việt Nam',
    device: 'Desktop',
    browser: 'Chrome 120.0',
    startTime: '2024-07-15T14:30:00Z',
    lastActivity: '2024-07-15T15:45:00Z',
    isActive: true,
    duration: 75,
  },
  {
    id: 'session-002',
    userId: 'user-123',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    location: 'TP.HCM, Việt Nam',
    device: 'Mobile',
    browser: 'Safari 17.0',
    startTime: '2024-07-14T10:20:00Z',
    lastActivity: '2024-07-14T12:30:00Z',
    isActive: false,
    duration: 130,
  },
];

/**
 * Mock security events
 */
export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'security-001',
    userId: 'user-456',
    eventType: 'LOGIN_ATTEMPT',
    severity: 'MEDIUM',
    timestamp: '2024-07-15T13:20:00Z',
    ipAddress: '192.168.1.200',
    details: {
      attempts: 3,
      success: false,
      reason: 'INVALID_PASSWORD',
    },
    resolved: false,
  },
  {
    id: 'security-002',
    userId: 'user-789',
    eventType: 'SUSPICIOUS_ACTIVITY',
    severity: 'HIGH',
    timestamp: '2024-07-15T11:15:00Z',
    ipAddress: '10.0.0.50',
    details: {
      activity: 'MULTIPLE_LOCATION_LOGIN',
      locations: ['Hà Nội', 'TP.HCM'],
      timeGap: '5 minutes',
    },
    resolved: true,
    resolvedBy: 'admin-001',
    resolvedAt: '2024-07-15T11:30:00Z',
  },
];

/**
 * Function để thực hiện bulk role promotion
 */
export function performBulkRolePromotion(data: BulkRolePromotionData): Promise<BulkOperationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result: BulkOperationResult = {
        id: `bulk-${Date.now()}`,
        operation: 'ROLE_PROMOTION',
        totalUsers: data.userIds.length,
        successCount: data.userIds.length - 1, // Simulate 1 failure
        failedCount: 1,
        status: 'COMPLETED',
        startedAt: new Date().toISOString(),
        completedAt: new Date(Date.now() + 5000).toISOString(),
        errors: [
          {
            userId: data.userIds[0],
            error: 'User không đủ điều kiện để thăng cấp'
          }
        ],
        performedBy: data.performedBy,
      };
      resolve(result);
    }, 1000);
  });
}

/**
 * Function để lấy promotion requests
 */
export function getPromotionRequests(status?: string): Promise<PromotionRequest[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = mockPromotionRequests;
      if (status) {
        filtered = mockPromotionRequests.filter(req => req.status === status);
      }
      resolve(filtered);
    }, 300);
  });
}

/**
 * Function để lấy user activities
 */
export function getUserActivities(userId: string, limit: number = 50): Promise<UserActivity[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activities = mockUserActivities
        .filter(activity => activity.userId === userId)
        .slice(0, limit);
      resolve(activities);
    }, 400);
  });
}

/**
 * Function để lấy user sessions
 */
export function getUserSessions(userId: string): Promise<UserSession[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sessions = mockUserSessions.filter(session => session.userId === userId);
      resolve(sessions);
    }, 350);
  });
}

/**
 * Function để lấy security events
 */
export function getSecurityEvents(userId?: string): Promise<SecurityEvent[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let events = mockSecurityEvents;
      if (userId) {
        events = mockSecurityEvents.filter(event => event.userId === userId);
      }
      resolve(events);
    }, 450);
  });
}

/**
 * Function để terminate user session
 */
export function terminateUserSession(sessionId: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const session = mockUserSessions.find(s => s.id === sessionId);
      if (session) {
        session.isActive = false;
        session.lastActivity = new Date().toISOString();
      }
      resolve();
    }, 500);
  });
}

/**
 * Function để resolve security event
 */
export function resolveSecurityEvent(eventId: string, resolvedBy: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const event = mockSecurityEvents.find(e => e.id === eventId);
      if (event) {
        event.resolved = true;
        event.resolvedBy = resolvedBy;
        event.resolvedAt = new Date().toISOString();
      }
      resolve();
    }, 400);
  });
}
