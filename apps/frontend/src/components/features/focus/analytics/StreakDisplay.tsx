/**
 * StreakDisplay Component
 * Enhanced streak visualization with calendar
 */

'use client';

import React from 'react';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Flame, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  lastStudyDate?: Date;
}

interface StreakDisplayProps {
  streakData?: StreakInfo;
  isLoading?: boolean;
}

// Generate last 7 days for mini calendar
function generateLast7Days(lastStudyDate?: Date): Array<{ date: Date; isActive: boolean }> {
  const today = new Date();
  const lastStudy = lastStudyDate || null;
  const days: Array<{ date: Date; isActive: boolean }> = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const isActive = lastStudy ? isSameDay(date, lastStudy) || date < lastStudy : false;
    days.push({ date, isActive });
  }

  return days;
}

export function StreakDisplay({ streakData, isLoading }: StreakDisplayProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[250px] w-full" />
      </Card>
    );
  }

  const last7Days = generateLast7Days(streakData?.lastStudyDate);
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;
  const totalDays = streakData?.totalStudyDays || 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Streak của bạn</h3>
          <Flame className="w-5 h-5 text-orange-500" />
        </div>

        {/* Current Streak - Big Display */}
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="relative">
              {/* Fire emoji with animation */}
              <div className={`text-6xl ${currentStreak > 0 ? 'animate-pulse' : 'opacity-50'}`}>
                🔥
              </div>
              {currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {currentStreak > 99 ? '99+' : currentStreak}
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="text-4xl font-bold text-orange-500">
                {currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">
                ngày liên tiếp
              </div>
            </div>
          </div>

          {currentStreak > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Tuyệt vời! Hãy tiếp tục duy trì! 💪
            </p>
          )}
          {currentStreak === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Bắt đầu học hôm nay để tạo streak! 🚀
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Kỷ lục</span>
            </div>
            <div className="text-2xl font-bold text-blue-500">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">ngày dài nhất</div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Tổng cộng</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{totalDays}</div>
            <div className="text-xs text-muted-foreground">ngày đã học</div>
          </div>
        </div>

        {/* Mini Calendar - Last 7 Days */}
        <div>
          <div className="text-sm font-medium mb-3">7 ngày gần nhất</div>
          <div className="flex gap-2 justify-between">
            {last7Days.map((day, index) => (
              <div key={index} className="flex-1">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(day.date, 'EEE', { locale: vi })}
                  </div>
                  <div
                    className={`
                      w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium
                      transition-all duration-200
                      ${
                        day.isActive
                          ? 'bg-orange-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }
                      ${isSameDay(day.date, new Date()) ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}
                    title={format(day.date, 'dd/MM/yyyy', { locale: vi })}
                  >
                    {format(day.date, 'd')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {currentStreak > 0 && currentStreak < 7 && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Mẹo:</strong> Học ít nhất 30 phút mỗi ngày để duy trì streak!
            </p>
          </div>
        )}

        {currentStreak >= 7 && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-xs text-green-700 dark:text-green-300">
              🎉 <strong>Xuất sắc!</strong> Bạn đã duy trì streak {currentStreak} ngày!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

