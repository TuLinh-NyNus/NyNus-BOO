/**
 * Resource Protection Hook
 * React hook để quản lý resource protection và anti-piracy features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ResourceProtectionService, 
  ResourceAccessAttempt, 
  ResourceAccess, 
  UserRiskProfile, 
  SuspiciousActivity,
  BlockingRule
} from '@/services/grpc/resource-protection.service';
import { useAuth } from '@/contexts/auth-context-grpc';
import { useNotification } from '@/contexts/notification-context';

interface AccessLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}

interface SuspiciousActivitiesParams {
  page?: number;
  limit?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  endDate?: string;
}

export interface UseResourceProtectionReturn {
  // User risk profile
  userRiskProfile: UserRiskProfile | null;
  riskProfileLoading: boolean;
  loadUserRiskProfile: (userId?: string) => Promise<void>;

  // Resource access tracking
  trackAccess: (attempt: ResourceAccessAttempt) => Promise<{
    success: boolean;
    riskScore: number;
    isBlocked: boolean;
    blockReason?: string;
  }>;

  // Access logs
  accessLogs: ResourceAccess[];
  accessLogsLoading: boolean;
  loadAccessLogs: (params?: AccessLogsParams) => Promise<void>;

  // Suspicious activities (admin only)
  suspiciousActivities: SuspiciousActivity[];
  suspiciousLoading: boolean;
  loadSuspiciousActivities: (params?: SuspiciousActivitiesParams) => Promise<void>;

  // User blocking (admin only)
  blockUser: (userId: string, reason: string, durationHours: number) => Promise<boolean>;
  unblockUser: (userId: string) => Promise<boolean>;

  // Blocking rules (admin only)
  blockingRules: BlockingRule[];
  rulesLoading: boolean;
  loadBlockingRules: () => Promise<void>;
  updateBlockingRules: (rules: BlockingRule[]) => Promise<boolean>;

  // Utilities
  isHighRisk: (riskScore: number) => boolean;
  getRiskLevel: (riskScore: number) => 'low' | 'medium' | 'high' | 'critical';
  getRiskColor: (riskScore: number) => string;
}

export function useResourceProtection(): UseResourceProtectionReturn {
  // User risk profile state
  const [userRiskProfile, setUserRiskProfile] = useState<UserRiskProfile | null>(null);
  const [riskProfileLoading, setRiskProfileLoading] = useState(false);

  // Access logs state
  const [accessLogs, setAccessLogs] = useState<ResourceAccess[]>([]);
  const [accessLogsLoading, setAccessLogsLoading] = useState(false);

  // Suspicious activities state
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [suspiciousLoading, setSuspiciousLoading] = useState(false);

  // Blocking rules state
  const [blockingRules, setBlockingRules] = useState<BlockingRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);

  // Dependencies
  const { user, isAuthenticated } = useAuth();
  const { showWarning, showError } = useNotification();

  // Track recent access attempts to avoid spam
  const recentAttempts = useRef<Map<string, number>>(new Map());

  /**
   * Load user risk profile
   */
  const loadUserRiskProfile = useCallback(async (userId?: string) => {
    if (!isAuthenticated) return;

    setRiskProfileLoading(true);

    try {
      const profile = await ResourceProtectionService.getUserRiskProfile(userId);
      setUserRiskProfile(profile);

      // Show warning if user has high risk score
      if (profile && profile.currentRiskScore > 70) {
        showWarning(
          'Cảnh báo bảo mật',
          `Điểm rủi ro của bạn hiện tại là ${profile.currentRiskScore}/100. Vui lòng sử dụng hệ thống một cách bình thường.`
        );
      }
    } catch (error) {
      console.error('Failed to load user risk profile:', error);
      showError('Lỗi', 'Không thể tải thông tin rủi ro người dùng');
    } finally {
      setRiskProfileLoading(false);
    }
  }, [isAuthenticated, showWarning, showError]);

  /**
   * Track resource access
   */
  const trackAccess = useCallback(async (attempt: ResourceAccessAttempt) => {
    if (!isAuthenticated || !user) {
      return { success: false, riskScore: 0, isBlocked: false };
    }

    // Add user ID if not provided
    if (!attempt.userId) {
      attempt.userId = user.id;
    }

    // Add timestamp to prevent duplicate tracking
    const attemptKey = `${attempt.resourceType}-${attempt.resourceId}-${attempt.action}`;
    const now = Date.now();
    const lastAttempt = recentAttempts.current.get(attemptKey);

    // Prevent tracking the same access within 1 second
    if (lastAttempt && now - lastAttempt < 1000) {
      return { success: true, riskScore: 0, isBlocked: false };
    }

    recentAttempts.current.set(attemptKey, now);

    try {
      const result = await ResourceProtectionService.trackResourceAccess(attempt);

      // Show notification if user is blocked
      if (result.isBlocked) {
        showError(
          'Truy cập bị chặn',
          result.blockReason || 'Hoạt động của bạn đã bị đánh giá là có rủi ro cao'
        );
      }

      // Refresh user risk profile if risk score is high
      if (result.riskScore > 50) {
        loadUserRiskProfile();
      }

      return result;
    } catch (error) {
      console.error('Failed to track resource access:', error);
      return { success: false, riskScore: 0, isBlocked: false };
    }
  }, [isAuthenticated, user, showError, loadUserRiskProfile]);

  /**
   * Load access logs
   */
  const loadAccessLogs = useCallback(async (params: AccessLogsParams = {}) => {
    if (!isAuthenticated) return;

    setAccessLogsLoading(true);

    try {
      const response = await ResourceProtectionService.getResourceAccess(params);
      
      if (params.page && params.page > 1) {
        // Append for pagination
        setAccessLogs(prev => [...prev, ...response.accesses]);
      } else {
        // Replace for initial load
        setAccessLogs(response.accesses);
      }
    } catch (error) {
      console.error('Failed to load access logs:', error);
      showError('Lỗi', 'Không thể tải nhật ký truy cập');
    } finally {
      setAccessLogsLoading(false);
    }
  }, [isAuthenticated, showError]);

  /**
   * Load suspicious activities (admin only)
   */
  const loadSuspiciousActivities = useCallback(async (params: SuspiciousActivitiesParams = {}) => {
    if (!isAuthenticated) return;

    setSuspiciousLoading(true);

    try {
      const response = await ResourceProtectionService.getSuspiciousActivities(params);
      setSuspiciousActivities(response.activities);
    } catch (error) {
      console.error('Failed to load suspicious activities:', error);
      showError('Lỗi', 'Không thể tải hoạt động đáng nghi ngờ');
    } finally {
      setSuspiciousLoading(false);
    }
  }, [isAuthenticated, showError]);

  /**
   * Block user (admin only)
   */
  const blockUser = useCallback(async (userId: string, reason: string, durationHours: number): Promise<boolean> => {
    try {
      const success = await ResourceProtectionService.blockUser(userId, reason, durationHours);
      
      if (success) {
        // Refresh suspicious activities
        loadSuspiciousActivities();
      }
      
      return success;
    } catch (error) {
      console.error('Failed to block user:', error);
      return false;
    }
  }, [loadSuspiciousActivities]);

  /**
   * Unblock user (admin only)
   */
  const unblockUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const success = await ResourceProtectionService.unblockUser(userId);
      
      if (success) {
        // Refresh suspicious activities
        loadSuspiciousActivities();
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unblock user:', error);
      return false;
    }
  }, [loadSuspiciousActivities]);

  /**
   * Load blocking rules
   */
  const loadBlockingRules = useCallback(async () => {
    setRulesLoading(true);

    try {
      const rules = await ResourceProtectionService.getBlockingRules();
      setBlockingRules(rules);
    } catch (error) {
      console.error('Failed to load blocking rules:', error);
      showError('Lỗi', 'Không thể tải quy tắc chặn');
    } finally {
      setRulesLoading(false);
    }
  }, [showError]);

  /**
   * Update blocking rules
   */
  const updateBlockingRules = useCallback(async (rules: BlockingRule[]): Promise<boolean> => {
    try {
      const success = await ResourceProtectionService.updateBlockingRules(rules);
      
      if (success) {
        setBlockingRules(rules);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to update blocking rules:', error);
      return false;
    }
  }, []);

  /**
   * Utility functions
   */
  const isHighRisk = useCallback((riskScore: number): boolean => {
    return riskScore >= 70;
  }, []);

  const getRiskLevel = useCallback((riskScore: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (riskScore >= 90) return 'critical';
    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }, []);

  const getRiskColor = useCallback((riskScore: number): string => {
    const level = getRiskLevel(riskScore);
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }, [getRiskLevel]);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserRiskProfile();
      loadBlockingRules();
    }
  }, [isAuthenticated, user, loadUserRiskProfile, loadBlockingRules]);

  // Cleanup recent attempts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const cutoff = now - 60000; // 1 minute

      for (const [key, timestamp] of recentAttempts.current.entries()) {
        if (timestamp < cutoff) {
          recentAttempts.current.delete(key);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    // User risk profile
    userRiskProfile,
    riskProfileLoading,
    loadUserRiskProfile,

    // Resource access tracking
    trackAccess,

    // Access logs
    accessLogs,
    accessLogsLoading,
    loadAccessLogs,

    // Suspicious activities
    suspiciousActivities,
    suspiciousLoading,
    loadSuspiciousActivities,

    // User blocking
    blockUser,
    unblockUser,

    // Blocking rules
    blockingRules,
    rulesLoading,
    loadBlockingRules,
    updateBlockingRules,

    // Utilities
    isHighRisk,
    getRiskLevel,
    getRiskColor
  };
}
