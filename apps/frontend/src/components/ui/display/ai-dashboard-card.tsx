"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
  trend?: "up" | "down" | "neutral";
}

interface AIDashboardCardProps {
  title: string;
  metrics: DashboardMetric[];
  className?: string;
  expandable?: boolean;
  loading?: boolean;
}

export const AIDashboardCard: React.FC<AIDashboardCardProps> = ({
  title,
  metrics,
  className,
  expandable = false,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTrendIcon = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend?: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  if (loading) {
    return (
      <div className={cn("bg-card border rounded-lg p-6 animate-pulse", className)}>
        <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-8 bg-muted rounded w-8"></div>
              <div className="flex-1">
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded w-1/4 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "bg-card border rounded-lg p-6 transition-all duration-300 cursor-pointer",
        expandable && "hover:shadow-lg",
        className
      )}
      whileHover={expandable ? { y: -2 } : {}}
      onClick={() => expandable && setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {expandable && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {metric.icon || (
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", metric.color || "bg-primary/10")}>
                  {getTrendIcon(metric.trend)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {metric.label}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-foreground">
                  {metric.value}
                </span>
                {metric.change !== undefined && (
                  <span className={cn("text-sm font-medium", getTrendColor(metric.trend))}>
                    {metric.change > 0 ? "+" : ""}{metric.change}%
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expandable && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t"
          >
            <div className="text-sm text-muted-foreground">
              <p>Chi tiết về {title.toLowerCase()} sẽ được hiển thị ở đây.</p>
              <p className="mt-2">
                Bạn có thể xem thêm thông tin chi tiết và phân tích sâu hơn về các chỉ số này.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
