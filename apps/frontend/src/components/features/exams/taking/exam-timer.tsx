/**
 * Exam Timer Component
 * Countdown timer với accurate time tracking, warnings, và auto-submit functionality
 * Integrates với exam-attempt.store.ts cho real-time timer management
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-22
 */

"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  Button,
  Badge,
} from "@/components/ui";

// Icons
import {
  Clock,
  Pause,
  Play,
  AlertTriangle,
  Timer,
} from "lucide-react";

// Store integration
import { useExamAttemptStore, useExamTimer } from "@/lib/stores/exam-attempt.store";

// ===== TYPES =====

export interface ExamTimerProps {
  /** Show pause/resume controls */
  showControls?: boolean;
  
  /** Timer display variant */
  variant?: 'default' | 'compact' | 'minimal';
  
  /** Timer size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show warning indicators */
  showWarnings?: boolean;
  
  /** Show time spent */
  showTimeSpent?: boolean;
  
  /** Custom warning thresholds in seconds */
  customWarnings?: number[];
  
  /** Event handlers */
  onTimeWarning?: (remainingSeconds: number) => void;
  onTimeUp?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  
  /** Additional CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const VARIANT_STYLES = {
  default: "p-4",
  compact: "p-3",
  minimal: "p-2",
} as const;

const SIZE_STYLES = {
  sm: {
    text: "text-lg",
    icon: "w-4 h-4",
    button: "h-8 w-8",
  },
  md: {
    text: "text-xl",
    icon: "w-5 h-5", 
    button: "h-9 w-9",
  },
  lg: {
    text: "text-2xl",
    icon: "w-6 h-6",
    button: "h-10 w-10",
  },
} as const;

// ===== UTILITY FUNCTIONS =====

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getTimeStatus(remainingSeconds: number, totalSeconds: number): {
  status: 'normal' | 'warning' | 'critical' | 'expired';
  color: string;
  bgColor: string;
} {
  const percentage = (remainingSeconds / totalSeconds) * 100;
  
  if (remainingSeconds <= 0) {
    return {
      status: 'expired',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
    };
  }
  
  if (percentage <= 5 || remainingSeconds <= 300) { // 5% or 5 minutes
    return {
      status: 'critical',
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
    };
  }
  
  if (percentage <= 15 || remainingSeconds <= 900) { // 15% or 15 minutes
    return {
      status: 'warning',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
    };
  }
  
  return {
    status: 'normal',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  };
}

// ===== MAIN COMPONENT =====

export function ExamTimer({
  showControls = true,
  variant = 'default',
  size = 'md',
  showWarnings = true,
  showTimeSpent = false,
  customWarnings,
  onTimeWarning,
  onTimeUp,
  onPause,
  onResume,
  className,
}: ExamTimerProps) {
  
  // Store state
  const timer = useExamAttemptStore(state => state.timer);
  const pauseTimer = useExamAttemptStore(state => state.pauseTimer);
  const resumeTimer = useExamAttemptStore(state => state.resumeTimer);
  const addWarningThreshold = useExamAttemptStore(state => state.addWarningThreshold);
  const getTimeSpent = useExamAttemptStore(state => state.getTimeSpent);
  
  // Initialize timer hook
  useExamTimer();
  
  // Add custom warning thresholds
  React.useEffect(() => {
    if (customWarnings) {
      customWarnings.forEach(threshold => {
        addWarningThreshold(threshold);
      });
    }
  }, [customWarnings, addWarningThreshold]);
  
  // Handle time warnings
  React.useEffect(() => {
    if (onTimeWarning && timer.timeRemainingSeconds > 0) {
      onTimeWarning(timer.timeRemainingSeconds);
    }
  }, [timer.timeRemainingSeconds, onTimeWarning]);
  
  // Handle time up
  React.useEffect(() => {
    if (timer.timeRemainingSeconds <= 0 && timer.totalDurationSeconds > 0) {
      onTimeUp?.();
    }
  }, [timer.timeRemainingSeconds, timer.totalDurationSeconds, onTimeUp]);
  
  // Computed values
  const timeStatus = useMemo(() => 
    getTimeStatus(timer.timeRemainingSeconds, timer.totalDurationSeconds),
    [timer.timeRemainingSeconds, timer.totalDurationSeconds]
  );
  
  const formattedTime = useMemo(() => 
    formatTime(timer.timeRemainingSeconds),
    [timer.timeRemainingSeconds]
  );
  
  const timeSpent = useMemo(() => 
    showTimeSpent ? getTimeSpent() : 0,
    [showTimeSpent, getTimeSpent]
  );
  
  const sizeConfig = SIZE_STYLES[size];
  
  // Handlers
  const handlePause = () => {
    pauseTimer();
    onPause?.();
  };
  
  const handleResume = () => {
    resumeTimer();
    onResume?.();
  };
  
  // Don't render if no timer is active
  if (timer.totalDurationSeconds === 0) {
    return null;
  }
  
  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        timeStatus.bgColor,
        variant === 'minimal' && "border-0 shadow-none",
        className
      )}
      data-testid="exam-timer"
    >
      <CardContent className={VARIANT_STYLES[variant]}>
        <div className="flex items-center justify-between">
          {/* Timer Display */}
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex items-center justify-center rounded-full p-2",
              timeStatus.status === 'critical' ? "bg-red-100" :
              timeStatus.status === 'warning' ? "bg-orange-100" : "bg-green-100"
            )}>
              {timeStatus.status === 'expired' ? (
                <AlertTriangle className={cn(sizeConfig.icon, "text-red-600")} />
              ) : (
                <Clock className={cn(sizeConfig.icon, timeStatus.color)} />
              )}
            </div>
            
            <div>
              <div className={cn(
                "font-mono font-bold",
                sizeConfig.text,
                timeStatus.color
              )}>
                {formattedTime}
              </div>
              
              {variant !== 'minimal' && (
                <div className="text-xs text-gray-600">
                  {timeStatus.status === 'expired' ? 'Hết thời gian' :
                   timeStatus.status === 'critical' ? 'Sắp hết thời gian' :
                   timeStatus.status === 'warning' ? 'Còn ít thời gian' :
                   'Thời gian còn lại'}
                </div>
              )}
            </div>
          </div>
          
          {/* Status Indicators */}
          {showWarnings && variant !== 'minimal' && (
            <div className="flex items-center space-x-2">
              {timer.isPaused && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Pause className="w-3 h-3 mr-1" />
                  Tạm dừng
                </Badge>
              )}
              
              {timeStatus.status === 'critical' && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Khẩn cấp
                </Badge>
              )}
              
              {timeStatus.status === 'warning' && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Timer className="w-3 h-3 mr-1" />
                  Cảnh báo
                </Badge>
              )}
            </div>
          )}
          
          {/* Controls */}
          {showControls && variant !== 'minimal' && (
            <div className="flex items-center space-x-2">
              {timer.isPaused ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResume}
                  className={cn(sizeConfig.button, "p-0")}
                  title="Tiếp tục"
                >
                  <Play className={sizeConfig.icon} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePause}
                  className={cn(sizeConfig.button, "p-0")}
                  title="Tạm dừng"
                >
                  <Pause className={sizeConfig.icon} />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Time Spent */}
        {showTimeSpent && variant === 'default' && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Thời gian đã làm:</span>
              <span className="font-mono">{formatTime(timeSpent)}</span>
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        {variant === 'default' && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-1000",
                  timeStatus.status === 'critical' ? "bg-red-500" :
                  timeStatus.status === 'warning' ? "bg-orange-500" : "bg-green-500"
                )}
                style={{
                  width: `${Math.max(0, (timer.timeRemainingSeconds / timer.totalDurationSeconds) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
