// Mock data for resource access logs - Admin monitoring
import { ResourceAccess, ResourceAccessStats, MockPagination, MockApiResponse } from './types';

// Mock resource access logs với realistic data
export const mockResourceAccessLogs: ResourceAccess[] = [
  {
    id: 'access-001',
    userId: 'user-001',
    userEmail: 'john.doe@example.com',
    userName: 'John Doe',
    resourceId: 'course-123',
    resourceType: 'COURSE',
    action: 'VIEW',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome/120.0',
    location: 'Hà Nội, Việt Nam',
    accessedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    riskScore: 10,
    success: true,
  },
  {
    id: 'access-002',
    userId: 'user-002',
    userEmail: 'jane.smith@example.com',
    userName: 'Jane Smith',
    resourceId: 'video-456',
    resourceType: 'VIDEO',
    action: 'STREAM',
    ipAddress: '10.0.0.50',
    userAgent: 'Safari/17.0',
    location: 'TP.HCM, Việt Nam',
    accessedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    riskScore: 85,
    success: true,
  },
  {
    id: 'access-003',
    userId: 'user-003',
    userEmail: 'suspicious@example.com',
    userName: 'Unknown User',
    resourceId: 'pdf-789',
    resourceType: 'PDF',
    action: 'DOWNLOAD',
    ipAddress: '203.0.113.10',
    userAgent: 'Firefox/121.0',
    location: 'Unknown Location',
    accessedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    riskScore: 95,
    success: false,
  },
  {
    id: 'access-004',
    userId: 'user-004',
    userEmail: 'student.nguyen@gmail.com',
    userName: 'Nguyễn Văn A',
    resourceId: 'lesson-101',
    resourceType: 'LESSON',
    action: 'VIEW',
    ipAddress: '192.168.1.200',
    userAgent: 'Chrome/120.0',
    location: 'Đà Nẵng, Việt Nam',
    accessedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    riskScore: 15,
    success: true,
  },
  {
    id: 'access-005',
    userId: 'user-005',
    userEmail: 'teacher.tran@nynus.edu.vn',
    userName: 'Trần Thị B',
    resourceId: 'exam-202',
    resourceType: 'EXAM',
    action: 'START_EXAM',
    ipAddress: '172.16.0.10',
    userAgent: 'Edge/120.0',
    location: 'Cần Thơ, Việt Nam',
    accessedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    riskScore: 5,
    success: true,
  },
  {
    id: 'access-006',
    userId: 'user-006',
    userEmail: 'hacker@malicious.com',
    userName: 'Suspicious User',
    resourceId: 'course-premium-999',
    resourceType: 'COURSE',
    action: 'DOWNLOAD',
    ipAddress: '198.51.100.42',
    userAgent: 'curl/7.68.0',
    location: 'Unknown Location',
    accessedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    riskScore: 98,
    success: false,
  },
  {
    id: 'access-007',
    userId: 'user-007',
    userEmail: 'admin.le@nynus.edu.vn',
    userName: 'Lê Văn C',
    resourceId: 'video-tutorial-001',
    resourceType: 'VIDEO',
    action: 'VIEW',
    ipAddress: '10.0.1.5',
    userAgent: 'Chrome/120.0',
    location: 'Hà Nội, Việt Nam',
    accessedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    riskScore: 8,
    success: true,
  },
  {
    id: 'access-008',
    userId: 'user-008',
    userEmail: 'student.pham@gmail.com',
    userName: 'Phạm Thị D',
    resourceId: 'pdf-handbook-2025',
    resourceType: 'PDF',
    action: 'DOWNLOAD',
    ipAddress: '192.168.2.100',
    userAgent: 'Firefox/121.0',
    location: 'Hải Phòng, Việt Nam',
    accessedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    riskScore: 12,
    success: true,
  },
  {
    id: 'access-009',
    userId: 'user-009',
    userEmail: 'guest.user@temp.com',
    userName: 'Guest User',
    resourceId: 'course-free-intro',
    resourceType: 'COURSE',
    action: 'VIEW',
    ipAddress: '203.0.113.100',
    userAgent: 'Safari/17.0',
    location: 'Nha Trang, Việt Nam',
    accessedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    riskScore: 25,
    success: true,
  },
  {
    id: 'access-010',
    userId: 'user-010',
    userEmail: 'premium.user@vip.com',
    userName: 'VIP User',
    resourceId: 'exam-advanced-301',
    resourceType: 'EXAM',
    action: 'START_EXAM',
    ipAddress: '172.16.1.50',
    userAgent: 'Chrome/120.0',
    location: 'Vũng Tàu, Việt Nam',
    accessedAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    riskScore: 3,
    success: true,
  }
];

