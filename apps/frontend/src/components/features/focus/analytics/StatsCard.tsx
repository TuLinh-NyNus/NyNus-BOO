/**
 * StatsCard Component
 * Card component hiển thị thống kê số liệu (metrics)
 * 
 * Features:
 * - Metric name với icon
 * - Value (số liệu chính)
 * - Unit/description
 * - Change indicator (+/- %) optional
 * - Trend sparkline optional
 * - Customizable colors
 * 
 * @author NyNus Development Team
 * @created 2025-01-31
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  // Metric title
  title: string;
  
  // Icon component from lucide-react
  icon?: LucideIcon;
  
  // Icon color (Tailwind class)
  iconColor?: string;
  
  // Main value (số liệu chính)
  value: string | number;
  
  // Unit or description
  unit?: string;
  
  // Change percentage (e.g., +15, -8)
  change?: number;
  
  // Change period description
  changePeriod?: string;
  
  // Loading state
  loading?: boolean;
  
  // Custom className
  className?: string;
  
  // Card click handler
  onClick?: () => void;
}

export function StatsCard({
  title,
  icon: Icon,
  iconColor = "text-primary",
  value,
  unit,
  change,
  changePeriod = "vs last period",
  loading = false,
  className,
  onClick,
}: StatsCardProps) {
  
  /**
   * Get change indicator color and symbol
   */
  const getChangeIndicator = () => {
    if (change === undefined || change === null) return null;
    
    const isPositive = change >= 0;
    const colorClass = isPositive ? "text-green-600" : "text-red-600";
    const symbol = isPositive ? "+" : "";
    
    return (
      <div className={cn("text-xs font-medium", colorClass)}>
        {symbol}{change}% {changePeriod}
      </div>
    );
  };
  
  // Loading state
  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-3">
          <div className="h-4 bg-muted rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-16 mb-2"></div>
          <div className="h-3 bg-muted rounded w-20"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      className={cn(
        "transition-all",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {Icon && <Icon className={cn("w-4 h-4", iconColor)} />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Value */}
        <div className="text-3xl font-bold">{value}</div>
        
        {/* Unit/Description */}
        {unit && (
          <p className="text-xs text-muted-foreground mt-1">{unit}</p>
        )}
        
        {/* Change Indicator */}
        {change !== undefined && change !== null && (
          <div className="mt-2">
            {getChangeIndicator()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

