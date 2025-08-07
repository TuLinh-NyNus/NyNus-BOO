'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/form/button';
import { Progress } from '@/components/ui/display/progress';
import { Card, CardContent } from "@/components/ui/display/card";
import { cn } from '@/lib/utils';

interface TimerComponentProps {
  initialTime: number; // in seconds
  onTimeUp?: () => void;
  onTimeUpdate?: (timeRemaining: number) => void;
  autoStart?: boolean;
  showProgress?: boolean;
  warningThreshold?: number; // seconds when to show warning
  className?: string;
}

/**
 * TimerComponent - Component đếm ngược thời gian
 * Sử dụng cho quiz, bài tập có thời gian giới hạn
 */
export function TimerComponent({
  initialTime,
  onTimeUp,
  onTimeUpdate,
  autoStart = false,
  showProgress = true,
  warningThreshold = 300, // 5 minutes
  className
}: TimerComponentProps): JSX.Element {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          onTimeUpdate?.(newTime);
          
          if (newTime <= 0) {
            setIsRunning(false);
            setIsFinished(true);
            onTimeUp?.();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, onTimeUpdate, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeDisplay = (): {
    formatted: string;
    isWarning: boolean;
    isCritical: boolean;
    color: string;
  } => {
    const formatted = formatTime(timeRemaining);
    const isWarning = timeRemaining <= warningThreshold && timeRemaining > 0;
    const isCritical = timeRemaining <= 60 && timeRemaining > 0;

    return {
      formatted,
      isWarning,
      isCritical,
      color: isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'
    };
  };

  const getProgressPercentage = (): number => {
    return ((initialTime - timeRemaining) / initialTime) * 100;
  };

  const handleStart = (): void => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  };

  const handlePause = (): void => {
    setIsRunning(false);
  };

  const handleReset = (): void => {
    setTimeRemaining(initialTime);
    setIsRunning(false);
    setIsFinished(false);
  };

  const timeDisplay = getTimeDisplay();
  const progressPercentage = getProgressPercentage();

  return (
    <Card className={cn("bg-slate-800/50 border-slate-700", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Timer Display */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className={cn("h-5 w-5", timeDisplay.color)} />
              <span className="text-sm text-slate-400">
                {isFinished ? 'Hết thời gian' : isRunning ? 'Đang đếm ngược' : 'Tạm dừng'}
              </span>
            </div>
            
            <motion.div
              animate={timeDisplay.isCritical ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: timeDisplay.isCritical ? Infinity : 0 }}
              className={cn(
                "text-3xl font-mono font-bold",
                timeDisplay.color
              )}
            >
              {timeDisplay.formatted}
            </motion.div>

            {timeDisplay.isWarning && !isFinished && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1 mt-2 text-sm"
              >
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400">
                  {timeDisplay.isCritical ? 'Sắp hết thời gian!' : 'Thời gian sắp hết'}
                </span>
              </motion.div>
            )}

            {isFinished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-1 mt-2 text-sm text-red-400"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Đã hết thời gian!</span>
              </motion.div>
            )}
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tiến độ</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className={cn(
                  "h-2",
                  timeDisplay.isCritical && "animate-pulse"
                )}
              />
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center gap-2">
            {!isFinished && (
              <>
                {!isRunning ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStart}
                    disabled={timeRemaining === 0}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Bắt đầu
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePause}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Tạm dừng
                  </Button>
                )}
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Đặt lại
            </Button>
          </div>

          {/* Time Information */}
          <div className="text-center text-xs text-slate-400 space-y-1">
            <div>Thời gian ban đầu: {formatTime(initialTime)}</div>
            {timeRemaining > 0 && (
              <div>Thời gian còn lại: {formatTime(timeRemaining)}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * CompactTimer - Phiên bản compact cho inline use
 */
export function CompactTimer({
  timeRemaining,
  isWarning = false,
  isCritical = false,
  className
}: {
  timeRemaining: number;
  isWarning?: boolean;
  isCritical?: boolean;
  className?: string;
}): JSX.Element {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: isCritical ? Infinity : 0 }}
      className={cn(
        "flex items-center gap-1 font-mono font-semibold",
        isCritical ? "text-red-400" : isWarning ? "text-yellow-400" : "text-white",
        className
      )}
    >
      <Clock className="h-4 w-4" />
      <span>{formatTime(timeRemaining)}</span>
      {isCritical && (
        <AlertTriangle className="h-3 w-3 animate-pulse" />
      )}
    </motion.div>
  );
}
