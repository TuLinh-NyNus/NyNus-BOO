/**
 * Question Auto-Save Component
 * Auto-save functionality với draft management
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge, Button } from "@/components/ui";
import { Save, Clock, CheckCircle, AlertCircle, Wifi, WifiOff } from "lucide-react";

/**
 * Question data interface
 */
interface QuestionData {
  content: string;
  type: "MC" | "TF" | "SA" | "ES" | "MA";
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "ARCHIVED";
  questionCodeId: string;
  answers: any[];
  explanation?: string;
  difficulty?: string;
  tags?: string[];
  source?: string;
}

/**
 * Props for QuestionAutoSave component
 */
interface QuestionAutoSaveProps {
  questionData: Partial<QuestionData>;
  onSave: () => Promise<void> | void;
  interval?: number; // Auto-save interval in milliseconds
  enabled?: boolean; // Enable/disable auto-save
}

/**
 * Auto-save status enum
 */
enum AutoSaveStatus {
  IDLE = "idle",
  SAVING = "saving",
  SAVED = "saved",
  ERROR = "error",
  OFFLINE = "offline",
}

/**
 * Question Auto-Save Component
 * Provides automatic saving functionality với visual feedback
 */
export function QuestionAutoSave({
  questionData,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
}: QuestionAutoSaveProps) {
  // State management
  const [status, setStatus] = useState<AutoSaveStatus>(AutoSaveStatus.IDLE);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [countdown, setCountdown] = useState(interval / 1000);

  // Refs
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>("");

  /**
   * Check if question data has changed
   */
  const hasDataChanged = (): boolean => {
    const currentData = JSON.stringify(questionData);
    const hasChanged = currentData !== lastDataRef.current;

    if (hasChanged) {
      lastDataRef.current = currentData;
    }

    return hasChanged;
  };

  /**
   * Perform auto-save
   */
  const performAutoSave = async () => {
    if (!enabled || !isOnline || status === AutoSaveStatus.SAVING) {
      return;
    }

    // Check if data has actually changed
    if (!hasDataChanged()) {
      return;
    }

    try {
      setStatus(AutoSaveStatus.SAVING);

      await onSave();

      setStatus(AutoSaveStatus.SAVED);
      setLastSaved(new Date());

      // Reset countdown
      setCountdown(interval / 1000);

      // Show success feedback briefly
      setTimeout(() => {
        if (status === AutoSaveStatus.SAVED) {
          setStatus(AutoSaveStatus.IDLE);
        }
      }, 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
      setStatus(AutoSaveStatus.ERROR);

      // Show error feedback briefly
      setTimeout(() => {
        setStatus(AutoSaveStatus.IDLE);
      }, 5000);
    }
  };

  /**
   * Manual save
   */
  const handleManualSave = async () => {
    await performAutoSave();
  };

  /**
   * Start auto-save timer
   */
  const startAutoSaveTimer = () => {
    if (autoSaveTimer.current) {
      clearInterval(autoSaveTimer.current);
    }

    autoSaveTimer.current = setInterval(() => {
      performAutoSave();
    }, interval);
  };

  /**
   * Start countdown timer
   */
  const startCountdownTimer = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
    }

    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return interval / 1000; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Stop all timers
   */
  const stopTimers = () => {
    if (autoSaveTimer.current) {
      clearInterval(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  };

  /**
   * Handle online/offline status
   */
  const handleOnlineStatus = () => {
    setIsOnline(navigator.onLine);

    if (navigator.onLine) {
      setStatus(AutoSaveStatus.IDLE);
      if (enabled) {
        startAutoSaveTimer();
        startCountdownTimer();
      }
    } else {
      setStatus(AutoSaveStatus.OFFLINE);
      stopTimers();
    }
  };

  /**
   * Get status display
   */
  const getStatusDisplay = () => {
    switch (status) {
      case AutoSaveStatus.SAVING:
        return {
          icon: <Save className="h-3 w-3 animate-spin" />,
          text: "Đang lưu...",
          color: "bg-blue-100 text-blue-800",
        };
      case AutoSaveStatus.SAVED:
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: "Đã lưu",
          color: "bg-green-100 text-green-800",
        };
      case AutoSaveStatus.ERROR:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: "Lỗi lưu",
          color: "bg-red-100 text-red-800",
        };
      case AutoSaveStatus.OFFLINE:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          text: "Offline",
          color: "bg-gray-100 text-gray-800",
        };
      default:
        return {
          icon: <Clock className="h-3 w-3" />,
          text: `Lưu sau ${countdown}s`,
          color: "bg-yellow-100 text-yellow-800",
        };
    }
  };

  // Initialize auto-save
  useEffect(() => {
    if (enabled && isOnline) {
      startAutoSaveTimer();
      startCountdownTimer();
    } else {
      stopTimers();
    }

    return () => stopTimers();
  }, [enabled, isOnline, interval]);

  // Handle online/offline events
  useEffect(() => {
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // Reset countdown when data changes
  useEffect(() => {
    if (enabled && hasDataChanged()) {
      setCountdown(interval / 1000);
    }
  }, [questionData, enabled, interval]);

  // Don't render if auto-save is disabled
  if (!enabled) {
    return null;
  }

  const statusDisplay = getStatusDisplay();

  return (
    <div className="question-auto-save fixed bottom-4 left-4 z-40">
      <div className="flex items-center gap-2">
        {/* Auto-save Status */}
        <Badge className={`${statusDisplay.color} gap-1`}>
          {statusDisplay.icon}
          {statusDisplay.text}
        </Badge>

        {/* Online/Offline Indicator */}
        <Badge variant="outline" className="gap-1">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-green-600" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-600" />
          )}
          {isOnline ? "Online" : "Offline"}
        </Badge>

        {/* Manual Save Button */}
        {status !== AutoSaveStatus.SAVING && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={!isOnline}
            className="h-6 px-2 text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Lưu ngay
          </Button>
        )}

        {/* Last Saved Time */}
        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            Lưu lần cuối: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Error Recovery */}
      {status === AutoSaveStatus.ERROR && (
        <div className="mt-2 text-xs text-red-600">
          <p>Không thể lưu tự động. Vui lòng lưu thủ công.</p>
        </div>
      )}

      {/* Offline Notice */}
      {status === AutoSaveStatus.OFFLINE && (
        <div className="mt-2 text-xs text-gray-600">
          <p>Chế độ offline. Dữ liệu sẽ được lưu khi có kết nối.</p>
        </div>
      )}
    </div>
  );
}
