/**
 * Security Trend Chart
 * Simple CSS-based trend visualization
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TYPES =====

interface TrendDataPoint {
  date: string;
  score: number;
  vulnerabilities: number;
}

export interface SecurityTrendChartProps {
  data: TrendDataPoint[];
  className?: string;
}

// ===== COMPONENT =====

export function SecurityTrendChart({ data, className }: SecurityTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Security Trend</CardTitle>
          <CardDescription>No historical data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate min/max for scaling
  const scores = data.map(d => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore || 1;

  // Calculate trend
  const firstScore = data[0].score;
  const lastScore = data[data.length - 1].score;
  const trend = lastScore > firstScore ? 'up' : lastScore < firstScore ? 'down' : 'stable';
  const trendPercentage = ((lastScore - firstScore) / firstScore * 100).toFixed(1);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Security Score Trend</CardTitle>
            <CardDescription>Last {data.length} scans</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {trend === 'up' && (
              <>
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-600">
                  +{trendPercentage}%
                </span>
              </>
            )}
            {trend === 'down' && (
              <>
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-sm font-semibold text-red-600">
                  {trendPercentage}%
                </span>
              </>
            )}
            {trend === 'stable' && (
              <>
                <Minus className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-600">
                  Stable
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart Container */}
        <div className="relative h-48 w-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{maxScore}</span>
            <span>{Math.round((maxScore + minScore) / 2)}</span>
            <span>{minScore}</span>
          </div>

          {/* Chart area */}
          <div className="absolute left-14 right-0 top-0 bottom-0">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-px bg-gray-200" />
              ))}
            </div>

            {/* Line chart */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {/* Area fill */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Area path */}
              <path
                d={generateAreaPath(data, minScore, scoreRange)}
                fill="url(#scoreGradient)"
                stroke="none"
              />

              {/* Line path */}
              <path
                d={generateLinePath(data, minScore, scoreRange)}
                fill="none"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((point.score - minScore) / scoreRange) * 100;
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="rgb(59, 130, 246)"
                    stroke="white"
                    strokeWidth="2"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${point.date}: ${point.score}`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="absolute left-14 right-0 -bottom-6 flex justify-between text-xs text-muted-foreground">
            <span>{formatDate(data[0].date)}</span>
            {data.length > 2 && (
              <span>{formatDate(data[Math.floor(data.length / 2)].date)}</span>
            )}
            <span>{formatDate(data[data.length - 1].date)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="text-2xl font-bold">{lastScore}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-2xl font-bold">
              {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Peak</p>
            <p className="text-2xl font-bold">{maxScore}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== HELPERS =====

function generateLinePath(data: TrendDataPoint[], minScore: number, scoreRange: number): string {
  if (data.length === 0) return '';

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.score - minScore) / scoreRange) * 100;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}

function generateAreaPath(data: TrendDataPoint[], minScore: number, scoreRange: number): string {
  if (data.length === 0) return '';

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.score - minScore) / scoreRange) * 100;
    return `${x},${y}`;
  });

  // Start from bottom-left, go through points, end at bottom-right
  return `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
}

export default SecurityTrendChart;

