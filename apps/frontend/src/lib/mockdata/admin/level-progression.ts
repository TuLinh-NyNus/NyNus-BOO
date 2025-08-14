/**
 * Level Progression Mock Data
 * Mock data cho level progression system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { UserRole } from '../shared/core-types';

/**
 * Interface cho progression settings
 */
export interface ProgressionSettings {
  id: string;
  autoAdvancementEnabled: boolean;
  notificationEnabled: boolean;
  criteria: {
    courseCompletionRate: number;
    examAverageScore: number;
    activeParticipationDays: number;
  };
  cooldownPeriod: number; // days
  maxAdvancementsPerMonth: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho progression statistics
 */
export interface ProgressionStatistics {
  totalUsers: number;
  totalProgressions: number;
  automaticProgressions: number;
  manualProgressions: number;
  averageProgressionTime: number; // days
  progressionsByRole: {
    [key in UserRole]: number;
  };
  recentProgressions: number; // last 30 days
  pendingReviews: number;
}

/**
 * Interface cho audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Interface cho progression history entry
 */
export interface ProgressionHistoryEntry {
  id: string;
  userId: string;
  previousRole: UserRole;
  previousLevel: number;
  newRole: UserRole;
  newLevel: number;
  progressionType: 'AUTOMATIC' | 'MANUAL_OVERRIDE' | 'ADMIN_PROMOTION';
  reason?: string;
  performedBy: string;
  timestamp: string;
  criteria?: {
    courseCompletionRate?: number;
    examAverageScore?: number;
    activeParticipationDays?: number;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  performedByUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Mock progression settings
 */
export const mockProgressionSettings: ProgressionSettings = {
  id: 'settings-001',
  autoAdvancementEnabled: true,
  notificationEnabled: true,
  criteria: {
    courseCompletionRate: 80,
    examAverageScore: 75,
    activeParticipationDays: 30,
  },
  cooldownPeriod: 7,
  maxAdvancementsPerMonth: 5,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-07-15T10:30:00Z',
};

/**
 * Mock progression statistics
 */
export const mockProgressionStatistics: ProgressionStatistics = {
  totalUsers: 2450,
  totalProgressions: 156,
  automaticProgressions: 134,
  manualProgressions: 22,
  averageProgressionTime: 45,
  progressionsByRole: {
    [UserRole.GUEST]: 5,
    [UserRole.STUDENT]: 89,
    [UserRole.TUTOR]: 25,
    [UserRole.TEACHER]: 45,
    [UserRole.ADMIN]: 12,
  },
  recentProgressions: 23,
  pendingReviews: 5,
};

/**
 * Mock audit logs
 */
export const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2024-07-15T14:30:00Z',
    userId: 'admin-001',
    action: 'USER_ROLE_UPDATE',
    resource: 'USER',
    resourceId: 'user-123',
    status: 'SUCCESS',
    details: {
      previousRole: 'STUDENT',
      newRole: 'INSTRUCTOR',
      reason: 'Automatic progression based on criteria',
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    user: {
      id: 'admin-001',
      email: 'admin@nynus.edu.vn',
      firstName: 'Admin',
      lastName: 'System',
    },
  },
  {
    id: 'audit-002',
    timestamp: '2024-07-15T13:45:00Z',
    userId: 'admin-001',
    action: 'PROGRESSION_SETTINGS_UPDATE',
    resource: 'SETTINGS',
    resourceId: 'settings-001',
    status: 'SUCCESS',
    details: {
      field: 'autoAdvancementEnabled',
      previousValue: false,
      newValue: true,
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    user: {
      id: 'admin-001',
      email: 'admin@nynus.edu.vn',
      firstName: 'Admin',
      lastName: 'System',
    },
  },
  {
    id: 'audit-003',
    timestamp: '2024-07-15T12:20:00Z',
    userId: 'instructor-001',
    action: 'QUESTION_CREATE',
    resource: 'QUESTION',
    resourceId: 'q-456',
    status: 'SUCCESS',
    details: {
      questionType: 'MULTIPLE_CHOICE',
      category: 'Toán học',
      difficulty: 'MEDIUM',
    },
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    user: {
      id: 'instructor-001',
      email: 'instructor@nynus.edu.vn',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
    },
  },
];

/**
 * Mock progression history
 */
export const mockProgressionHistory: ProgressionHistoryEntry[] = [
  {
    id: 'progression-001',
    userId: 'user-123',
    previousRole: UserRole.STUDENT,
    previousLevel: 1,
    newRole: UserRole.TEACHER,
    newLevel: 1,
    progressionType: 'AUTOMATIC',
    timestamp: '2024-07-15T14:30:00Z',
    performedBy: 'system',
    criteria: {
      courseCompletionRate: 85,
      examAverageScore: 78,
      activeParticipationDays: 35,
    },
    user: {
      id: 'user-123',
      email: 'student@nynus.edu.vn',
      firstName: 'Trần',
      lastName: 'Thị B',
    },
  },
  {
    id: 'progression-002',
    userId: 'user-456',
    previousRole: UserRole.STUDENT,
    previousLevel: 2,
    newRole: UserRole.STUDENT,
    newLevel: 3,
    progressionType: 'MANUAL_OVERRIDE',
    reason: 'Exceptional performance in advanced mathematics',
    timestamp: '2024-07-14T16:15:00Z',
    performedBy: 'admin-001',
    user: {
      id: 'user-456',
      email: 'advanced.student@nynus.edu.vn',
      firstName: 'Lê',
      lastName: 'Văn C',
    },
    performedByUser: {
      id: 'admin-001',
      email: 'admin@nynus.edu.vn',
      firstName: 'Admin',
      lastName: 'System',
    },
  },
];

/**
 * Function để lấy progression settings
 */
export function getProgressionSettings(): Promise<ProgressionSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProgressionSettings);
    }, 500);
  });
}

/**
 * Function để lấy progression statistics
 */
export function getProgressionStatistics(): Promise<ProgressionStatistics> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProgressionStatistics);
    }, 300);
  });
}

/**
 * Function để lấy audit logs
 */
export function getProgressionAuditLogs(page: number = 1, limit: number = 25): Promise<{
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = mockAuditLogs.slice(startIndex, endIndex);

      resolve({
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total: mockAuditLogs.length,
          totalPages: Math.ceil(mockAuditLogs.length / limit),
        },
      });
    }, 400);
  });
}

/**
 * Function để lấy progression history
 */
export function getProgressionHistory(userId?: string): Promise<ProgressionHistoryEntry[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (userId) {
        const userHistory = mockProgressionHistory.filter(entry => entry.userId === userId);
        resolve(userHistory);
      } else {
        resolve(mockProgressionHistory);
      }
    }, 350);
  });
}

/**
 * Function để update progression settings
 */
export function updateProgressionSettings(settings: Partial<ProgressionSettings>): Promise<ProgressionSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedSettings = {
        ...mockProgressionSettings,
        ...settings,
        updatedAt: new Date().toISOString(),
      };
      resolve(updatedSettings);
    }, 600);
  });
}
