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
  // Optional miniature sparkline data (last N points)
  sparklineData?: number[];
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

// MODERN GLASSMORPHISM COLOR SYSTEM - Enhanced with vibrant gradients
const colorSchemes = {
  // PRIMARY BLUE - General metrics with ocean vibes
  primary: {
    bg: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 dark:from-blue-500/20 dark:via-cyan-500/15 dark:to-blue-600/20',
    border: 'border-white/10 dark:border-white/20',
    iconBg: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-2xl shadow-blue-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-blue-500/30 hover:border-blue-400/30 dark:hover:shadow-blue-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent pointer-events-none'
  },

  // SUCCESS GREEN - Active states with nature vibes
  success: {
    bg: 'bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:via-green-500/15 dark:to-teal-500/20',
    border: 'border-white/10 dark:border-white/20',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 shadow-2xl shadow-emerald-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400/30 dark:hover:shadow-emerald-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-transparent pointer-events-none'
  },

  // EDUCATION GOLDEN - Warm sunrise vibes
  education: {
    bg: 'bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 dark:from-amber-500/20 dark:via-yellow-500/15 dark:to-orange-500/20',
    border: 'border-white/10 dark:border-white/20',
    iconBg: 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 shadow-2xl shadow-amber-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-amber-500/30 hover:border-amber-400/30 dark:hover:shadow-amber-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-transparent pointer-events-none'
  },

  // ACCENT PURPLE - Mystical cosmic vibes
  accent: {
    bg: 'bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-pink-500/10 dark:from-purple-500/20 dark:via-fuchsia-500/15 dark:to-pink-500/20',
    border: 'border-white/10 dark:border-white/20',
    iconBg: 'bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 shadow-2xl shadow-purple-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400/30 dark:hover:shadow-purple-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-transparent pointer-events-none'
  },

  // ALERT CORAL - Vibrant energy vibes
  alert: {
    bg: 'bg-gradient-to-br from-rose-500/10 via-red-500/10 to-pink-500/10 dark:from-rose-500/20 dark:via-red-500/15 dark:to-pink-500/20',
    border: 'border-white/10 dark:border-white/20',
    iconBg: 'bg-gradient-to-br from-rose-500 via-red-500 to-pink-500 shadow-2xl shadow-rose-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-rose-600 via-red-500 to-pink-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-rose-500/30 hover:border-rose-400/30 dark:hover:shadow-rose-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-rose-500/5 via-red-500/5 to-transparent pointer-events-none'
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
  sparklineData,
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
        "group relative overflow-hidden border transition-all duration-500 h-full min-h-[200px]",
        "backdrop-blur-xl bg-card/40 shadow-lg",
        onClick && !isLoading && "cursor-pointer hover:scale-[1.03] active:scale-[0.97]",
        scheme.bg,
        scheme.border,
        scheme.hoverGlow,
        "hover:-translate-y-1",
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
      {/* Glassmorphism Accent Glow */}
      <div className={scheme.accentGlow} />
      
      {/* Animated Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Floating Orb Effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 pt-6 px-6 relative z-10">
        <CardTitle className="text-sm font-bold text-foreground/90 tracking-wide uppercase">{title}</CardTitle>
        <div className={cn(
          "p-3 rounded-2xl transition-all duration-500",
          "group-hover:rotate-12 group-hover:scale-125",
          scheme.iconBg
        )}>
          <div className={cn(scheme.iconColor, "scale-110")}>
            {icon}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 px-6 pb-6">
        {/* Value with mega emphasis */}
        <div className={cn(
          "text-5xl font-black mb-4 transition-all duration-500",
          "group-hover:scale-110 group-hover:tracking-tight",
          scheme.valueGradient,
          "drop-shadow-sm"
        )}>
          {formatValue(value)}
        </div>

        {/* Optional micro sparkline */}
        {sparklineData && sparklineData.length > 1 && (
          <div className="mb-4 -ml-1 -mr-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 100 24" className="w-full h-6">
              {/* Gradient stroke */}
              <defs>
                <linearGradient id={`grad-${title.replace(/\s+/g,'-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                </linearGradient>
              </defs>
              {/* Baseline */}
              <line x1="0" y1="22" x2="100" y2="22" stroke="currentColor" className="text-white/10" strokeWidth="0.5" />
              {/* Sparkline path */}
              {
                (() => {
                  const max = Math.max(...sparklineData!);
                  const min = Math.min(...sparklineData!);
                  const range = Math.max(1, max - min);
                  const step = 100 / (sparklineData!.length - 1);
                  const points = sparklineData!.map((v, i) => {
                    const x = i * step;
                    const y = 22 - ((v - min) / range) * 18; // padding top 4px
                    return `${x},${y}`;
                  }).join(' ');
                  return <polyline points={points} fill="none" stroke={`url(#grad-${title.replace(/\s+/g,'-')})`} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />;
                })()
              }
            </svg>
          </div>
        )}

        {/* Description with subtle animation */}
        <p className="text-sm font-medium text-muted-foreground/70 leading-relaxed mb-4 group-hover:text-muted-foreground/90 transition-colors duration-300">
          {description}
        </p>

        {/* Trend Badge with glassmorphism */}
        {trend && (
          <div className="flex items-center pt-3 border-t border-white/10">
            <Badge
              variant={trend.isPositive ? "default" : "secondary"}
              className={cn(
                "text-xs font-bold transition-all duration-300 backdrop-blur-sm",
                "group-hover:scale-105",
                trend.isPositive
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-400/30 shadow-emerald-500/20"
                  : "bg-rose-500/20 text-rose-400 border-rose-400/30 shadow-rose-500/20"
              )}
            >
              {trend.isPositive ? '↗' : '↘'} {trend.isPositive ? '+' : ''}{trend.value} {trend.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

