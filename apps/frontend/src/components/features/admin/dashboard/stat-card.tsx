'use client';

import React from 'react';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
}

/**
 * Component StatCard - Hiển thị thẻ thống kê với icon, giá trị và xu hướng
 * Sử dụng cho dashboard admin để hiển thị các metrics quan trọng
 */
export function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {/* Hiển thị giá trị chính với format số có dấu phẩy */}
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        
        {/* Mô tả chi tiết về số liệu */}
        <p className="text-xs text-muted-foreground">{description}</p>
        
        {/* Hiển thị xu hướng nếu có */}
        {trend && (
          <div className="flex items-center pt-1">
            <Badge 
              variant={trend.isPositive ? "default" : "secondary"}
              className="text-xs"
            >
              {trend.isPositive ? '+' : ''}{trend.value} {trend.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

