/**
 * Course Progress Chart Component
 * Biểu đồ tiến độ khóa học
 */

'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';

export interface CourseProgressChartProps {
  className?: string;
}

export function CourseProgressChart({ className }: CourseProgressChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Tiến độ khóa học
        </CardTitle>
        <CardDescription>Thống kê tiến độ hoàn thành khóa học</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Course Progress Chart</p>
            <p className="text-sm">Biểu đồ tiến độ và completion rate</p>
            <Badge variant="outline" className="mt-3">Coming Soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseProgressChart;
