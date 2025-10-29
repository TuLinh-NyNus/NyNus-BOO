'use client';

/**
 * Offline Context
 * ==============
 * 
 * Cung cấp offline state, sync status, queue info cho toàn bộ app
 * Cho phép các component biết khi nào user offline/online
 * Cung cấp sync progress, queue size, manual controls
 * 
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3 Offline Support
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { NetworkStatus, networkMonitor, type NetworkConnectionInfo } from '@/lib/utils/network-monitor';
import { offlineSyncManager, type SyncProgress, type SyncStats } from '@/lib/services/offline-sync-manager';
import { getOfflineRequestQueue, type QueueStats } from '@/lib/services/offline-request-queue';
import { logger } from '@/lib/logger';

/**
 * Offline context value
 */
interface OfflineContextValue {
  // Network status
  isOnline: boolean;
  isOffline: boolean;
  isSlow: boolean;
  networkStatus: NetworkStatus;
  connectionInfo: Readonly<NetworkConnectionInfo>;

  // Queue status
  queueSize: number;
  queueStats: Readonly<QueueStats>;

  // Sync status
  isSyncing: boolean;
  isPaused: boolean;
  syncProgress: Readonly<SyncProgress>;
  syncStats: Readonly<SyncStats>;

  // Controls
  triggerSync: () => Promise<void>;
  pauseSync: () => void;
  resumeSync: () => void;
  clearQueue: () => Promise<void>;
}

/**
 * Create offline context
 */
const OfflineContext = createContext<OfflineContextValue | undefined>(undefined);

/**
 * Offline context provider props
 */
interface OfflineContextProviderProps {
  children: ReactNode;
}

/**
 * Offline Context Provider
 */
export function OfflineContextProvider({ children }: OfflineContextProviderProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(NetworkStatus.ONLINE);
  const [connectionInfo, setConnectionInfo] = useState<NetworkConnectionInfo>(
    networkMonitor.getConnectionInfo()
  );
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalRequests: 0,
    highPriority: 0,
    normalPriority: 0,
    lowPriority: 0,
    failedRequests: 0,
    pendingRequests: 0,
    storageSize: 0,
    oldestRequest: 0,
    newestRequest: 0
  });
  const [syncProgress, setSyncProgress] = useState<SyncProgress>(
    offlineSyncManager.getProgress()
  );
  const [syncStats, setSyncStats] = useState<SyncStats>(offlineSyncManager.getStats());

  // Initialize queue stats and sync data
  useEffect(() => {
    const updateQueueStats = async () => {
      const stats = await getOfflineRequestQueue().getStats();
      setQueueStats(stats);
    };

    updateQueueStats();
    const interval = setInterval(updateQueueStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen to network changes
  useEffect(() => {
    const unsubscribe = networkMonitor.addListener((info) => {
      setNetworkStatus(info.status);
      setConnectionInfo(info);

      logger.debug('[OfflineContext] Network status changed', {
        status: info.status,
        connectionType: info.type
      });
    });

    return () => unsubscribe();
  }, []);

  // Listen to sync events
  useEffect(() => {
    const unsubscribe = offlineSyncManager.addListener((event) => {
      setSyncProgress(offlineSyncManager.getProgress());
      setSyncStats(offlineSyncManager.getStats());

      logger.debug('[OfflineContext] Sync event', {
        type: event.type,
        progress: event.progress?.progress
      });
    });

    return () => unsubscribe();
  }, []);

  const value: OfflineContextValue = {
    // Network status
    isOnline: networkMonitor.isOnline(),
    isOffline: networkMonitor.isOffline(),
    isSlow: networkMonitor.isSlow(),
    networkStatus,
    connectionInfo,

    // Queue status
    queueSize: queueStats.totalRequests,
    queueStats,

    // Sync status
    isSyncing: offlineSyncManager.isSyncing(),
    isPaused: offlineSyncManager.isPaused(),
    syncProgress,
    syncStats,

    // Controls
    triggerSync: async () => {
      try {
        await offlineSyncManager.triggerSync();
      } catch (err) {
        logger.error('[OfflineContext] Manual sync failed', {
          error: err instanceof Error ? err.message : String(err)
        });
        throw err;
      }
    },

    pauseSync: () => {
      offlineSyncManager.pause();
    },

    resumeSync: () => {
      offlineSyncManager.resume();
    },

    clearQueue: async () => {
      try {
        await getOfflineRequestQueue().clear();
        setQueueStats({
          totalRequests: 0,
          highPriority: 0,
          normalPriority: 0,
          lowPriority: 0,
          failedRequests: 0,
          pendingRequests: 0,
          storageSize: 0,
          oldestRequest: 0,
          newestRequest: 0
        });
      } catch (err) {
        logger.error('[OfflineContext] Clear queue failed', {
          error: err instanceof Error ? err.message : String(err)
        });
        throw err;
      }
    }
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

/**
 * Use offline context hook
 */
export function useOfflineContext(): OfflineContextValue {
  const context = useContext(OfflineContext);

  if (context === undefined) {
    throw new Error('useOfflineContext must be used within OfflineContextProvider');
  }

  return context;
}

/**
 * Export types
 */
export type { OfflineContextValue };



