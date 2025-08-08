/**
 * MapCode Management Component
 * Main management interface cho MapCode operations
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Alert } from "@/components/ui/feedback/alert";
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

// Import types
import type { MapCodeVersion, MapCodeStatistics } from "@/lib/mockdata/mapcode";

/**
 * Props for MapCodeManagement component
 */
interface MapCodeManagementProps {
  activeVersion: MapCodeVersion | null;
  stats: MapCodeStatistics;
  onRefresh: () => void;
}

/**
 * MapCode Management Component
 * Sidebar management tools cho MapCode operations
 */
export function MapCodeManagement({ activeVersion, stats, onRefresh }: MapCodeManagementProps) {
  /**
   * Format file size
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Quick Actions
          </CardTitle>
          <CardDescription>Các thao tác nhanh cho MapCode management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={onRefresh} variant="outline" className="w-full justify-start">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              // TODO: Implement backup functionality
              console.log("Backup all versions");
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup All Versions
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              // TODO: Implement import functionality
              console.log("Import MapCode");
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import MapCode
          </Button>
        </CardContent>
      </Card>

      {/* Active Version Info */}
      {activeVersion ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Active Version
            </CardTitle>
            <CardDescription>Thông tin version đang hoạt động</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version:</span>
                <Badge variant="outline">{activeVersion.version}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{activeVersion.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Questions:</span>
                <span className="text-sm font-medium">{activeVersion.questionCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">File Size:</span>
                <span className="text-sm font-medium">{formatFileSize(activeVersion.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated:</span>
                <span className="text-sm font-medium">{formatDate(activeVersion.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Author:</span>
                <span className="text-sm font-medium">{activeVersion.author}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">{activeVersion.description}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Không có version nào đang hoạt động</h4>
            <p className="text-sm text-muted-foreground">
              Vui lòng kích hoạt một version để sử dụng MapCode system.
            </p>
          </div>
        </Alert>
      )}

      {/* System Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System Statistics
          </CardTitle>
          <CardDescription>Thống kê tổng quan hệ thống MapCode</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-blue-600">{stats.totalVersions}</div>
              <div className="text-xs text-muted-foreground">Total Versions</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-2xl font-bold text-green-600">{stats.totalQuestions.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Questions</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Version:</span>
              <Badge variant="outline">{stats.activeVersion || "None"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Update:</span>
              <span className="text-sm font-medium">
                {stats.lastUpdate ? formatDate(stats.lastUpdate) : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help & Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Help & Documentation
          </CardTitle>
          <CardDescription>Hướng dẫn sử dụng MapCode system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">MapCode Format</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Grade: 0-2 (Lớp 10-12)</li>
              <li>• Subject: M (Math), P (Physics), etc.</li>
              <li>• Chapter: 1-9, A-Z</li>
              <li>• Difficulty: E (Easy), M (Medium), H (Hard)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Version Management</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Chỉ có 1 version active tại một thời điểm</li>
              <li>• Không thể xóa version đang active</li>
              <li>• Export version để backup</li>
              <li>• Import để restore từ backup</li>
            </ul>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <div>
              <p className="text-xs">
                Thay đổi MapCode version sẽ ảnh hưởng đến toàn bộ hệ thống phân loại câu hỏi.
                Hãy cẩn thận khi thực hiện thao tác này.
              </p>
            </div>
          </Alert>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">MapCode System Online</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            All services are running normally
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
