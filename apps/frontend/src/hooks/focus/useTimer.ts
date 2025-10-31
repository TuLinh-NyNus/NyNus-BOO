/**
 * useTimer Hook
 * Custom hook wrapper cho focus-timer.store
 * Quản lý timer interval và lifecycle
 * 
 * @author NyNus Development Team
 * @created 2025-01-30
 */

import { useEffect, useRef, useCallback } from "react";
import { useFocusTimerStore } from "@/stores/focus-timer.store";
import type { TimerMode } from "@/types/focus-timer";

interface UseTimerOptions {
  // Callback khi timer kết thúc
  onTimeUp?: () => void;
  
  // Callback khi timer tick
  onTick?: (timeLeft: number) => void;
  
  // Auto-start khi mount
  autoStart?: boolean;
}

export function useTimer(options: UseTimerOptions = {}) {
  const { onTimeUp, onTick, autoStart = false } = options;
  
  // Store state & actions
  const {
    currentTime,
    mode,
    isRunning,
    isPaused,
    sessionId,
    currentTask,
    durations,
    settings,
    start,
    pause,
    resume,
    stop,
    reset,
    switchMode,
    tick,
    setTask,
    setDurations,
    updateSettings,
  } = useFocusTimerStore();
  
  // Interval ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Dọn dẹp interval
   */
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  /**
   * Bắt đầu interval countdown
   */
  const startInterval = useCallback(() => {
    clearTimerInterval();
    intervalRef.current = setInterval(() => {
      tick();
      if (onTick) {
        onTick(currentTime - 1);
      }
    }, 1000);
  }, [tick, onTick, currentTime, clearTimerInterval]);
  
  /**
   * Effect: Quản lý interval khi isRunning thay đổi
   */
  useEffect(() => {
    if (isRunning && !isPaused) {
      startInterval();
    } else {
      clearTimerInterval();
    }
    
    return () => clearTimerInterval();
  }, [isRunning, isPaused, startInterval, clearTimerInterval]);
  
  /**
   * Effect: Xử lý khi timer về 0
   */
  useEffect(() => {
    if (currentTime === 0 && sessionId) {
      clearTimerInterval();
      stop();
      
      // Play notification
      if (settings.enableSound) {
        playNotificationSound();
      }
      
      // Browser notification
      if (settings.enableNotifications) {
        showBrowserNotification();
      }
      
      // Callback
      if (onTimeUp) {
        onTimeUp();
      }
    }
  }, [currentTime, sessionId, settings, onTimeUp, stop, clearTimerInterval]);
  
  /**
   * Effect: Auto-start nếu có option
   */
  useEffect(() => {
    if (autoStart && !isRunning && !sessionId) {
      // Auto-start cần session ID từ bên ngoài
      // Nên không implement ở đây
    }
  }, [autoStart, isRunning, sessionId]);
  
  /**
   * Play notification sound
   */
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/sounds/timer-end.mp3");
      audio.volume = settings.soundVolume / 100;
      audio.play().catch(err => {
        console.warn("Could not play notification sound:", err);
      });
    } catch (error) {
      console.warn("Audio not supported:", error);
    }
  };
  
  /**
   * Show browser notification
   */
  const showBrowserNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("⏰ Timer Kết Thúc!", {
        body: `${getModeLabel(mode)} đã hoàn thành!`,
        icon: "/icons/timer-icon.png",
        tag: "focus-timer",
      });
    }
  };
  
  /**
   * Request notification permission
   */
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  };
  
  /**
   * Helper: Get mode label
   */
  const getModeLabel = (m: TimerMode): string => {
    switch (m) {
      case "focus": return "🎯 Focus";
      case "shortBreak": return "☕ Short Break";
      case "longBreak": return "🌴 Long Break";
    }
  };
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);
  
  return {
    // State
    currentTime,
    mode,
    isRunning,
    isPaused,
    sessionId,
    currentTask,
    durations,
    settings,
    
    // Actions
    start,
    pause,
    resume,
    stop,
    reset,
    switchMode,
    setTask,
    setDurations,
    updateSettings,
    
    // Utilities
    requestNotificationPermission,
    getModeLabel,
  };
}

