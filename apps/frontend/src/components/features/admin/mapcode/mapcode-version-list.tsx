/**
 * MapCode Version List Component
 * List all MapCode versions với management actions
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/overlay/dropdown-menu";
import {
  MoreHorizontal,
  CheckCircle,
  Edit,
  Download,
  Trash2,
  Play,
  FileText,
  Calendar,

  Database,
  HardDrive,
} from "lucide-react";

// Import types
import type { MapCodeVersion } from "@/lib/mockdata/mapcode";

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
 * Hiển thị danh sách tất cả MapCode versions với actions
 */
export function MapCodeVersionList({
  versions,
  onActivate,
  onEdit,
  onDelete,
  onExport,
}: MapCodeVersionListProps) {
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

  /**
   * Get version status badge
   */
  const getVersionStatusBadge = (version: MapCodeVersion) => {
    if (version.isActive) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        Inactive
      </Badge>
    );
  };

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MapCode Versions</CardTitle>
          <CardDescription>Quản lý tất cả versions của MapCode system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chưa có MapCode version nào</p>
              <p className="text-sm text-muted-foreground">Tạo version đầu tiên để bắt đầu</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MapCode Versions</CardTitle>
        <CardDescription>
          Quản lý tất cả versions của MapCode system ({versions.length} versions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`border rounded-lg p-4 space-y-3 ${
                version.isActive ? "border-green-200 bg-green-50/50" : ""
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{version.name}</h3>
                    {getVersionStatusBadge(version)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {version.version}
                    </Badge>
                    <span>•</span>
                    <span>{version.author}</span>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!version.isActive && (
                      <>
                        <DropdownMenuItem onClick={() => onActivate(version.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(version)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport(version.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    {!version.isActive && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(version.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              {version.description && (
                <p className="text-sm text-muted-foreground">{version.description}</p>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{version.questionCount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatFileSize(version.fileSize)}</div>
                    <div className="text-xs text-muted-foreground">File Size</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatDate(version.createdAt)}</div>
                    <div className="text-xs text-muted-foreground">Created</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{formatDate(version.updatedAt)}</div>
                    <div className="text-xs text-muted-foreground">Updated</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {!version.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onActivate(version.id)}
                    className="text-xs"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Activate
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(version)}
                  className="text-xs"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport(version.id)}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                {!version.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(version.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
