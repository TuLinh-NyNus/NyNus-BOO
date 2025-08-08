/**
 * Security Mockdata
 * 
 * Mock data cho security monitoring và audit logs
 * Sử dụng để thay thế API calls trong quá trình migration
 */

// ===== INTERFACES =====

/**
 * Security Metrics Interface
 * Align với SecurityStatsResponse từ backend
 */
export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  highSeverityEvents: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topThreats: Array<{
    type: string;
    count: number;
    lastOccurrence: string;
  }>;
  riskScore: number;
  blockedIPs: number;
  suspiciousActivities: number;
}

/**
 * Security Event Interface
 * Align với SecurityEventResponse từ backend
 */
export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  ipAddress: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  resourceId?: string;
  resourceType?: string;
  isProcessed: boolean;
  createdAt: string;
}

/**
 * Audit Log Interface
 * Tương thích với AuditLog từ auth-enhanced.ts
 */
export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/**
 * Audit Stats Interface
 */
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
 * Mock Security Metrics
 * Dữ liệu mock cho security metrics dashboard
 */
export const mockSecurityMetrics: SecurityMetrics = {
  totalEvents: 1247,
  criticalEvents: 8,
  highSeverityEvents: 23,
  eventsToday: 156,
  eventsThisWeek: 892,
  eventsThisMonth: 3456,
  eventsByType: {
    "LOGIN_FAILED": 234,
    "SUSPICIOUS_ACCESS": 89,
    "RATE_LIMIT_EXCEEDED": 156,
    "MALICIOUS_REQUEST": 45,
    "SESSION_HIJACK": 12,
    "BRUTE_FORCE": 67,
    "UNAUTHORIZED_ACCESS": 134
  },
  eventsBySeverity: {
    "LOW": 567,
    "MEDIUM": 456,
    "HIGH": 189,
    "CRITICAL": 35
  },
  topThreats: [
    {
      type: "BRUTE_FORCE",
      count: 67,
      lastOccurrence: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      type: "SUSPICIOUS_ACCESS",
      count: 89,
      lastOccurrence: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      type: "RATE_LIMIT_EXCEEDED",
      count: 156,
      lastOccurrence: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    }
  ],
  riskScore: 7.2,
  blockedIPs: 45,
  suspiciousActivities: 23
};

/**
 * Mock Security Events
 * Dữ liệu mock cho security events list
 */
export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "sec-001",
    userId: "user-001",
    eventType: "LOGIN_FAILED",
    severity: "MEDIUM",
    description: "Đăng nhập thất bại - Sai mật khẩu",
    ipAddress: "203.0.113.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    location: "Hà Nội, Việt Nam",
    deviceInfo: { browser: "Chrome", os: "Windows" },
    metadata: { attempts: 3, lastAttempt: "2025-01-15T10:30:00Z" },
    isProcessed: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: "sec-002",
    userId: "user-002",
    eventType: "SUSPICIOUS_ACCESS",
    severity: "HIGH",
    description: "Truy cập từ IP đáng nghi",
    ipAddress: "185.220.101.42",
    userAgent: "curl/7.68.0",
    location: "Unknown",
    deviceInfo: { browser: "Unknown", os: "Linux" },
    metadata: { reason: "tor_exit_node", riskScore: 95 },
    resourceId: "video-001",
    resourceType: "VIDEO",
    isProcessed: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "sec-003",
    userId: "user-003",
    eventType: "RATE_LIMIT_EXCEEDED",
    severity: "LOW",
    description: "Vượt quá giới hạn requests",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
    location: "TP.HCM, Việt Nam",
    deviceInfo: { browser: "Safari", os: "iOS" },
    metadata: { requestCount: 150, timeWindow: "1 minute" },
    isProcessed: true,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

/**
 * Mock Audit Stats
 * Dữ liệu mock cho audit statistics
 */
