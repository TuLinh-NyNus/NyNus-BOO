/**
 * Pomodoro Timer Component
 * Component timer chính cho Focus Room
 * Sử dụng Zustand store và useTimer hook
 * 
 * Features:
 * - Timer display (MM:SS format)
 * - Mode tabs (Focus, Short Break, Long Break)
 * - Start/Pause/Reset buttons
 * - Progress circle animation
 * - Task input
 * - Browser & sound notifications
 * 
 * @author NyNus Development Team
 * @created 2025-01-30
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimer } from "@/hooks/focus/useTimer";
import { formatTimer } from "@/lib/focus/time.utils";
import type { TimerMode } from "@/types/focus-timer";
import { cn } from "@/lib/utils";

export interface PomodoroTimerProps {
  // Room ID để tạo session
  roomId?: string;
  
  // Callback khi timer kết thúc
  onTimerComplete?: (sessionId: string, duration: number) => void;
  
  // Callback khi bắt đầu session
  onSessionStart?: (sessionId: string) => Promise<void>;
  
  // Disabled state
  disabled?: boolean;
  
  // Show task input
  showTaskInput?: boolean;
  
  // Custom class
  className?: string;
}

export function PomodoroTimer({
  roomId,
  onTimerComplete,
  onSessionStart,
  disabled = false,
  showTaskInput = true,
  className,
}: PomodoroTimerProps) {
  
  const [isStarting, setIsStarting] = useState(false);
  
  // Timer hook
  const {
    currentTime,
    mode,
    isRunning,
    isPaused,
    sessionId,
    currentTask,
    durations,
    start,
    pause,
    resume,
    reset,
    switchMode,
    setTask,
    getModeLabel,
    requestNotificationPermission,
  } = useTimer({
    onTimeUp: () => {
      if (sessionId) {
        const duration = durations[mode];
        onTimerComplete?.(sessionId, duration);
      }
    },
  });
  
  /**
   * Handle mode change
   */
  const handleModeChange = (newMode: TimerMode) => {
    if (isRunning) return; // Không cho đổi mode khi đang chạy
    switchMode(newMode);
  };
  
  /**
   * Handle Start/Pause
   */
  const handleStartPause = async () => {
    if (isRunning) {
      // Pause
      pause();
    } else if (isPaused) {
      // Resume
      resume();
    } else {
      // Start new session
      try {
        setIsStarting(true);
        
        // Request notification permission
        await requestNotificationPermission();
        
        // Generate temporary session ID (will be replaced by backend)
        const tempSessionId = `temp_${Date.now()}`;
        
        // Callback to create backend session
        if (onSessionStart) {
          await onSessionStart(tempSessionId);
        }
        
        // Start timer
        start(tempSessionId);
      } catch (error) {
        console.error("Failed to start session:", error);
      } finally {
        setIsStarting(false);
      }
    }
  };
  
  /**
   * Handle Reset
   */
  const handleReset = () => {
    if (isRunning) {
      const confirm = window.confirm("Bạn có chắc muốn reset timer? Session hiện tại sẽ bị hủy.");
      if (!confirm) return;
    }
    reset();
  };
  
  /**
   * Get color based on mode
   */
  const getModeColor = (m: TimerMode): string => {
    switch (m) {
      case "focus": return "text-blue-600 dark:text-blue-400";
      case "shortBreak": return "text-green-600 dark:text-green-400";
      case "longBreak": return "text-purple-600 dark:text-purple-400";
    }
  };
  
  /**
   * Calculate progress percentage
   */
  const progressPercentage = ((durations[mode] - currentTime) / durations[mode]) * 100;
  
  return (
    <div className={cn("space-y-6", className)}>
      {/* Timer Display */}
      <div className="text-center">
        <div className={cn("text-8xl font-bold mb-4 font-mono", getModeColor(mode))}>
          {formatTimer(currentTime)}
        </div>
        <div className="text-2xl font-semibold text-muted-foreground mb-2">
          {getModeLabel(mode)}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-linear",
              mode === "focus" ? "bg-blue-600" :
              mode === "shortBreak" ? "bg-green-600" :
              "bg-purple-600"
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button
          variant={mode === "focus" ? "default" : "outline"}
          onClick={() => handleModeChange("focus")}
          disabled={isRunning || disabled}
          className="min-w-[120px]"
        >
          🎯 Focus
          <span className="ml-2 text-xs opacity-70">25m</span>
        </Button>
        <Button
          variant={mode === "shortBreak" ? "default" : "outline"}
          onClick={() => handleModeChange("shortBreak")}
          disabled={isRunning || disabled}
          className="min-w-[120px]"
        >
          ☕ Short
          <span className="ml-2 text-xs opacity-70">5m</span>
        </Button>
        <Button
          variant={mode === "longBreak" ? "default" : "outline"}
          onClick={() => handleModeChange("longBreak")}
          disabled={isRunning || disabled}
          className="min-w-[120px]"
        >
          🌴 Long
          <span className="ml-2 text-xs opacity-70">15m</span>
        </Button>
      </div>
      
      {/* Task Input */}
      {showTaskInput && mode === "focus" && !isRunning && (
        <div className="max-w-md mx-auto">
          <Input
            placeholder="Bạn đang làm gì? (optional)"
            value={currentTask}
            onChange={(e) => setTask(e.target.value)}
            disabled={disabled}
            className="text-center"
          />
        </div>
      )}
      
      {/* Current Task Display (when running) */}
      {isRunning && currentTask && (
        <div className="text-center text-muted-foreground">
          📝 {currentTask}
        </div>
      )}
      
      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          onClick={handleStartPause}
          disabled={disabled || isStarting}
          className="min-w-[150px]"
        >
          {isStarting ? (
            <>⏳ Đang bắt đầu...</>
          ) : isRunning ? (
            <><Pause className="mr-2 h-5 w-5" /> Pause</>
          ) : isPaused ? (
            <><Play className="mr-2 h-5 w-5" /> Resume</>
          ) : (
            <><Play className="mr-2 h-5 w-5" /> Start</>
          )}
        </Button>
        
        {(isRunning || isPaused) && (
          <Button
            size="lg"
            variant="outline"
            onClick={handleReset}
            disabled={disabled}
          >
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
        )}
      </div>
      
      {/* Session Info */}
      {sessionId && (
        <div className="text-center text-xs text-muted-foreground">
          Session ID: {sessionId.slice(0, 8)}...
        </div>
      )}
    </div>
  );
}

