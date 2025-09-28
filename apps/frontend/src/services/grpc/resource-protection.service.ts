/**
 * Resource Protection gRPC Service
 * Service để kết nối với backend resource protection và anti-piracy system
 */

// import { GRPC_WEB_HOST, getAuthMetadata } from './client';
import { AuthHelpers } from '@/lib/utils/auth-helpers';

// Resource access interfaces matching backend structure
export interface ResourceAccessAttempt {
  userId: string;
  resourceType: string; // COURSE, LESSON, VIDEO, PDF, EXAM
  resourceId: string;
  action: string; // VIEW, DOWNLOAD, STREAM, ACCESS
  ipAddress?: string;
  userAgent?: string;
  sessionToken?: string;
  duration?: number; // milliseconds
  metadata?: Record<string, unknown>;
}

export interface ResourceAccess {
  id: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  ipAddress: string;
  userAgent?: string;
  sessionToken?: string;
  isValidAccess: boolean;
  riskScore: number;
  duration: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface RiskFactors {
  recentAccessCount: number;
  uniqueIPCount: number;
  downloadCount: number;
  failedAttemptCount: number;
  averageRiskScore: number;
  suspiciousPatterns: string[];
}

export interface BlockingRule {
  name: string;
  maxRiskScore?: number;
  maxAccessesPerHour?: number;
  maxDownloadsPerDay?: number;
  maxFailedAttempts?: number;
  blockDurationHours: number;
  sendNotification: boolean;
}

export interface UserRiskProfile {
  userId: string;
  currentRiskScore: number;
  riskFactors: RiskFactors;
  isBlocked: boolean;
  blockReason?: string;
  blockUntil?: string;
  recentAccesses: ResourceAccess[];
}

export interface ResourceAccessListResponse {
  accesses: ResourceAccess[];
  total: number;
  page: number;
  limit: number;
}

export interface SuspiciousActivity {
  userId: string;
  userEmail?: string;
  riskScore: number;
  suspiciousPatterns: string[];
  recentAccessCount: number;
  lastAccessAt: string;
  isBlocked: boolean;
}

/**
 * Resource Protection Service Class
 */
export class ResourceProtectionService {
  // TODO: Initialize gRPC client when protobuf files are generated
  // private static client = new GrpcWebClient();

  /**
   * Track resource access attempt
   */
  static async trackResourceAccess(attempt: ResourceAccessAttempt): Promise<{
    success: boolean;
    riskScore: number;
    isBlocked: boolean;
    blockReason?: string;
  }> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation - replace with actual gRPC call
      // const response = await this.client.resourceProtectionService.trackAccess(attempt, {
      //   authorization: `Bearer ${accessToken}`
      // });

      // Mock response based on risk calculation
      const mockRiskScore = this.calculateMockRiskScore(attempt);
      const isBlocked = mockRiskScore >= 90;

