/**
 * ContributionGraph Component
 * GitHub-style 365-day contribution heatmap
 */

'use client';

import React from 'react';
import { format, startOfWeek, addDays, subDays, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { ContributionDay } from '@/services/grpc/focus-analytics.service';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ContributionGraphProps {
  data: ContributionDay[];
  isLoading?: boolean;
}

// Format duration helper
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Get color class based on level (0-4)
function getLevelColor(level: number): string {
  const colors = [
    'bg-gray-100 dark:bg-gray-800', // Level 0 - no activity
    'bg-green-200 dark:bg-green-900', // Level 1 - < 30min
    'bg-green-400 dark:bg-green-700', // Level 2 - 30-60min
    'bg-green-600 dark:bg-green-500', // Level 3 - 1-2h
    'bg-green-800 dark:bg-green-300', // Level 4 - > 2h
  ];
  return colors[level] || colors[0];
}

// Generate 52 weeks of data (365 days)
function generateWeeksData(contributions: ContributionDay[]): ContributionDay[][] {
  const today = new Date();
  const startDate = subDays(today, 364); // 365 days ago
  const weeks: ContributionDay[][] = [];
  
  // Create a map for quick lookup
  const contributionMap = new Map<string, ContributionDay>();
  contributions.forEach(day => {
    contributionMap.set(day.date, day);
  });

  // Generate 52 weeks
  let currentDate = startOfWeek(startDate, { weekStartsOn: 1 }); // Start on Monday
  
  for (let week = 0; week < 52; week++) {
    const weekData: ContributionDay[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const contribution = contributionMap.get(dateStr) || {
        date: dateStr,
        focusTimeSeconds: 0,
        level: 0,
        sessionsCount: 0,
      };
      
      weekData.push(contribution);
      currentDate = addDays(currentDate, 1);
    }
    
    weeks.push(weekData);
  }
  
  return weeks;
}

// Get month labels
function getMonthLabels(): string[] {
  const months: string[] = [];
  const today = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = subDays(today, i * 30);
    months.push(format(date, 'MMM', { locale: vi }));
  }
  
  return months;
}

export function ContributionGraph({ data, isLoading }: ContributionGraphProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[180px] w-full" />
      </Card>
    );
  }

  const weeks = generateWeeksData(data);
  const monthLabels = getMonthLabels();
  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Biểu đồ đóng góp</h3>
          <p className="text-sm text-muted-foreground">
            Hoạt động học tập của bạn trong 365 ngày qua
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Month labels */}
            <div className="flex mb-2 text-xs text-muted-foreground">
              {monthLabels.map((month, index) => (
                <div key={index} className="flex-1 text-center">
                  {month}
                </div>
              ))}
            </div>

            {/* Graph grid */}
            <div className="flex gap-1">
              {/* Day labels */}
              <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
                {dayLabels.map((day, index) => (
                  <div key={index} className="h-3 flex items-center">
                    {index % 2 === 0 ? day : ''}
                  </div>
                ))}
              </div>

              {/* Weeks grid */}
              <div className="flex gap-1 flex-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`h-3 w-3 rounded-sm ${getLevelColor(day.level)} hover:ring-2 hover:ring-primary transition-all cursor-pointer group relative`}
                        title={`${format(parseISO(day.date), 'dd/MM/yyyy', { locale: vi })}: ${formatDuration(day.focusTimeSeconds)} (${day.sessionsCount} sessions)`}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                          <div className="bg-popover text-popover-foreground text-xs rounded-md shadow-lg p-2 whitespace-nowrap border">
                            <div className="font-semibold">
                              {format(parseISO(day.date), 'dd/MM/yyyy', { locale: vi })}
                            </div>
                            <div>
                              {day.focusTimeSeconds > 0 ? (
                                <>
                                  <span className="font-medium">{formatDuration(day.focusTimeSeconds)}</span>
                                  <span className="text-muted-foreground"> học tập</span>
                                  <br />
                                  <span className="text-muted-foreground">{day.sessionsCount} sessions</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Không có hoạt động</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span>Ít</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-3 w-3 rounded-sm ${getLevelColor(level)}`}
                  />
                ))}
              </div>
              <span>Nhiều</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

