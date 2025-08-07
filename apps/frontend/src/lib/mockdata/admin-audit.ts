/**
 * Admin Audit Mockdata
 * Mock data cho audit trail và audit logs trong admin system
 */

// ===== INTERFACES =====

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
  createdAt: string;
}

export interface AuditStats {
  totalLogsToday: number;
  failedActionsToday: number;
  mostCommonAction: string;
  mostActiveUser: string;
  successRate: number;
  actionsByType: Record<string, number>;
  actionsByResource: Record<string, number>;
  recentFailures: Array<{
    action: string;
    resource?: string;
    userEmail?: string;
    errorMessage?: string;
    timestamp: string;
  }>;
}

// ===== MOCK DATA =====

/**
 * Mock Audit Logs
 * Dữ liệu audit logs mẫu với các hoạt động thực tế
 */
export const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    userId: "student-001",
    userEmail: "hv001@student.nynus.edu.vn",
    userName: "Nguyễn Văn An",
    action: "LOGIN",
    resource: "USER",
    resourceId: "student-001",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    sessionId: "sess_1a2b3c4d5e6f7g8h9i0j",
    success: true,
    metadata: { loginMethod: "email", deviceType: "desktop" },
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-002",
    userId: "teacher-001",
    userEmail: "gv001@teacher.nynus.edu.vn",
    userName: "Trần Thị Bình",
    action: "UPDATE_USER",
    resource: "USER",
    resourceId: "teacher-001",
    ipAddress: "10.0.0.50",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    success: true,
    oldValues: { firstName: "Bình" },
    newValues: { firstName: "Bình Updated" },
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-003",
    userEmail: "suspicious@example.com",
    action: "LOGIN",
    resource: "USER",
    ipAddress: "203.0.113.10",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    success: false,
    errorMessage: "Invalid credentials",
    metadata: { attempts: 5, blocked: true },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-004",
    userId: "admin-001",
    userEmail: "admin@nynus.edu.vn",
    userName: "Quản trị viên",
    action: "CREATE_QUESTION",
    resource: "QUESTION",
    resourceId: "question-new-001",
    ipAddress: "192.168.1.200",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    success: true,
    newValues: {
      title: "Câu hỏi Toán 12 mới",
      subject: "Toán",
      grade: 12,
      difficulty: "medium"
    },
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-005",
    userId: "student-002",
    userEmail: "hv002@student.nynus.edu.vn",
    userName: "Lê Văn Cường",
    action: "ACCESS_RESOURCE",
    resource: "VIDEO",
    resourceId: "video-001",
    ipAddress: "192.168.1.150",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    success: true,
    metadata: { duration: 1800, quality: "720p" },
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-006",
    userEmail: "hacker@malicious.com",
    action: "ACCESS_RESOURCE",
    resource: "ADMIN_PANEL",
    ipAddress: "198.51.100.10",
    userAgent: "curl/7.68.0",
    success: false,
    errorMessage: "Unauthorized access attempt",
    metadata: { blocked: true, riskScore: 95 },
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-007",
    userId: "teacher-002",
    userEmail: "gv002@teacher.nynus.edu.vn",
    userName: "Phạm Minh Đức",
    action: "DELETE_QUESTION",
    resource: "QUESTION",
    resourceId: "question-old-001",
    ipAddress: "192.168.1.180",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    success: true,
    oldValues: {
      title: "Câu hỏi cũ cần xóa",
      status: "draft"
    },
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
  {
    id: "audit-008",
    userId: "student-003",
    userEmail: "hv003@student.nynus.edu.vn",
    userName: "Hoàng Thị Mai",
    action: "LOGOUT",
    resource: "USER",
    resourceId: "student-003",
    ipAddress: "192.168.1.120",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    success: true,
    metadata: { sessionDuration: 3600 },
    createdAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
  }
];

/**
 * Mock Audit Statistics
 * Thống kê audit logs mẫu
 */
export const mockAuditStats: AuditStats = {
  totalLogsToday: 2456,
  failedActionsToday: 89,
  mostCommonAction: "LOGIN",
  mostActiveUser: "hv001@student.nynus.edu.vn",
  successRate: 96.4,
  actionsByType: {
    LOGIN: 567,
    LOGOUT: 234,
    CREATE_QUESTION: 89,
    UPDATE_USER: 156,
    DELETE_QUESTION: 45,
    ACCESS_RESOURCE: 1234,
    CREATE_USER: 67,
    UPDATE_QUESTION: 98,
    SECURITY_EVENT: 23
  },
  actionsByResource: {
    USER: 345,
    QUESTION: 234,
    VIDEO: 189,
    COURSE: 156,
    EXAM: 67,
    ADMIN_PANEL: 12
  },
  recentFailures: [
    {
      action: "LOGIN",
      userEmail: "suspicious@example.com",
      errorMessage: "Invalid credentials",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      action: "ACCESS_RESOURCE",
      resource: "ADMIN_PANEL",
      userEmail: "hacker@malicious.com",
      errorMessage: "Unauthorized access attempt",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      action: "UPDATE_USER",
      resource: "USER",
      userEmail: "hv004@student.nynus.edu.vn",
      errorMessage: "Insufficient permissions",
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    }
  ],
};

// ===== HELPER FUNCTIONS =====

/**
 * Get audit logs với filtering
 */
export function getAuditLogs(filters?: {
  search?: string;
  action?: string;
  resource?: string;
  success?: boolean;
  limit?: number;
}): AuditLog[] {
  let filteredLogs = [...mockAuditLogs];

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredLogs = filteredLogs.filter(log =>
      log.action.toLowerCase().includes(searchTerm) ||
      log.userEmail?.toLowerCase().includes(searchTerm) ||
      log.userName?.toLowerCase().includes(searchTerm) ||
      log.resource?.toLowerCase().includes(searchTerm)
    );
  }

  if (filters?.action && filters.action !== "all") {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action);
  }

  if (filters?.resource && filters.resource !== "all") {
    filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
  }

  if (filters?.success !== undefined) {
    filteredLogs = filteredLogs.filter(log => log.success === filters.success);
  }

  if (filters?.limit) {
    filteredLogs = filteredLogs.slice(0, filters.limit);
  }

  return filteredLogs;
}

/**
 * Get audit statistics
 */
export function getAuditStats(): AuditStats {
  return mockAuditStats;
}

/**
 * Mock service cho audit API calls
 */
export const adminAuditMockService = {
  getAuditLogs: (params?: any) => {
    return Promise.resolve({
      auditLogs: getAuditLogs(params),
      total: mockAuditLogs.length,
      page: params?.page || 1,
      limit: params?.limit || 50
    });
  },

  getAuditStats: () => {
    return Promise.resolve(getAuditStats());
  }
};
