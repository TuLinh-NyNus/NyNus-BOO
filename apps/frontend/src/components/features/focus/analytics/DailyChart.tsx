/**
 * DailyChart Component
 * Bar chart showing focus time for the last 7 days
 */

'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DailyStats } from '@/services/grpc/focus-analytics.service';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DailyChartProps {
  data: DailyStats[];
  isLoading?: boolean;
}

// Format duration in hours
function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(1);
}

// Custom tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const hours = Math.floor(data.focusTimeSeconds / 3600);
    const minutes = Math.floor((data.focusTimeSeconds % 3600) / 60);
    
    return (
      <div className="bg-popover text-popover-foreground text-sm rounded-md shadow-lg p-3 border">
        <div className="font-semibold mb-1">{data.dayLabel}</div>
        <div className="text-primary font-medium">
          {hours}h {minutes}m học tập
        </div>
        <div className="text-muted-foreground text-xs mt-1">
          {data.sessionsCompleted} sessions
        </div>
      </div>
    );
  }
  return null;
}

export function DailyChart({ data, isLoading }: DailyChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  // Transform data for chart
  const chartData = data.map((day) => ({
    date: day.date,
    dayLabel: format(parseISO(day.date), 'EEE dd/MM', { locale: vi }),
    focusTimeSeconds: day.totalFocusTimeSeconds,
    focusTimeHours: parseFloat(formatHours(day.totalFocusTimeSeconds)),
    sessionsCompleted: day.sessionsCompleted,
  }));

  // Calculate max for Y-axis
  const maxHours = Math.max(...chartData.map(d => d.focusTimeHours), 1);
  const yAxisMax = Math.ceil(maxHours * 1.2); // 20% padding

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Thời gian học 7 ngày qua</h3>
          <p className="text-sm text-muted-foreground">
            Biểu đồ thời gian học tập hàng ngày
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[0, yAxisMax]}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              label={{ value: 'Giờ', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="focusTimeHours" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.focusTimeHours > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm border-t pt-4">
          <div>
            <span className="text-muted-foreground">Tổng: </span>
            <span className="font-semibold">
              {formatHours(chartData.reduce((sum, d) => sum + d.focusTimeSeconds, 0))}h
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Trung bình: </span>
            <span className="font-semibold">
              {formatHours(chartData.reduce((sum, d) => sum + d.focusTimeSeconds, 0) / chartData.length)}h/ngày
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

