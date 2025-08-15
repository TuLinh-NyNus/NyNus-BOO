/**
 * Question Usage Chart Component
 * Biểu đồ sử dụng câu hỏi
 */

'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';

export interface QuestionUsageChartProps {
  className?: string;
}

export function QuestionUsageChart({ className }: QuestionUsageChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Sử dụng câu hỏi
        </CardTitle>
        <CardDescription>Thống kê câu hỏi được sử dụng nhiều nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Question Usage Chart</p>
            <p className="text-sm">Biểu đồ thống kê câu hỏi phổ biến</p>
            <Badge variant="outline" className="mt-3">Coming Soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuestionUsageChart;
