'use client';

import React from 'react';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Interface cho props của StatCard component
interface StatCardProps {
  title: string; // Tiêu đề của thẻ thống kê
  value: number; // Giá trị số liệu thống kê
  description: string; // Mô tả chi tiết về số liệu
  icon: React.ReactNode; // Icon hiển thị cho thẻ thống kê
  trend?: {
    value: number; // Giá trị thay đổi (có thể âm hoặc dương)
    label: string; // Nhãn mô tả thời gian (ví dụ: "tuần này", "tháng này")
    isPositive: boolean; // Xác định xu hướng tích cực hay tiêu cực
  };
  colorScheme?: 'blue' | 'purple' | 'emerald' | 'pink' | 'orange' | 'indigo'; // Color scheme cho card
}

// Color schemes inspired by Hero component - More vibrant and diverse
const colorSchemes = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-400/15 via-blue-500/10 to-blue-600/15 dark:from-blue-400/25 dark:via-blue-500/15 dark:to-blue-600/25',
    border: 'border-blue-400/30 dark:border-blue-400/40',
    iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-400/30'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400/15 via-purple-500/10 to-purple-600/15 dark:from-purple-400/25 dark:via-purple-500/15 dark:to-purple-600/25',
    border: 'border-purple-400/30 dark:border-purple-400/40',
    iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-purple-500/30 dark:hover:shadow-purple-400/30'
  },
  emerald: {
    bg: 'bg-gradient-to-br from-emerald-400/15 via-emerald-500/10 to-emerald-600/15 dark:from-emerald-400/25 dark:via-emerald-500/15 dark:to-emerald-600/25',
    border: 'border-emerald-400/30 dark:border-emerald-400/40',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-emerald-500/30 dark:hover:shadow-emerald-400/30'
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-400/15 via-pink-500/10 to-pink-600/15 dark:from-pink-400/25 dark:via-pink-500/15 dark:to-pink-600/25',
    border: 'border-pink-400/30 dark:border-pink-400/40',
    iconBg: 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg shadow-pink-500/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-pink-500/30 dark:hover:shadow-pink-400/30'
  },
  orange: {
    bg: 'bg-gradient-to-br from-yellow-400/15 via-orange-500/10 to-orange-600/15 dark:from-yellow-400/25 dark:via-orange-500/15 dark:to-orange-600/25',
    border: 'border-orange-400/30 dark:border-orange-400/40',
    iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-600 shadow-lg shadow-orange-500/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-orange-500/30 dark:hover:shadow-orange-400/30'
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-400/15 via-indigo-500/10 to-indigo-600/15 dark:from-indigo-400/25 dark:via-indigo-500/15 dark:to-indigo-600/25',
    border: 'border-indigo-400/30 dark:border-indigo-400/40',
    iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-indigo-500/30 dark:hover:shadow-indigo-400/30'
  },
  // New vibrant schemes inspired by Hero
  coral: {
    bg: 'bg-gradient-to-br from-rose-400/15 via-coral-500/10 to-red-500/15 dark:from-rose-400/25 dark:via-coral-500/15 dark:to-red-500/25',
    border: 'border-rose-400/30 dark:border-rose-400/40',
    iconBg: 'bg-gradient-to-br from-rose-400 to-red-500 shadow-lg shadow-rose-500/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-rose-500/30 dark:hover:shadow-rose-400/30'
  },
  cyan: {
    bg: 'bg-gradient-to-br from-cyan-400/15 via-cyan-500/10 to-teal-500/15 dark:from-cyan-400/25 dark:via-cyan-500/15 dark:to-teal-500/25',
    border: 'border-cyan-400/30 dark:border-cyan-400/40',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg shadow-cyan-500/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-cyan-400 to-teal-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-cyan-500/30 dark:hover:shadow-cyan-400/30'
  }
};

/**
 * Component StatCard - Hiển thị thẻ thống kê với icon, giá trị và xu hướng
 * Sử dụng cho dashboard admin để hiển thị các metrics quan trọng
 * Enhanced với beautiful gradients và animations
 */
export function StatCard({ title, value, description, icon, trend, colorScheme = 'blue' }: StatCardProps) {
  const scheme = colorSchemes[colorScheme];

  return (
    <Card className={cn(
      "relative overflow-hidden border transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm",
      scheme.bg,
      scheme.border,
      scheme.hoverGlow
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-foreground/90">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg transition-all duration-300", scheme.iconBg)}>
          <div className={scheme.iconColor}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {/* Hiển thị giá trị chính với gradient text */}
        <div className={cn("text-2xl font-bold mb-1", scheme.valueGradient)}>
          {value.toLocaleString()}
        </div>

        {/* Mô tả chi tiết về số liệu */}
        <p className="text-xs text-muted-foreground/80">{description}</p>

        {/* Hiển thị xu hướng nếu có với enhanced styling */}
        {trend && (
          <div className="flex items-center pt-1">
            <Badge
              variant={trend.isPositive ? "default" : "secondary"}
              className={cn(
                "text-xs font-medium transition-all duration-300",
                trend.isPositive
                  ? "bg-green-500/15 text-green-600 border-green-500/20 dark:bg-green-500/25 dark:text-green-400 dark:border-green-400/30"
                  : "bg-red-500/15 text-red-600 border-red-500/20 dark:bg-red-500/25 dark:text-red-400 dark:border-red-400/30"
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value} {trend.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

