/**
 * SubjectBreakdown Component
 * Pie chart showing time breakdown by subject
 */

'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { SubjectTime } from '@/services/grpc/focus-analytics.service';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SubjectBreakdownProps {
  subjects: SubjectTime[];
  isLoading?: boolean;
}

// Color palette for subjects
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// Format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Custom tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground text-sm rounded-md shadow-lg p-3 border">
        <div className="font-semibold mb-1">{data.subject}</div>
        <div className="text-primary font-medium">
          {formatDuration(data.timeSeconds)}
        </div>
        <div className="text-muted-foreground text-xs mt-1">
          {data.percentage.toFixed(1)}% tổng thời gian
        </div>
      </div>
    );
  }
  return null;
}

// Custom label
interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomLabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage > 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function SubjectBreakdown({ subjects, isLoading }: SubjectBreakdownProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[350px] w-full" />
      </Card>
    );
  }

  // Take top 5 subjects
  const topSubjects = subjects.slice(0, 5);

  if (topSubjects.length === 0) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Phân bố môn học</h3>
            <p className="text-sm text-muted-foreground">
              Thời gian học theo từng môn
            </p>
          </div>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Chưa có dữ liệu môn học
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Phân bố môn học</h3>
          <p className="text-sm text-muted-foreground">
            Top 5 môn học bạn đã tập trung
          </p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topSubjects}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="timeSeconds"
            >
              {topSubjects.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="space-y-2">
          {topSubjects.map((subject, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium">{subject.subject}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {formatDuration(subject.timeSeconds)}
                </span>
                <span className="font-semibold text-primary min-w-[45px] text-right">
                  {subject.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

