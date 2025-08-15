/**
 * Top Performers Table Component
 * Bảng top performers
 */

'use client';

import React from 'react';
import { Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';

export interface TopPerformersTableProps {
  className?: string;
}

export function TopPerformersTable({ className }: TopPerformersTableProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Top Performers
        </CardTitle>
        <CardDescription>Học viên và khóa học xuất sắc nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Top Performers Table</p>
            <p className="text-sm">Bảng xếp hạng học viên và khóa học</p>
            <Badge variant="outline" className="mt-3">Coming Soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TopPerformersTable;