export const mockAuditStats: AuditStats = {
  totalLogsToday: 2456,
  failedActionsToday: 89,
  mostCommonAction: "LOGIN",
  mostActiveUser: "john.doe@example.com",
  successRate: 96,
  actionsByType: {
    "LOGIN": 567,
    "LOGOUT": 234,
    "CREATE_USER": 89,
    "UPDATE_USER": 156,
    "DELETE_RESOURCE": 45,
    "ACCESS_RESOURCE": 1234
  },
  actionsByResource: {
    "USER": 345,
    "COURSE": 234,
    "VIDEO": 189,
    "EXAM": 67
  },
  recentFailures: [
    {
      action: "LOGIN",
      userEmail: "suspicious@example.com",
      errorMessage: "Invalid credentials",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      action: "ACCESS_RESOURCE",
      resource: "VIDEO",
      userEmail: "user@example.com",
      errorMessage: "Insufficient permissions",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ]
};

/**
 * Mock Enhanced Audit Logs
 * Dữ liệu mock cho audit logs với thông tin chi tiết
 */
export const mockEnhancedAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    userId: "user-001",
    userEmail: "john.doe@example.com",
    userName: "John Doe",
    action: "LOGIN",
    resource: "USER",
    resourceId: "user-001",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome/120.0",
    sessionId: "session123",
    success: true,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    metadata: { loginMethod: "email" }
  },
  {
    id: "audit-002",
    userId: "user-002",
    userEmail: "jane.smith@example.com",
    userName: "Jane Smith",
    action: "UPDATE_USER",
    resource: "USER",
    resourceId: "user-002",
    ipAddress: "10.0.0.50",
    userAgent: "Safari/17.0",
    success: true,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    oldValues: { firstName: "Jane" },
    newValues: { firstName: "Jane Updated" }
  },
  {
    id: "audit-003",
    userEmail: "suspicious@example.com",
    action: "LOGIN",
    resource: "USER",
    ipAddress: "203.0.113.10",
    userAgent: "Firefox/121.0",
    success: false,
    errorMessage: "Invalid credentials",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    metadata: { attempts: 5 }
  }
];

// ===== HELPER FUNCTIONS =====

/**
 * Get security metrics
 * Lấy security metrics data
 */
export function getSecurityMetrics(): SecurityMetrics {
  return mockSecurityMetrics;
}

/**
 * Get security events with pagination
 * Lấy security events với phân trang
 */
export function getSecurityEvents(options: {
  page?: number;
  limit?: number;
  severity?: string;
  eventType?: string;
} = {}): {
  data: SecurityEvent[];
  total: number;
  page: number;
  limit: number;
} {
  const { page = 1, limit = 10, severity, eventType } = options;
  
  let filteredEvents = [...mockSecurityEvents];
  
  // Filter by severity
  if (severity && severity !== "all") {
    filteredEvents = filteredEvents.filter(event => event.severity === severity);
  }
  
  // Filter by event type
  if (eventType && eventType !== "all") {
    filteredEvents = filteredEvents.filter(event => event.eventType === eventType);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: filteredEvents.slice(startIndex, endIndex),
    total: filteredEvents.length,
    page,
    limit
  };
}

/**
 * Get audit logs with filtering
 * Lấy audit logs với bộ lọc
 */
export function getAuditLogs(options: {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  resource?: string;
  success?: string;
} = {}): {
  auditLogs: AuditLog[];
  total: number;
  page: number;
  limit: number;
} {
  const { page = 1, limit = 50, search, action, resource, success } = options;
  
  let filteredLogs = [...mockEnhancedAuditLogs];
  
  // Filter by search term
  if (search) {
    const searchLower = search.toLowerCase();
    filteredLogs = filteredLogs.filter(log => 
      log.action.toLowerCase().includes(searchLower) ||
      log.userEmail?.toLowerCase().includes(searchLower) ||
      log.resource?.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by action
  if (action && action !== "all") {
    filteredLogs = filteredLogs.filter(log => log.action === action);
  }
  
  // Filter by resource
  if (resource && resource !== "all") {
    filteredLogs = filteredLogs.filter(log => log.resource === resource);
  }
  
  // Filter by success
  if (success && success !== "all") {
    const isSuccess = success === "success";
    filteredLogs = filteredLogs.filter(log => log.success === isSuccess);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    auditLogs: filteredLogs.slice(startIndex, endIndex),
    total: filteredLogs.length,
    page,
    limit
  };
}

/**
 * Get audit statistics
 * Lấy audit statistics
 */
export function getAuditStats(): AuditStats {
  return mockAuditStats;
}

/**
 * Security Mock Service
 * Service object để tổ chức các functions
 */
export const securityMockService = {
  getSecurityMetrics,
  getSecurityEvents,
  getAuditLogs,
  getAuditStats
};
