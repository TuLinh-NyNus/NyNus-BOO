/**
 * Configuration Search Component
 * Component tìm kiếm và lọc configurations
 *
 * Features:
 * - Advanced search functionality
 * - Filter by category, type, status
 * - Real-time search results
 * - Export search results
 * - Saved search queries
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/display/card";
import { Button } from "../../ui/form/button";
import { Input } from "../../ui/form/input";
import { Badge } from "../../ui/display/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/form/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/display/table";
import {
  Search,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/feedback/use-toast";

/**
 * Configuration search result interface
 */
interface ConfigurationSearchResult {
  id: string;
  configKey: string;
  configValue: string | number | boolean | object;
  category: string;
  dataType: "string" | "number" | "boolean" | "json";
  description: string;
  isActive: boolean;
  lastModified: Date;
  lastModifiedBy: string;
}

/**
 * Mock search results
 */
const mockSearchResults: ConfigurationSearchResult[] = [
  {
    id: "1",
    configKey: "max_login_attempts",
    configValue: 5,
    category: "security",
    dataType: "number",
    description: "Số lần đăng nhập tối đa trước khi khóa tài khoản",
    isActive: true,
    lastModified: new Date("2025-07-27T09:15:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
  {
    id: "2",
    configKey: "email_enabled",
    configValue: true,
    category: "notifications",
    dataType: "boolean",
    description: "Bật/tắt thông báo qua email",
    isActive: true,
    lastModified: new Date("2025-07-27T08:45:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
  {
    id: "3",
    configKey: "cache_ttl",
    configValue: 600,
    category: "performance",
    dataType: "number",
    description: "Thời gian cache (giây)",
    isActive: true,
    lastModified: new Date("2025-07-27T08:30:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
  {
    id: "4",
    configKey: "theme_mode",
    configValue: "auto",
    category: "ui",
    dataType: "string",
    description: "Chế độ theme mặc định",
    isActive: true,
    lastModified: new Date("2025-07-25T12:00:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
  {
    id: "5",
    configKey: "enable_forum",
    configValue: false,
    category: "features",
    dataType: "boolean",
    description: "Bật/tắt tính năng forum",
    isActive: false,
    lastModified: new Date("2025-07-24T09:30:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
];

/**
 * Configuration Search Component
 */
export function ConfigurationSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<ConfigurationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Perform search
   */
  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Implement API call for search
      await new Promise(resolve => setTimeout(resolve, 500));

      let results = [...mockSearchResults];

      // Apply filters
      if (searchQuery) {
        results = results.filter(config =>
          config.configKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
          config.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (selectedCategory !== "all") {
        results = results.filter(config => config.category === selectedCategory);
      }

      if (selectedType !== "all") {
        results = results.filter(config => config.dataType === selectedType);
      }

      if (selectedStatus !== "all") {
        const isActive = selectedStatus === "active";
        results = results.filter(config => config.isActive === isActive);
      }

      setSearchResults(results);
    } catch {
      toast({ title: "Lỗi", description: "Lỗi khi tìm kiếm cấu hình", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedType, selectedStatus]);

  /**
   * Auto search when filters change
   */
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  /**
   * Export search results
   */
  const handleExport = () => {
    const csvContent = [
      ["Key", "Value", "Category", "Type", "Description", "Status", "Last Modified", "Modified By"],
      ...searchResults.map(config => [
        config.configKey,
        String(config.configValue),
        config.category,
        config.dataType,
        config.description,
        config.isActive ? "Active" : "Inactive",
        config.lastModified.toISOString(),
        config.lastModifiedBy
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `configuration-search-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Thành công", description: "Đã xuất kết quả tìm kiếm", variant: "success" });
  };

  /**
   * Format configuration value for display
   */
  const formatValue = (value: string | number | boolean | object, type: string) => {
    if (type === "boolean") {
      return value ? "Bật" : "Tắt";
    }
    if (type === "json") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  /**
   * Get category badge color
   */
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      security: "destructive",
      notifications: "default",
      performance: "secondary",
      ui: "outline",
      features: "default",
    };
    return colors[category] || "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Tìm kiếm cấu hình</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo key hoặc mô tả..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả categories</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="notifications">Notifications</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="ui">UI</SelectItem>
                <SelectItem value="features">Features</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Loại dữ liệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Tìm thấy {searchResults.length} kết quả
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={performSearch}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>Làm mới</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={searchResults.length === 0}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Xuất CSV</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle>Kết quả tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          {searchResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Configuration Key</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật lần cuối</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{config.configKey}</div>
                        <div className="text-sm text-muted-foreground">{config.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {formatValue(config.configValue, config.dataType)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCategoryColor(config.category) as "default" | "secondary" | "destructive" | "outline"}>
                        {config.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{config.dataType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.isActive ? "secondary" : "destructive"}>
                        {config.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{config.lastModified.toLocaleDateString("vi-VN")}</div>
                        <div className="text-muted-foreground">{config.lastModifiedBy}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? "Đang tìm kiếm..." : "Không tìm thấy kết quả nào"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