// Resource access statistics
export const mockResourceAccessStats: ResourceAccessStats = {
  totalAccessToday: 1247,
  uniqueUsersToday: 89,
  mostAccessedResourceType: 'VIDEO',
  mostCommonAction: 'VIEW',
  averageRiskScore: 15,
  highRiskAttempts: 23,
  accessByResourceType: { 
    VIDEO: 456, 
    PDF: 234, 
    COURSE: 189, 
    LESSON: 156, 
    EXAM: 89 
  },
  accessByAction: { 
    VIEW: 567, 
    DOWNLOAD: 234, 
    STREAM: 189, 
    START_EXAM: 89 
  },
  topResources: [
    { resourceId: 'course-123', resourceType: 'COURSE', count: 89 },
    { resourceId: 'video-456', resourceType: 'VIDEO', count: 67 },
    { resourceId: 'pdf-789', resourceType: 'PDF', count: 45 },
    { resourceId: 'lesson-101', resourceType: 'LESSON', count: 34 },
    { resourceId: 'exam-202', resourceType: 'EXAM', count: 23 }
  ],
};

// Helper functions for resource access management
export function getResourceAccessById(id: string): ResourceAccess | undefined {
  return mockResourceAccessLogs.find(access => access.id === id);
}

export function getResourceAccessByUserId(userId: string): ResourceAccess[] {
  return mockResourceAccessLogs.filter(access => access.userId === userId);
}

export function getResourceAccessByType(resourceType: string): ResourceAccess[] {
  return mockResourceAccessLogs.filter(access => access.resourceType === resourceType);
}

export function getResourceAccessByAction(action: string): ResourceAccess[] {
  return mockResourceAccessLogs.filter(access => access.action === action);
}

export function getHighRiskAccess(threshold: number = 80): ResourceAccess[] {
  return mockResourceAccessLogs.filter(access => (access.riskScore || 0) >= threshold);
}

export function getFailedAccess(): ResourceAccess[] {
  return mockResourceAccessLogs.filter(access => !access.success);
}

export function searchResourceAccess(query: string): ResourceAccess[] {
  const searchTerm = query.toLowerCase();
  return mockResourceAccessLogs.filter(access => 
    access.userEmail.toLowerCase().includes(searchTerm) ||
    access.userName.toLowerCase().includes(searchTerm) ||
    access.resourceId.toLowerCase().includes(searchTerm) ||
    access.resourceType.toLowerCase().includes(searchTerm) ||
    access.action.toLowerCase().includes(searchTerm) ||
    access.ipAddress.includes(searchTerm)
  );
}

// Mock API responses
export function getMockResourceAccessResponse(
  page: number = 1,
  limit: number = 10,
  filters?: {
    resourceType?: string;
    action?: string;
    search?: string;
    riskThreshold?: number;
    successOnly?: boolean;
  }
): MockApiResponse<{ accessLogs: ResourceAccess[]; pagination: MockPagination }> {
  let filteredLogs = [...mockResourceAccessLogs];

  // Apply filters
  if (filters?.resourceType && filters.resourceType !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.resourceType === filters.resourceType);
  }
  if (filters?.action && filters.action !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.action === filters.action);
  }
  if (filters?.search) {
    filteredLogs = searchResourceAccess(filters.search);
  }
  if (filters?.riskThreshold !== undefined) {
    filteredLogs = filteredLogs.filter(log => (log.riskScore || 0) >= filters.riskThreshold!);
  }
  if (filters?.successOnly) {
    filteredLogs = filteredLogs.filter(log => log.success);
  }

  // Sort by access time (newest first)
  filteredLogs.sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime());

  // Apply pagination
  const total = filteredLogs.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      accessLogs: paginatedLogs,
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

export function getMockResourceAccessStatsResponse(): MockApiResponse<ResourceAccessStats> {
  return {
    success: true,
    data: mockResourceAccessStats,
    message: 'Resource access statistics retrieved successfully'
  };
}
