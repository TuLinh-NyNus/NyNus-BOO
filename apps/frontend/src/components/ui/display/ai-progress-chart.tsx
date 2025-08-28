"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressData {
  label: string;
  current: number;
  target: number;
  color: string;
  icon?: React.ReactNode;
  status?: "completed" | "in-progress" | "pending";
}

interface AIProgressChartProps {
  data: ProgressData[];
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
  showDetails?: boolean;
}

export const AIProgressChart: React.FC<AIProgressChartProps> = ({
  data,
  size = "md",
  className,
  animated = true,
  showDetails = true
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sizeConfig = {
    sm: { size: 16, strokeWidth: 4 },
    md: { size: 24, strokeWidth: 6 },
    lg: { size: 32, strokeWidth: 8 }
  };

  const currentSize = sizeConfig[size];
  const radius = currentSize.size / 2;

  const getStatusIcon = (status?: "completed" | "in-progress" | "pending") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: "completed" | "in-progress" | "pending") => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in-progress":
        return "text-blue-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {}, 1500);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((item, index) => {
          const percentage = Math.min((item.current / item.target) * 100, 100);
          const circumference = 2 * Math.PI * (radius - currentSize.strokeWidth / 2);
          const strokeDasharray = circumference;
          const strokeDashoffset = circumference - (percentage / 100) * circumference;

          return (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              {/* Circular Progress */}
              <div className="relative">
                <svg
                  className="transform -rotate-90"
                  style={{ width: currentSize.size * 4, height: currentSize.size * 4 }}
                  viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                >
                  {/* Background Circle */}
                  <circle
                    cx={radius}
                    cy={radius}
                    r={radius - currentSize.strokeWidth / 2}
                    stroke="currentColor"
                    strokeWidth={currentSize.strokeWidth}
                    fill="transparent"
                    className="text-muted/20"
                  />
                  
                  {/* Progress Circle */}
                  <motion.circle
                    cx={radius}
                    cy={radius}
                    r={radius - currentSize.strokeWidth / 2}
                    stroke="currentColor"
                    strokeWidth={currentSize.strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className={cn("transition-all duration-1000", item.color)}
                    initial={animated ? { strokeDashoffset: circumference } : false}
                    animate={animated ? { strokeDashoffset } : false}
                    transition={{ 
                      delay: index * 0.2, 
                      duration: 1.5,
                      ease: "easeOut"
                    }}
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={cn("text-lg font-bold", getStatusColor(item.status))}>
                      {Math.round(percentage)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.current}/{item.target}
                    </div>
                  </div>
                </div>

                {/* Status Icon */}
                <div className="absolute -top-1 -right-1">
                  {getStatusIcon(item.status)}
                </div>
              </div>

              {/* Label */}
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                {item.icon && (
                  <div className="mt-1 text-muted-foreground">
                    {item.icon}
                  </div>
                )}
              </div>

              {/* Hover Tooltip */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border rounded-lg shadow-lg text-sm whitespace-nowrap z-10"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="text-muted-foreground">
                      Tiến độ: {Math.round(percentage)}%
                    </div>
                    <div className="text-xs">
                      {item.current} / {item.target} hoàn thành
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Details Section */}
      {showDetails && (
        <motion.div
          className="bg-muted/30 rounded-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h4 className="font-medium text-foreground mb-3">Tổng quan tiến độ</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.filter(item => item.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Đã hoàn thành</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.filter(item => item.status === "in-progress").length}
              </div>
              <div className="text-sm text-muted-foreground">Đang thực hiện</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data.filter(item => item.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Chờ thực hiện</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
