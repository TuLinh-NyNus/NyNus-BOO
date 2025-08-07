'use client';

import { useState, useEffect, useCallback } from 'react';

import { useToast } from '@/hooks/use-toast';

// Types
export interface UserSession {
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

export interface SessionStats {
  totalActiveSessions: number;
  uniqueActiveUsers: number;
  uniqueActiveIPs: number;
  averageSessionDuration: number;
  recentViolations: number;
}

export interface SessionFilters {
  search: string;
  status: 'all' | 'active' | 'expired';
  sortBy: 'createdAt' | 'lastActivity' | 'expiresAt';
  sortOrder: 'asc' | 'desc';
}

/**
 * Custom hook for admin session management
 * Provides comprehensive session management functionality
 */
export function useAdminSessions() {
  const { toast } = useToast();
  
  // State
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get authorization headers
   */
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  /**
   * Fetch session statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sessions/stats', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch session statistics');
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching session stats:', error);
      setError('Không thể tải thống kê sessions');
      
      // Mock data for development
      setStats({
        totalActiveSessions: 150,
        uniqueActiveUsers: 120,
        uniqueActiveIPs: 95,
        averageSessionDuration: 45,
        recentViolations: 3
      });
    }
  }, [getAuthHeaders]);

  /**
   * Fetch sessions for a specific user
   */
  const fetchUserSessions = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/user/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user sessions');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }, [getAuthHeaders]);

  /**
   * Fetch all sessions (mock implementation)
   */
  const fetchAllSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would be an actual API endpoint
      // For now, we'll simulate with mock data
      const mockSessions: UserSession[] = [
        {
          id: '1',
          userId: 'user1',
          user: {
            email: 'user1@example.com',
            firstName: 'Nguyễn',
            lastName: 'Văn A'
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
          location: 'Hà Nội, Việt Nam'
        },
        {
          id: '2',
          userId: 'user2',
          user: {
            email: 'user2@example.com',
            firstName: 'Trần',
            lastName: 'Thị B'
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
          id: '3',
          userId: 'user3',
          user: {
            email: 'user3@example.com',
            firstName: 'Lê',
            lastName: 'Văn C'
          },
          ipAddress: '192.168.1.102',
          deviceInfo: {
            browser: 'Safari',
            os: 'iOS',
            device: 'Mobile'
          },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          isActive: false,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          location: 'Đà Nẵng, Việt Nam'
        }
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Không thể tải danh sách sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Terminate a single session
   */
  const terminateSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }

      const result = await response.json();

      toast({
        title: 'Thành công',
        description: result.message || 'Session đã được terminate thành công',
      });

      // Update local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      
      return result;
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể terminate session',
        variant: 'destructive',
      });
      throw error;
    }
  }, [getAuthHeaders, toast]);

  /**
   * Terminate all sessions for a user
   */
  const terminateAllUserSessions = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/user/${userId}/terminate-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to terminate user sessions');
      }

      const result = await response.json();

      toast({
        title: 'Thành công',
        description: result.message || `Đã terminate ${result.terminatedCount} sessions`,
      });

      // Update local state
      setSessions(prev => prev.filter(session => session.userId !== userId));
      
      return result;
    } catch (error) {
      console.error('Error terminating user sessions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể terminate sessions của user',
        variant: 'destructive',
      });
      throw error;
    }
  }, [getAuthHeaders, toast]);

  /**
   * Bulk terminate multiple sessions
   */
  const bulkTerminateSessions = useCallback(async (sessionIds: string[]) => {
    try {
      const promises = sessionIds.map(sessionId =>
        fetch(`/api/admin/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        })
      );

      const responses = await Promise.all(promises);
      const failedCount = responses.filter(r => !r.ok).length;

      if (failedCount > 0) {
        throw new Error(`Failed to terminate ${failedCount} sessions`);
      }

      toast({
        title: 'Thành công',
        description: `Đã terminate ${sessionIds.length} sessions`,
      });

      // Update local state
      setSessions(prev => prev.filter(session => !sessionIds.includes(session.id)));
      
      return { terminatedCount: sessionIds.length };
    } catch (error) {
      console.error('Error bulk terminating sessions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể terminate các sessions đã chọn',
        variant: 'destructive',
      });
      throw error;
    }
  }, [getAuthHeaders, toast]);

  /**
   * Cleanup expired sessions
   */
  const cleanupExpiredSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sessions/cleanup', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to cleanup sessions');
      }

      const result = await response.json();

      toast({
        title: 'Thành công',
        description: result.message || `Đã cleanup ${result.cleanedCount} expired sessions`,
      });

      // Refresh sessions and stats
      await fetchAllSessions();
      await fetchStats();
      
      return result;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cleanup expired sessions',
        variant: 'destructive',
      });
      throw error;
    }
  }, [getAuthHeaders, toast, fetchAllSessions, fetchStats]);

  /**
   * Update user IP limit
   */
  const updateUserIPLimit = useCallback(async (userId: string, maxConcurrentIPs: number) => {
    try {
      const response = await fetch(`/api/admin/sessions/user/${userId}/ip-limit`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ maxConcurrentIPs }),
      });

      if (!response.ok) {
        throw new Error('Failed to update IP limit');
      }

      const result = await response.json();

      toast({
        title: 'Thành công',
        description: result.message || `Đã cập nhật giới hạn IP thành ${maxConcurrentIPs}`,
      });
      
      return result;
    } catch (error) {
      console.error('Error updating IP limit:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật giới hạn IP',
        variant: 'destructive',
      });
      throw error;
    }
  }, [getAuthHeaders, toast]);

  /**
   * Get session audit logs
   */
  const getSessionAudit = useCallback(async (userId: string, limit = 50, offset = 0) => {
    try {
      const response = await fetch(
        `/api/admin/sessions/audit/${userId}?limit=${limit}&offset=${offset}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch session audit');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching session audit:', error);
      throw error;
    }
  }, [getAuthHeaders]);

  /**
   * Filter sessions based on criteria
   */
  const filterSessions = useCallback((sessions: UserSession[], filters: SessionFilters) => {
    return sessions.filter(session => {
      const matchesSearch = filters.search === '' || 
        session.user?.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        session.ipAddress.includes(filters.search) ||
        session.user?.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
        session.user?.lastName.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === 'all' ||
        (filters.status === 'active' && session.isActive && new Date(session.expiresAt) > new Date()) ||
        (filters.status === 'expired' && (!session.isActive || new Date(session.expiresAt) <= new Date()));

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      const aValue = new Date(a[filters.sortBy]).getTime();
      const bValue = new Date(b[filters.sortBy]).getTime();
      return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchAllSessions();
    fetchStats();
  }, [fetchAllSessions, fetchStats]);

  return {
    // State
    sessions,
    stats,
    loading,
    error,
    
    // Actions
    fetchStats,
    fetchUserSessions,
    fetchAllSessions,
    terminateSession,
    terminateAllUserSessions,
    bulkTerminateSessions,
    cleanupExpiredSessions,
    updateUserIPLimit,
    getSessionAudit,
    filterSessions,
    
    // Utilities
    refresh: () => {
      fetchAllSessions();
      fetchStats();
    },
  };
}
