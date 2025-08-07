/**
 * MapCode Version List Component
 * List all MapCode versions với management actions
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui";
import {
  MoreHorizontal,
  CheckCircle,
  Edit,
  Download,
  Trash2,
  Play,
  FileText,
  Calendar,
  User,
  Database,
  HardDrive,
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
 * Props for MapCodeVersionList component
 */
interface MapCodeVersionListProps {
  versions: MapCodeVersion[];
  activeVersion: MapCodeVersion | null;
  onActivate: (versionId: string) => void;
  onEdit: (version: MapCodeVersion) => void;
  onDelete: (versionId: string) => void;
  onExport: (versionId: string) => void;
}

/**
 * MapCode Version List Component
 * Displays list of all MapCode versions với actions
 */
export function MapCodeVersionList({
  versions,
  activeVersion,
  onActivate,
  onEdit,
  onDelete,
  onExport,
}: MapCodeVersionListProps) {
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
      month: "short",
      day: "numeric",
    });
  };

  /**
   * Get version status badge
   */
  const getStatusBadge = (version: MapCodeVersion) => {
    if (version.isActive) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Đang hoạt động
        </Badge>
      );
    }
    return <Badge variant="outline">Không hoạt động</Badge>;
  };

  // Empty state
  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách MapCode Versions</CardTitle>
          <CardDescription>Quản lý các phiên bản MapCode</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có version nào</h3>
            <p className="text-muted-foreground mb-4">
              Tạo version đầu tiên để bắt đầu sử dụng MapCode
            </p>
            <Button onClick={() => onEdit({} as MapCodeVersion)}>Tạo version đầu tiên</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách MapCode Versions</CardTitle>
        <CardDescription>
          Quản lý các phiên bản MapCode ({versions.length} versions)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {versions.map((version) => (
          <Card
            key={version.id}
            className={`transition-all ${
              version.isActive ? "ring-2 ring-green-500 bg-green-50/50" : "hover:shadow-md"
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                {/* Version Info */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{version.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">{version.version}</span>
                        {getStatusBadge(version)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">{version.description}</p>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{version.author}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(version.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      <span>{version.questionCount} câu hỏi</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      <span>{formatFileSize(version.fileSize)}</span>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground">
                    Cập nhật: {formatDate(version.updatedAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Activate Button */}
                  {!version.isActive && (
                    <Button variant="outline" size="sm" onClick={() => onActivate(version.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Kích hoạt
                    </Button>
                  )}

                  {/* More Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(version)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onExport(version.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Xuất file
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {!version.isActive && (
                        <DropdownMenuItem onClick={() => onActivate(version.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Kích hoạt
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      {!version.isActive && (
                        <DropdownMenuItem
                          onClick={() => onDelete(version.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
