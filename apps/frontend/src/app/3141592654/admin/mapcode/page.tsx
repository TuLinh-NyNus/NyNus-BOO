/**
 * Admin MapCode Management Page
 * Page cho quản lý MapCode versions trong admin panel
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";

import { Alert } from "@/components/ui/feedback/alert";
import { Skeleton } from "@/components/ui/display/skeleton";
import {
  Map,
  Plus,
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

// Import MapCode components
import { MapCodeManagement } from "@/components/features/admin/mapcode/mapcode-management";
import { MapCodeVersionList } from "@/components/features/admin/mapcode/mapcode-version-list";
import { MapCodeVersionEditor } from "@/components/features/admin/mapcode/mapcode-version-editor";

// Import mockdata
import {
  getMapCodeVersions,
  activateMapCodeVersion,
  deleteMapCodeVersion,
  exportMapCodeVersion,
  saveMapCodeVersion,
  type MapCodeVersion,
  type MapCodeStatistics,
} from "@/lib/mockdata/mapcode";

/**
 * MapCode Management Page Component
 */
export default function MapCodeManagementPage() {
  const router = useRouter();

  // State management
  const [versions, setVersions] = useState<MapCodeVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<MapCodeVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<MapCodeVersion | null>(null);
  const [stats, setStats] = useState<MapCodeStatistics>({
    totalVersions: 0,
    activeVersion: "",
    totalQuestions: 0,
    lastUpdate: "",
  });

  // Permission checks - simplified for mockdata
  const canManageMapCode = true; // In real app, this would use auth hook

  /**
   * Load MapCode versions
   */
  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const data = await getMapCodeVersions();
      setVersions(data.versions);
      setActiveVersion(data.activeVersion);
      setStats(data.stats);
    } catch (error) {
      console.error("Error loading MapCode versions:", error);
      toast({ title: "Không thể tải danh sách MapCode versions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle version activation
   */
  const handleActivateVersion = async (versionId: string) => {
    try {
      await activateMapCodeVersion(versionId);
      toast({ title: "Đã kích hoạt version thành công" });
      await loadVersions();
    } catch (error) {
      console.error("Error activating version:", error);
      toast({ title: "Không thể kích hoạt version", variant: "destructive" });
    }
  };

  /**
   * Handle version deletion
   */
  const handleDeleteVersion = async (versionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa version này?")) {
      return;
    }

    try {
      await deleteMapCodeVersion(versionId);
      toast({ title: "Đã xóa version thành công" });
      await loadVersions();
    } catch (error) {
      console.error("Error deleting version:", error);
      toast({ title: "Không thể xóa version", variant: "destructive" });
    }
  };

  /**
   * Handle version export
   */
  const handleExportVersion = async (versionId: string) => {
    try {
      const blob = await exportMapCodeVersion(versionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mapcode-${versionId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Đã xuất MapCode thành công" });
    } catch (error) {
      console.error("Error exporting version:", error);
      toast({ title: "Không thể xuất MapCode", variant: "destructive" });
    }
  };

  // Load versions on mount
  useEffect(() => {
    if (canManageMapCode) {
      loadVersions();
    }
  }, [canManageMapCode]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permissions
  if (!canManageMapCode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Bạn không có quyền quản lý MapCode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mapcode-management-page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/3141592654/admin/questions")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Map className="h-6 w-6" />
              Quản lý MapCode
            </h1>
            <p className="text-muted-foreground">Quản lý hệ thống phân loại và mã hóa câu hỏi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo version mới
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({ title: "Import feature sẽ được implement sau" });
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVersions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Version hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeVersion}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cập nhật cuối</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleDateString("vi-VN") : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Version Info */}
      {activeVersion && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <div>
            <h4 className="font-medium">Version đang hoạt động</h4>
            <p className="text-sm text-muted-foreground">
              {activeVersion.name} ({activeVersion.version}) - {activeVersion.questionCount} câu hỏi
            </p>
          </div>
        </Alert>
      )}

      {/* Main Content */}
      {showEditor ? (
        <MapCodeVersionEditor
          version={selectedVersion}
          onSave={async (versionData) => {
            try {
              await saveMapCodeVersion(versionData);
              toast({ title: "Đã lưu MapCode version thành công" });
              setShowEditor(false);
              setSelectedVersion(null);
              await loadVersions();
            } catch (error) {
              console.error("Error saving version:", error);
              toast({ title: "Không thể lưu MapCode version", variant: "destructive" });
            }
          }}
          onCancel={() => {
            setShowEditor(false);
            setSelectedVersion(null);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Version List */}
          <div className="lg:col-span-2">
            <MapCodeVersionList
              versions={versions}
              activeVersion={activeVersion}
              onActivate={handleActivateVersion}
              onEdit={(version) => {
                setSelectedVersion(version);
                setShowEditor(true);
              }}
              onDelete={handleDeleteVersion}
              onExport={handleExportVersion}
            />
          </div>

          {/* Management Tools */}
          <div className="lg:col-span-1">
            <MapCodeManagement
              activeVersion={activeVersion}
              stats={stats}
              onRefresh={loadVersions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
