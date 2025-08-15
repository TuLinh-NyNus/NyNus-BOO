/**
 * User Growth Chart Component
 * Biểu đồ tăng trưởng người dùng
 */

'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';

export interface UserGrowthChartProps {
  className?: string;
}

export function UserGrowthChart({ className }: UserGrowthChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Tăng trưởng người dùng
        </CardTitle>
        <CardDescription>Số lượng người dùng mới theo thời gian</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">User Growth Chart</p>
            <p className="text-sm">Sẽ được implement với Chart.js hoặc Recharts</p>
            <Badge variant="outline" className="mt-3">Coming Soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserGrowthChart;
