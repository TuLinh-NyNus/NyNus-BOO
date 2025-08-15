/**
 * System Metrics Component
 * Thống kê hệ thống
 */

'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';
import { Badge } from '@/components/ui/display/badge';

export interface SystemMetricsProps {
  className?: string;
}

export function SystemMetrics({ className }: SystemMetricsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Metrics
        </CardTitle>
        <CardDescription>Thống kê hiệu suất hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">System Metrics</p>
            <p className="text-sm">Thống kê performance và uptime</p>
            <Badge variant="outline" className="mt-3">Coming Soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SystemMetrics;
