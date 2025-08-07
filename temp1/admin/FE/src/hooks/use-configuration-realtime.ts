/**
 * useConfigurationRealtime Hook
 * Hook cho real-time configuration updates với WebSocket integration
 *
 * Features:
 * - Real-time configuration change notifications
 * - Configuration rollback event handling
 * - Cache invalidation on configuration changes
 * - UI update triggers
 *
 * @author NyNus Team
 * @version 1.0.0
 */

import { useEffect, useCallback, useState, useRef } from "react";
import { toast } from "sonner";

import { useWebSocket } from "../components/websocket/websocket-provider";
import {
  ConfigurationChangeEvent,
  ConfigurationRollbackEvent,
} from "../lib/websocket/websocket-types";

/**
 * Configuration realtime options
 */
interface UseConfigurationRealtimeOptions {
  enableNotifications?: boolean;
  enableSounds?: boolean;
  onConfigurationChange?: (event: ConfigurationChangeEvent) => void;
  onConfigurationRollback?: (event: ConfigurationRollbackEvent) => void;
  categories?: string[]; // Filter by specific categories
}

/**
 * Configuration realtime return type
 */
interface UseConfigurationRealtimeReturn {
  // Connection state
  isConnected: boolean;

  // Event statistics
  totalEvents: number;
  changeEvents: number;
  rollbackEvents: number;

  // Recent events
  recentChanges: ConfigurationChangeEvent[];
  recentRollbacks: ConfigurationRollbackEvent[];

  // Actions
  clearEventHistory: () => void;
  refreshConfiguration: (category?: string, configKey?: string) => Promise<void>;
}

/**
 * Configuration realtime hook
 */
