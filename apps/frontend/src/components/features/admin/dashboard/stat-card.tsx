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
  colorScheme?: 'primary' | 'success' | 'education' | 'accent' | 'alert'; // Unified semantic color scheme
  onClick?: () => void; // Optional click handler cho interactivity
  isLoading?: boolean; // Loading state
  className?: string; // Additional CSS classes
  format?: 'number' | 'currency' | 'percentage'; // Format cho value display
}

// UNIFIED SEMANTIC COLOR PALETTE - NyNus Admin Panel
// 5-color system với semantic meanings rõ ràng
const colorSchemes = {
  // PRIMARY BLUE - General metrics, user counts, courses
  primary: {
    bg: 'bg-gradient-to-br from-[#5B88B9]/15 via-[#5B88B9]/10 to-[#4A6B8A]/15 dark:from-[#5B88B9]/25 dark:via-[#5B88B9]/15 dark:to-[#4A6B8A]/25',
    border: 'border-[#5B88B9]/30 dark:border-[#5B88B9]/40',
    iconBg: 'bg-gradient-to-br from-[#5B88B9] to-[#4A6B8A] shadow-lg shadow-[#5B88B9]/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-[#5B88B9] to-[#4A6B8A] bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-[#5B88B9]/30 dark:hover:shadow-[#5B88B9]/30'
  },

  // SUCCESS GREEN - Active states, positive metrics
  success: {
    bg: 'bg-gradient-to-br from-[#48BB78]/15 via-[#48BB78]/10 to-[#38A169]/15 dark:from-[#48BB78]/25 dark:via-[#48BB78]/15 dark:to-[#38A169]/25',
    border: 'border-[#48BB78]/30 dark:border-[#48BB78]/40',
    iconBg: 'bg-gradient-to-br from-[#48BB78] to-[#38A169] shadow-lg shadow-[#48BB78]/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-[#48BB78] to-[#38A169] bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-[#48BB78]/30 dark:hover:shadow-[#48BB78]/30'
  },

  // EDUCATION GOLDEN - Graduation caps, education achievements
  education: {
    bg: 'bg-gradient-to-br from-[#FDAD00]/15 via-[#FDAD00]/10 to-[#E09900]/15 dark:from-[#FDAD00]/25 dark:via-[#FDAD00]/15 dark:to-[#E09900]/25',
    border: 'border-[#FDAD00]/30 dark:border-[#FDAD00]/40',
    iconBg: 'bg-gradient-to-br from-[#FDAD00] to-[#E09900] shadow-lg shadow-[#FDAD00]/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-[#FDAD00] to-[#E09900] bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-[#FDAD00]/30 dark:hover:shadow-[#FDAD00]/30'
  },

  // ACCENT PURPLE - Sessions, activities, engagement
  accent: {
    bg: 'bg-gradient-to-br from-[#A259FF]/15 via-[#A259FF]/10 to-[#32197D]/15 dark:from-[#A259FF]/25 dark:via-[#A259FF]/15 dark:to-[#32197D]/25',
    border: 'border-[#A259FF]/30 dark:border-[#A259FF]/40',
    iconBg: 'bg-gradient-to-br from-[#A259FF] to-[#32197D] shadow-lg shadow-[#A259FF]/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-[#A259FF] to-[#32197D] bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-[#A259FF]/30 dark:hover:shadow-[#A259FF]/30'
  },

  // ALERT CORAL - Warnings, questions, attention-needed items
  alert: {
    bg: 'bg-gradient-to-br from-[#FD5653]/15 via-[#FD5653]/10 to-[#E04845]/15 dark:from-[#FD5653]/25 dark:via-[#FD5653]/15 dark:to-[#E04845]/25',
    border: 'border-[#FD5653]/30 dark:border-[#FD5653]/40',
    iconBg: 'bg-gradient-to-br from-[#FD5653] to-[#E04845] shadow-lg shadow-[#FD5653]/25',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-[#FD5653] to-[#E04845] bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-xl hover:shadow-[#FD5653]/30 dark:hover:shadow-[#FD5653]/30'
  }
};

/**
 * Component StatCard - Hiển thị thẻ thống kê với icon, giá trị và xu hướng
 * Sử dụng cho dashboard admin để hiển thị các metrics quan trọng
 * Enhanced với beautiful gradients và animations
 */
export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  colorScheme = 'primary',
  onClick,
  isLoading = false,
  className,
  format = 'number'
}: StatCardProps) {
  const scheme = colorSchemes[colorScheme];

  // Handle click với haptic feedback
  const handleClick = () => {
    if (onClick && !isLoading) {
      onClick();
    }
  };

  // Format value based on format type
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border transition-all duration-300 backdrop-blur-sm group",
        onClick && !isLoading && "cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
        scheme.bg,
        scheme.border,
        scheme.hoverGlow,
        className
      )}
      onClick={handleClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !isLoading ? 0 : undefined}
      aria-label={onClick ? `View details for ${title}` : undefined}
      onKeyDown={(e) => {
        if (onClick && !isLoading && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
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
        {/* Hiển thị giá trị chính với enhanced typography */}
        <div className={cn(
          "text-3xl font-extrabold mb-2 transition-all duration-300 group-hover:scale-105",
          scheme.valueGradient
        )}>
          {formatValue(value)}
        </div>

        {/* Mô tả chi tiết với improved readability */}
        <p className="text-sm font-medium text-muted-foreground/90 leading-relaxed">
          {description}
        </p>

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

