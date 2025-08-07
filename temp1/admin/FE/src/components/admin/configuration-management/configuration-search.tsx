/**
 * Configuration Search Component
 * Component tìm kiếm và lọc configurations
 *
 * Features:
 * - Advanced search across all categories
 * - Filtering by category, data type, status
 * - Real-time search results
 * - Search history
 * - Export search results
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/layout/card";
import { Button } from "../../ui/forms/button";
import { Input } from "../../ui/forms/input";
import { Badge } from "../../ui/data-display/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/forms/select";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Clock,
  Database,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Configuration search result interface
 */
interface ConfigurationSearchResult {
  id: string;
  category: string;
  configKey: string;
  configValue: any;
  dataType: string;
  description: string;
  isActive: boolean;
  isEditable: boolean;
  lastModified: Date;
  lastModifiedBy: string;
}

/**
 * Mock search data
 */
const mockSearchResults: ConfigurationSearchResult[] = [
  {
    id: "1",
    category: "security",
    configKey: "max_login_attempts",
    configValue: 5,
    dataType: "number",
    description: "Số lần đăng nhập tối đa trước khi khóa tài khoản",
    isActive: true,
    isEditable: true,
    lastModified: new Date("2025-07-27T09:15:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
  {
    id: "2",
    category: "security",
    configKey: "session_timeout",
    configValue: 3600,
    dataType: "number",
    description: "Thời gian timeout session (giây)",
    isActive: true,
    isEditable: true,
    lastModified: new Date("2025-07-26T14:30:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
  {
    id: "3",
    category: "notifications",
    configKey: "email_enabled",
    configValue: true,
    dataType: "boolean",
    description: "Bật/tắt email notifications",
    isActive: true,
    isEditable: true,
    lastModified: new Date("2025-07-27T08:45:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
  {
    id: "4",
    category: "performance",
    configKey: "cache_ttl",
    configValue: 600,
    dataType: "number",
    description: "Cache TTL (giây)",
    isActive: true,
    isEditable: true,
    lastModified: new Date("2025-07-27T08:30:00Z"),
    lastModifiedBy: "admin@nynus.com",
  },
];

/**
 * Configuration Search Component
 */
export function ConfigurationSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dataTypeFilter, setDataTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchResults, setSearchResults] = useState<ConfigurationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Perform search
   */
  const performSearch = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      // const response = await fetch('/api/configuration/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     searchTerm,
      //     category: categoryFilter !== 'all' ? categoryFilter : undefined,
      //     dataType: dataTypeFilter !== 'all' ? dataTypeFilter : undefined,
      //     status: statusFilter !== 'all' ? statusFilter : undefined
      //   })
      // });
      // const results = await response.json();

      // Mock search for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSearchResults(mockSearchResults);
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter results based on current filters
   */
  const filteredResults = useMemo(() => {
    let results = searchResults;

    // Search term filter
    if (searchTerm) {
      results = results.filter(
        (result) =>
          result.configKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      results = results.filter((result) => result.category === categoryFilter);
    }

    // Data type filter
    if (dataTypeFilter !== "all") {
      results = results.filter((result) => result.dataType === dataTypeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      results = results.filter((result) => result.isActive === isActive);
    }

    return results;
  }, [searchResults, searchTerm, categoryFilter, dataTypeFilter, statusFilter]);

  /**
   * Export search results
   */
  const exportResults = () => {
    const data = JSON.stringify(filteredResults, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "configuration-search-results.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Kết quả tìm kiếm đã được xuất");
  };

  /**
   * Format configuration value for display
   */
  const formatValue = (value: any, dataType: string) => {
    switch (dataType) {
      case "boolean":
        return value ? "true" : "false";
      case "json":
        return JSON.stringify(value);
      default:
        return String(value);
    }
  };

  /**
   * Get category color
   */
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      security: "bg-red-100 text-red-800",
      notifications: "bg-orange-100 text-orange-800",
      performance: "bg-green-100 text-green-800",
      ui: "bg-purple-100 text-purple-800",
      features: "bg-indigo-100 text-indigo-800",
      system: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  // Load initial results
  useEffect(() => {
    performSearch();
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h2 className="text-2xl font-bold">Tìm kiếm cấu hình</h2>
        <p className="text-muted-foreground">Tìm kiếm và lọc configurations trên toàn hệ thống</p>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Bộ lọc tìm kiếm</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, mô tả hoặc category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={performSearch}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Tìm kiếm</span>
            </Button>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả categories</SelectItem>
                  <SelectItem value="security">Bảo mật</SelectItem>
                  <SelectItem value="notifications">Thông báo</SelectItem>
                  <SelectItem value="performance">Hiệu suất</SelectItem>
                  <SelectItem value="ui">Giao diện</SelectItem>
                  <SelectItem value="features">Tính năng</SelectItem>
                  <SelectItem value="system">Hệ thống</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Type</label>
              <Select value={dataTypeFilter} onValueChange={setDataTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả types</SelectItem>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Kết quả tìm kiếm</span>
            <Badge variant="outline">{filteredResults.length} kết quả</Badge>
          </CardTitle>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportResults}
              disabled={filteredResults.length === 0}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Xuất</span>
            </Button>

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
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Đang tìm kiếm...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy kết quả</h3>
              <p className="text-muted-foreground">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getCategoryColor(result.category)}>
                          {result.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.dataType}
                        </Badge>
                        {!result.isActive && (
                          <Badge variant="outline" className="text-gray-600">
                            Inactive
                          </Badge>
                        )}
                        {!result.isEditable && (
                          <Badge variant="outline" className="text-orange-600">
                            Read-only
                          </Badge>
                        )}
                      </div>

                      <h4 className="font-semibold text-lg mb-1">{result.configKey}</h4>
                      <p className="text-muted-foreground text-sm mb-2">{result.description}</p>

                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Giá trị: </span>
                          <span className="font-mono bg-muted px-2 py-1 rounded">
                            {formatValue(result.configValue, result.dataType)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{result.lastModified.toLocaleString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {result.isEditable && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