export function useConfigurationRealtime(
  options: UseConfigurationRealtimeOptions = {}
): UseConfigurationRealtimeReturn {
  const {
    enableNotifications = true,
    enableSounds = false,
    onConfigurationChange,
    onConfigurationRollback,
    categories = [],
  } = options;

  const webSocket = useWebSocket();

  // State for tracking events
  const [totalEvents, setTotalEvents] = useState(0);
  const [changeEvents, setChangeEvents] = useState(0);
  const [rollbackEvents, setRollbackEvents] = useState(0);
  const [recentChanges, setRecentChanges] = useState<ConfigurationChangeEvent[]>([]);
  const [recentRollbacks, setRecentRollbacks] = useState<ConfigurationRollbackEvent[]>([]);

  // Refs for cleanup
  const eventListenersRef = useRef<(() => void)[]>([]);

  /**
   * Handle configuration change events
   */
  const handleConfigurationChange = useCallback(
    (event: ConfigurationChangeEvent) => {
      // Filter by categories if specified
      if (categories.length > 0 && !categories.includes(event.category)) {
        return;
      }

      // Update statistics
      setTotalEvents((prev) => prev + 1);
      setChangeEvents((prev) => prev + 1);

      // Add to recent changes (keep last 50)
      setRecentChanges((prev) => [event, ...prev.slice(0, 49)]);

      // Show notification if enabled
      if (enableNotifications) {
        const severity = event.severity;
        const toastOptions = {
          duration: severity === "CRITICAL" ? 10000 : severity === "HIGH" ? 7000 : 5000,
        };

        switch (severity) {
          case "CRITICAL":
            toast.error(event.message, {
              description: `${event.category}.${event.configKey} - Thay đổi quan trọng`,
              ...toastOptions,
            });
            break;
          case "HIGH":
            toast.warning(event.message, {
              description: `${event.category}.${event.configKey}`,
              ...toastOptions,
            });
            break;
          default:
            toast.info(event.message, {
              description: `${event.category}.${event.configKey}`,
              ...toastOptions,
            });
        }
      }

      // Play sound if enabled
      if (enableSounds) {
        playNotificationSound(event.severity);
      }

      // Call custom handler
      onConfigurationChange?.(event);
    },
    [categories, enableNotifications, enableSounds, onConfigurationChange]
  );

  /**
   * Handle configuration rollback events
   */
  const handleConfigurationRollback = useCallback(
    (event: ConfigurationRollbackEvent) => {
      // Filter by categories if specified
      if (categories.length > 0 && !categories.includes(event.category)) {
        return;
      }

      // Update statistics
      setTotalEvents((prev) => prev + 1);
      setRollbackEvents((prev) => prev + 1);

      // Add to recent rollbacks (keep last 20)
      setRecentRollbacks((prev) => [event, ...prev.slice(0, 19)]);

      // Show notification if enabled
      if (enableNotifications) {
        toast.success(event.message, {
          description: `${event.category}.${event.configKey} - Rollback thành công`,
          duration: 5000,
        });
      }

      // Play sound if enabled
      if (enableSounds) {
        playNotificationSound("MEDIUM");
      }

      // Call custom handler
      onConfigurationRollback?.(event);
    },
    [categories, enableNotifications, enableSounds, onConfigurationRollback]
  );

  /**
   * Clear event history
   */
  const clearEventHistory = useCallback(() => {
    setRecentChanges([]);
    setRecentRollbacks([]);
    setTotalEvents(0);
    setChangeEvents(0);
    setRollbackEvents(0);
  }, []);

  /**
   * Refresh configuration (trigger cache invalidation)
   */
  const refreshConfiguration = useCallback(async (category?: string, configKey?: string) => {
    try {
      if (category && configKey) {
        // Refresh specific configuration
        await fetch(`/api/configuration/reload/${category}/${configKey}`, {
          method: "POST",
        });
        toast.success(`Đã làm mới cấu hình ${category}.${configKey}`);
      } else {
        // Clear entire cache
        await fetch("/api/configuration/cache", {
          method: "DELETE",
        });
        toast.success("Đã làm mới toàn bộ cache cấu hình");
      }
    } catch (error) {
      toast.error("Lỗi khi làm mới cấu hình");
    }
  }, []);

  /**
   * Play notification sound
   */
  const playNotificationSound = useCallback((severity: string) => {
    if (typeof window === "undefined") return;

    try {
      const soundMap: Record<string, string> = {
        CRITICAL: "critical-alert.mp3",
        HIGH: "high-alert.mp3",
        MEDIUM: "medium-alert.mp3",
        LOW: "low-alert.mp3",
      };

      const soundFile = soundMap[severity] || "medium-alert.mp3";
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.3;
      audio.play().catch((error) => {
        console.warn("Failed to play notification sound:", error);
      });
    } catch (error) {
      console.warn("Failed to create audio element:", error);
    }
  }, []);

  /**
   * Setup WebSocket event listeners
   */
  useEffect(() => {
    if (!webSocket.isConnected || !webSocket.socket) {
      return;
    }

    const socket = webSocket.socket;

    // Configuration change event listener
    const configChangeListener = (event: ConfigurationChangeEvent) => {
      handleConfigurationChange(event);
    };

    // Configuration rollback event listener
    const configRollbackListener = (event: ConfigurationRollbackEvent) => {
      handleConfigurationRollback(event);
    };

    // Add event listeners
    socket.on("configuration_change", configChangeListener);
    socket.on("configuration_rollback", configRollbackListener);

    // Store cleanup functions
    eventListenersRef.current = [
      () => socket.off("configuration_change", configChangeListener),
      () => socket.off("configuration_rollback", configRollbackListener),
    ];

    // Cleanup function
    return () => {
      eventListenersRef.current.forEach((cleanup) => cleanup());
      eventListenersRef.current = [];
    };
  }, [
    webSocket.isConnected,
    webSocket.socket,
    handleConfigurationChange,
    handleConfigurationRollback,
  ]);

  return {
    // Connection state
    isConnected: webSocket.isConnected,

    // Event statistics
    totalEvents,
    changeEvents,
    rollbackEvents,

    // Recent events
    recentChanges,
    recentRollbacks,

    // Actions
    clearEventHistory,
    refreshConfiguration,
  };
}
