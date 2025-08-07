/**
 * MapCode Management Component
 * Main management interface cho MapCode operations
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
} from "@/components/ui";
import {
  RefreshCw,
  Download,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  FileText,
  Database,
  Clock,
} from "lucide-react";

/**
 * MapCode version interface
 */
interface MapCodeVersion {
  id: string;
  version: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
  questionCount: number;
  fileSize: number;
}

/**
 * Stats interface
 */
interface MapCodeStats {
  totalVersions: number;
  activeVersion: string;
  totalQuestions: number;
  lastUpdate: string;
}

/**
 * Props for MapCodeManagement component
 */
interface MapCodeManagementProps {
  activeVersion: MapCodeVersion | null;
  stats: MapCodeStats;
  onRefresh: () => void;
}

/**
 * MapCode Management Component
 * Provides management tools và system information
 */
export function MapCodeManagement({ activeVersion, stats, onRefresh }: MapCodeManagementProps) {
  /**
   * Format file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mapcode-management space-y-4">
      {/* Active Version Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Version hiện tại
          </CardTitle>
          <CardDescription>Thông tin version MapCode đang được sử dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeVersion ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Version:</span>
                  <Badge className="bg-green-100 text-green-800">{activeVersion.version}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tên:</span>
                  <span className="text-sm">{activeVersion.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Câu hỏi:</span>
                  <span className="text-sm font-mono">{activeVersion.questionCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Kích thước:</span>
                  <span className="text-sm font-mono">
                    {formatFileSize(activeVersion.fileSize)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cập nhật:</span>
                  <span className="text-sm">{formatDate(activeVersion.updatedAt)}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">{activeVersion.description}</p>
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Không có version nào đang hoạt động</p>
                <p className="text-sm text-muted-foreground">
                  Vui lòng kích hoạt một version để sử dụng hệ thống
                </p>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* System Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Thống kê hệ thống
          </CardTitle>
          <CardDescription>Tổng quan về MapCode system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Tổng versions</span>
              <div className="font-mono font-medium">{stats.totalVersions}</div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground">Tổng câu hỏi</span>
              <div className="font-mono font-medium">{stats.totalQuestions}</div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Cập nhật cuối: {stats.lastUpdate ? formatDate(stats.lastUpdate) : "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Thao tác nhanh
          </CardTitle>
          <CardDescription>Các thao tác thường dùng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" size="sm" onClick={onRefresh} className="w-full justify-start">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới danh sách
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement backup functionality
              console.log("Creating backup...");
            }}
            className="w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Sao lưu hệ thống
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implement restore functionality
              console.log("Restoring from backup...");
            }}
            className="w-full justify-start"
          >
            <Upload className="h-4 w-4 mr-2" />
            Khôi phục từ backup
          </Button>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Tình trạng hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">MapCode Service</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Hoạt động
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Kết nối tốt
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">File System</span>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sẵn sàng
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tài liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-blue-600 hover:text-blue-700"
            onClick={() => {
              // TODO: Open documentation
              window.open("/docs/mapcode", "_blank");
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Hướng dẫn sử dụng MapCode
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-blue-600 hover:text-blue-700"
            onClick={() => {
              // TODO: Open API documentation
              window.open("/docs/api/mapcode", "_blank");
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            API Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
