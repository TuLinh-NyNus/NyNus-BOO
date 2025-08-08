/**
 * Admin Settings Management Page
 * Trang quản lý cấu hình hệ thống cho admin dashboard
 *
 * Features:
 * - Category-based configuration organization
 * - Configuration editing với validation
 * - Bulk operations (import/export, bulk update)
 * - Cache management tools
 * - Advanced search và filtering
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
// Card components imported but used in child components
import { Button } from "../../../../components/ui/form/button";
import { Badge } from "../../../../components/ui/display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/navigation/tabs";
import {
  Shield,
  Bell,
  Zap,
  Palette,
  ToggleLeft,
  Search,
  RefreshCw,
  Database,
  BarChart3,
} from "lucide-react";
import { toast } from "../../../../hooks/use-toast";

import {
  ConfigurationOverview,
  ConfigurationEditor,
  ConfigurationSearch,
  BulkOperations,
} from "../../../../components/admin/configuration-management";

/**
 * Configuration categories với icons và descriptions
 */
const CONFIGURATION_CATEGORIES = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: BarChart3,
    description: "Dashboard và thống kê cấu hình",
    color: "text-blue-600",
  },
  {
    id: "security",
    label: "Bảo mật",
    icon: Shield,
    description: "Cấu hình bảo mật và xác thực",
    color: "text-red-600",
  },
  {
    id: "notifications",
    label: "Thông báo",
    icon: Bell,
    description: "Cấu hình hệ thống thông báo",
    color: "text-orange-600",
  },
  {
    id: "performance",
    label: "Hiệu suất",
    icon: Zap,
    description: "Cấu hình hiệu suất và cache",
    color: "text-green-600",
  },
  {
    id: "ui",
    label: "Giao diện",
    icon: Palette,
    description: "Cấu hình giao diện người dùng",
    color: "text-purple-600",
  },
  {
    id: "features",
    label: "Tính năng",
    icon: ToggleLeft,
    description: "Bật/tắt các tính năng hệ thống",
    color: "text-indigo-600",
  },
  {
    id: "search",
    label: "Tìm kiếm",
    icon: Search,
    description: "Tìm kiếm và lọc cấu hình",
    color: "text-gray-600",
  },
  {
    id: "bulk",
    label: "Thao tác hàng loạt",
    icon: Database,
    description: "Import/Export và bulk operations",
    color: "text-teal-600",
  },
];

/**
 * Admin Settings Management Page Component
 */
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<{
    totalEntries: number;
    hitRate: number;
    missRate: number;
    totalHits: number;
    totalMisses: number;
    memoryUsage: number;
  } | null>(null);

  /**
   * Load cache statistics on component mount
   */
  useEffect(() => {
    loadCacheStatistics();
  }, []);

  /**
   * Load cache statistics
   */
  const loadCacheStatistics = async () => {
    try {
      // Sử dụng mockdata thay vì API call
      setCacheStats({
        totalEntries: 156,
        hitRate: 87.5,
        missRate: 12.5,
        totalHits: 2340,
        totalMisses: 335,
        memoryUsage: 2.4, // MB
      });
    } catch (error) {
      console.error("Failed to load cache statistics:", error);
    }
  };

  /**
   * Clear configuration cache
   */
  const handleClearCache = async () => {
    setLoading(true);
    try {
      // Sử dụng mockdata thay vì API call
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
      await loadCacheStatistics();
      toast({ title: "Thành công", description: "Cache đã được xóa thành công", variant: "success" });
    } catch {
      toast({ title: "Lỗi", description: "Lỗi khi xóa cache", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get active category info
   */
  const activeCategory = CONFIGURATION_CATEGORIES.find((cat) => cat.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cấu hình hệ thống</h1>
          <p className="text-muted-foreground">Quản lý cấu hình và thiết lập hệ thống NyNus</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {cacheStats && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Cache: {cacheStats.totalEntries} entries</span>
              <Badge variant="outline" className="text-green-600">
                {cacheStats.hitRate}% hit rate
              </Badge>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleClearCache}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Xóa Cache</span>
          </Button>
        </div>
      </div>

      {/* Configuration Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1">
            {CONFIGURATION_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex flex-col items-center space-y-1 p-3 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className={`h-5 w-5 ${category.color}`} />
                  <span className="text-xs font-medium">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Active Tab Description */}
        {activeCategory && (
          <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
            <activeCategory.icon className={`h-6 w-6 ${activeCategory.color}`} />
            <div>
              <h3 className="font-semibold">{activeCategory.label}</h3>
              <p className="text-sm text-muted-foreground">{activeCategory.description}</p>
            </div>
          </div>
        )}

        {/* Tab Contents */}
        <div className="mt-6">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <ConfigurationOverview cacheStats={cacheStats} />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <ConfigurationEditor
              category="security"
              title="Cấu hình bảo mật"
              description="Quản lý các thiết lập bảo mật và xác thực"
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <ConfigurationEditor
              category="notifications"
              title="Cấu hình thông báo"
              description="Quản lý hệ thống thông báo và email"
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <ConfigurationEditor
              category="performance"
              title="Cấu hình hiệu suất"
              description="Quản lý cache, database và hiệu suất hệ thống"
            />
          </TabsContent>

          {/* UI Tab */}
          <TabsContent value="ui" className="space-y-6">
            <ConfigurationEditor
              category="ui"
              title="Cấu hình giao diện"
              description="Quản lý giao diện người dùng và theme"
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <ConfigurationEditor
              category="features"
              title="Cấu hình tính năng"
              description="Bật/tắt các tính năng hệ thống"
            />
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <ConfigurationSearch />
          </TabsContent>

          {/* Bulk Operations Tab */}
          <TabsContent value="bulk" className="space-y-6">
            <BulkOperations />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
