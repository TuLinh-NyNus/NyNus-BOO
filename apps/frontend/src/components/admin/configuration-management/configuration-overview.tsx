/**
 * Configuration Overview Component
 * Component hiển thị tổng quan về system configurations
 *
 * Features:
 * - Configuration statistics dashboard
 * - Cache performance metrics
 * - Recent configuration changes
 * - System health indicators
 * - Quick access to common configurations
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/display/card";
import { Button } from "../../ui/form/button";
import { Badge } from "../../ui/display/badge";
import {
  Settings,
  Database,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Server,
  Zap,
  RefreshCw,
} from "lucide-react";

/**
 * Configuration Overview Props
 */
interface ConfigurationOverviewProps {
  cacheStats?: {
    totalEntries: number;
    hitRate: number;
    missRate: number;
    totalHits: number;
    totalMisses: number;
    memoryUsage: number;
  } | null;
}

/**
 * Mock configuration statistics
 */
const mockConfigStats = {
  totalConfigurations: 156,
  activeConfigurations: 142,
  inactiveConfigurations: 14,
  categoriesCount: 6,
  recentChanges: 8,
  lastModified: new Date("2025-07-27T10:30:00Z"),
};

/**
 * Mock recent changes
 */
const mockRecentChanges = [
  {
    id: "1",
    category: "security",
    configKey: "max_login_attempts",
    oldValue: "3",
    newValue: "5",
    changedBy: "admin@nynus.com",
    changedAt: new Date("2025-07-27T09:15:00Z"),
    status: "success",
  },
  {
    id: "2",
    category: "notifications",
    configKey: "email_enabled",
    oldValue: "false",
    newValue: "true",
    changedBy: "admin@nynus.com",
    changedAt: new Date("2025-07-27T08:45:00Z"),
    status: "success",
  },
  {
    id: "3",
    category: "performance",
    configKey: "cache_ttl",
    oldValue: "300",
    newValue: "600",
    changedBy: "admin@nynus.com",
    changedAt: new Date("2025-07-27T08:30:00Z"),
    status: "success",
  },
];

/**
 * Configuration categories summary
 */
const categoriesSummary = [
  { category: "security", count: 28, active: 26, color: "text-red-600", bgColor: "bg-red-50" },
  {
    category: "notifications",
    count: 24,
    active: 22,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    category: "performance",
    count: 32,
    active: 30,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  { category: "ui", count: 18, active: 16, color: "text-purple-600", bgColor: "bg-purple-50" },
  {
    category: "features",
    count: 42,
    active: 38,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  { category: "system", count: 12, active: 10, color: "text-gray-600", bgColor: "bg-gray-50" },
];

/**
 * Configuration Overview Component
 */
export function ConfigurationOverview({ cacheStats }: ConfigurationOverviewProps) {
  const [configStats, setConfigStats] = useState(mockConfigStats);
  const [recentChanges, setRecentChanges] = useState(mockRecentChanges);
  const [loading, setLoading] = useState(false);

  /**
   * Load configuration statistics
   */
  const loadConfigurationStats = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to get configuration statistics
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Mock data for now
    } catch (error) {
      console.error("Failed to load configuration statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format time ago
   */
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng cấu hình</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configStats.totalConfigurations}</div>
            <p className="text-xs text-muted-foreground">
              {configStats.activeConfigurations} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configStats.categoriesCount}</div>
            <p className="text-xs text-muted-foreground">Nhóm cấu hình</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thay đổi gần đây</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configStats.recentChanges}</div>
            <p className="text-xs text-muted-foreground">Trong 24h qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cacheStats?.hitRate?.toFixed(1) || "0"}%
            </div>
            <p className="text-xs text-muted-foreground">{cacheStats?.totalEntries || 0} entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Phân bố theo categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categoriesSummary.map((cat) => (
              <div key={cat.category} className={`p-4 rounded-lg ${cat.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold capitalize">{cat.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {cat.active}/{cat.count} active
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${cat.color}`}>{cat.count}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Changes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Thay đổi gần đây</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadConfigurationStats}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentChanges.map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="outline" className="text-xs">
                      {change.category}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-medium">{change.configKey}</div>
                    <div className="text-sm text-muted-foreground">
                      {change.oldValue} → {change.newValue}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{change.changedBy}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeAgo(change.changedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Configuration Service</div>
                <div className="text-sm text-green-600">Healthy</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Database className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Cache System</div>
                <div className="text-sm text-green-600">
                  {cacheStats?.memoryUsage?.toFixed(1) || "0"} MB used
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Performance</div>
                <div className="text-sm text-green-600">Optimal</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
