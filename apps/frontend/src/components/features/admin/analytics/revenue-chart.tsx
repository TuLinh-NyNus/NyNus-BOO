/**
 * Revenue Chart Component
 * Biểu đồ doanh thu
 */

'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';

export interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Doanh thu
        </CardTitle>
        <CardDescription>Biểu đồ doanh thu theo thời gian</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Revenue Chart</p>
            <p className="text-sm">Thống kê doanh thu và tăng trưởng</p>
            <Badge variant="outline" className="mt-3">Coming Soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;