      return {
        success: true,
        riskScore: mockRiskScore,
        isBlocked,
        blockReason: isBlocked ? 'High risk score detected' : undefined
      };
    } catch (error) {
      console.error('Failed to track resource access:', error);
      return {
        success: false,
        riskScore: 0,
        isBlocked: false
      };
    }
  }

  /**
   * Get user's risk profile
   */
  static async getUserRiskProfile(userId?: string): Promise<UserRiskProfile | null> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      const mockProfile: UserRiskProfile = {
        userId: userId || 'current-user',
        currentRiskScore: 25,
        riskFactors: {
          recentAccessCount: 15,
          uniqueIPCount: 2,
          downloadCount: 5,
          failedAttemptCount: 1,
          averageRiskScore: 20,
          suspiciousPatterns: []
        },
        isBlocked: false,
        recentAccesses: [
          {
            id: '1',
            userId: userId || 'current-user',
            resourceType: 'VIDEO',
            resourceId: 'video-123',
            action: 'STREAM',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            sessionToken: 'session-token',
            isValidAccess: true,
            riskScore: 15,
            duration: 5000,
            metadata: {},
            createdAt: new Date().toISOString()
          }
        ]
      };

      return mockProfile;
    } catch (error) {
      console.error('Failed to get user risk profile:', error);
      return null;
    }
  }

  /**
   * Get resource access logs
   */
  static async getResourceAccess(params: {
    page?: number;
    limit?: number;
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    minRiskScore?: number;
    onlySuspicious?: boolean;
  } = {}): Promise<ResourceAccessListResponse> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      const { page = 1, limit = 20 } = params;

      // Mock implementation
      const mockAccesses: ResourceAccess[] = [
        {
          id: '1',
          userId: 'user-123',
          resourceType: 'VIDEO',
          resourceId: 'video-456',
          action: 'STREAM',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          sessionToken: 'session-token',
          isValidAccess: true,
          riskScore: 25,
          duration: 5000,
          metadata: {},
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: 'user-789',
          resourceType: 'PDF',
          resourceId: 'pdf-123',
          action: 'DOWNLOAD',
          ipAddress: '10.0.0.50',
          userAgent: 'curl/7.68.0',
          sessionToken: 'session-token-2',
          isValidAccess: false,
          riskScore: 85,
          duration: 100,
          metadata: { suspicious: true },
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      // Apply filters
      let filteredAccesses = mockAccesses;
      if (params.userId) {
        filteredAccesses = filteredAccesses.filter(a => a.userId === params.userId);
      }
      if (params.resourceType) {
        filteredAccesses = filteredAccesses.filter(a => a.resourceType === params.resourceType);
      }
      if (params.minRiskScore) {
        filteredAccesses = filteredAccesses.filter(a => a.riskScore >= params.minRiskScore!);
      }
      if (params.onlySuspicious) {
        filteredAccesses = filteredAccesses.filter(a => !a.isValidAccess || a.riskScore > 70);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedAccesses = filteredAccesses.slice(startIndex, startIndex + limit);

      return {
        accesses: paginatedAccesses,
        total: filteredAccesses.length,
        page,
        limit
      };
    } catch (error) {
      console.error('Failed to get resource access logs:', error);
      throw new Error('Không thể tải nhật ký truy cập tài nguyên');
    }
  }

  /**
   * Get suspicious activities
   */
  static async getSuspiciousActivities(params: {
    page?: number;
    limit?: number;
    minRiskScore?: number;
  } = {}): Promise<{ activities: SuspiciousActivity[]; total: number }> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      const mockActivities: SuspiciousActivity[] = [
        {
          userId: 'user-suspicious-1',
          userEmail: 'suspicious@example.com',
          riskScore: 85,
          suspiciousPatterns: ['Automated access detected', 'High download frequency'],
          recentAccessCount: 150,
          lastAccessAt: new Date().toISOString(),
          isBlocked: false
        },
        {
          userId: 'user-blocked-1',
          userEmail: 'blocked@example.com',
          riskScore: 95,
          suspiciousPatterns: ['Mass download', 'Multiple IP addresses'],
          recentAccessCount: 200,
          lastAccessAt: new Date(Date.now() - 1800000).toISOString(),
          isBlocked: true
        }
      ];

      // Apply filters
      let filteredActivities = mockActivities;
      if (params.minRiskScore) {
        filteredActivities = filteredActivities.filter(a => a.riskScore >= params.minRiskScore!);
      }

      return {
        activities: filteredActivities,
        total: filteredActivities.length
      };
    } catch (error) {
      console.error('Failed to get suspicious activities:', error);
      throw new Error('Không thể tải hoạt động đáng nghi ngờ');
    }
  }

  /**
   * Block user manually (admin only)
   */
  static async blockUser(userId: string, reason: string, durationHours: number): Promise<boolean> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      // const response = await this.client.resourceProtectionService.blockUser({
      //   userId,
      //   reason,
      //   durationHours
      // }, { authorization: `Bearer ${accessToken}` });

      console.log(`Blocked user ${userId} for ${durationHours} hours. Reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('Failed to block user:', error);
      return false;
    }
  }

  /**
   * Unblock user (admin only)
   */
  static async unblockUser(userId: string): Promise<boolean> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      // const response = await this.client.resourceProtectionService.unblockUser({
      //   userId
      // }, { authorization: `Bearer ${accessToken}` });

      console.log(`Unblocked user ${userId}`);
      return true;
    } catch (error) {
      console.error('Failed to unblock user:', error);
      return false;
    }
  }

  /**
   * Get blocking rules
   */
  static async getBlockingRules(): Promise<BlockingRule[]> {
    try {
      // Mock implementation - these would come from backend configuration
      return [
        {
          name: 'High Risk Score Block',
          maxRiskScore: 90,
          blockDurationHours: 2,
          sendNotification: true
        },
        {
          name: 'Rapid Fire Access',
          maxAccessesPerHour: 100,
          blockDurationHours: 1,
          sendNotification: true
        },
        {
          name: 'Mass Download',
          maxDownloadsPerDay: 50,
          blockDurationHours: 4,
          sendNotification: true
        },
        {
          name: 'Failed Attempt Spam',
          maxFailedAttempts: 10,
          blockDurationHours: 1,
          sendNotification: true
        }
      ];
    } catch (error) {
      console.error('Failed to get blocking rules:', error);
      return [];
    }
  }

  /**
   * Update blocking rules (admin only)
   */
  static async updateBlockingRules(rules: BlockingRule[]): Promise<boolean> {
    try {
      const accessToken = AuthHelpers.getAccessToken();
      if (!accessToken) {
        throw new Error('Không có quyền truy cập');
      }

      // Mock implementation
      console.log('Updated blocking rules:', rules);
      return true;
    } catch (error) {
      console.error('Failed to update blocking rules:', error);
      return false;
    }
  }

  /**
   * Calculate mock risk score for testing
   */
  private static calculateMockRiskScore(attempt: ResourceAccessAttempt): number {
    let riskScore = 0;

    // Base risk
    riskScore += 10;

    // Download actions are riskier
    if (attempt.action === 'DOWNLOAD') {
      riskScore += 20;
      if (attempt.resourceType === 'PDF') {
        riskScore += 10;
      }
    }

    // Fast access is suspicious
    if (attempt.duration && attempt.duration < 1000) {
      riskScore += 25;
    }

    // Suspicious user agents
    if (attempt.userAgent?.includes('curl') || attempt.userAgent?.includes('wget')) {
      riskScore += 30;
    }

    // Random factor for testing
    riskScore += Math.floor(Math.random() * 20);

    return Math.min(riskScore, 100);
  }
}
