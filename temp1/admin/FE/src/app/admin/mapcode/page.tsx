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
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  Skeleton,
} from "@/components/ui";
import {
  Map,
  Plus,
  Download,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle,
  History,
  FileText,
  ArrowLeft,
} from "lucide-react";

// Import MapCode components
import { MapCodeManagement } from "@/components/mapcode/mapcode-management";
import { MapCodeVersionList } from "@/components/mapcode/mapcode-version-list";
import { MapCodeVersionEditor } from "@/components/mapcode/mapcode-version-editor";

// Import hooks và utilities
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { toSecretPath } from "@/lib/admin-paths";

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
 * MapCode Management Page Component
 */
export default function MapCodeManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasRole } = useAdminAuth();

  // State management
  const [versions, setVersions] = useState<MapCodeVersion[]>([]);
  const [activeVersion, setActiveVersion] = useState<MapCodeVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<MapCodeVersion | null>(null);
  const [stats, setStats] = useState({
    totalVersions: 0,
    activeVersion: "",
    totalQuestions: 0,
    lastUpdate: "",
  });

  // Permission checks
  const canManageMapCode = hasRole("ADMIN");

  /**
   * Load MapCode versions
   */
  const loadVersions = async () => {
    try {
      setIsLoading(true);

      // TODO: Replace với actual API call
      const response = await fetch("/api/admin/mapcode/versions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load MapCode versions");
      }

      const data = await response.json();
      setVersions(data.versions || []);
      setActiveVersion(data.activeVersion || null);
      setStats(data.stats || stats);
    } catch (error) {
      console.error("Error loading MapCode versions:", error);
      toast.error("Không thể tải danh sách MapCode versions");

      // Mock data for development
      const mockVersions: MapCodeVersion[] = [
        {
          id: "1",
          version: "v2.1.0",
          name: "MapCode 2024 Q3",
          description: "Cập nhật mã câu hỏi cho quý 3 năm 2024",
          isActive: true,
          createdAt: "2024-07-01T00:00:00Z",
          updatedAt: "2024-07-15T00:00:00Z",
          author: "Admin",
          questionCount: 1250,
          fileSize: 45600,
        },
        {
          id: "2",
          version: "v2.0.5",
          name: "MapCode 2024 Q2",
          description: "Phiên bản ổn định cho quý 2",
          isActive: false,
          createdAt: "2024-04-01T00:00:00Z",
          updatedAt: "2024-06-30T00:00:00Z",
          author: "Admin",
          questionCount: 1180,
          fileSize: 42300,
        },
      ];

      setVersions(mockVersions);
      setActiveVersion(mockVersions[0]);
      setStats({
        totalVersions: mockVersions.length,
        activeVersion: mockVersions[0].version,
        totalQuestions: mockVersions[0].questionCount,
        lastUpdate: mockVersions[0].updatedAt,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle version activation
   */
  const handleActivateVersion = async (versionId: string) => {
    try {
      // TODO: Replace với actual API call
      const response = await fetch(`/api/admin/mapcode/activate/${versionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to activate version");
      }

      toast.success("Đã kích hoạt version thành công");
      await loadVersions();
    } catch (error) {
      console.error("Error activating version:", error);
      toast.error("Không thể kích hoạt version");
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
      // TODO: Replace với actual API call
      const response = await fetch(`/api/admin/mapcode/versions/${versionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete version");
      }

      toast.success("Đã xóa version thành công");
      await loadVersions();
    } catch (error) {
      console.error("Error deleting version:", error);
      toast.error("Không thể xóa version");
    }
  };

  /**
   * Handle version export
   */
  const handleExportVersion = async (versionId: string) => {
    try {
      // TODO: Replace với actual API call
      const response = await fetch(`/api/admin/mapcode/export/${versionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export version");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mapcode-${versionId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Đã xuất MapCode thành công");
    } catch (error) {
      console.error("Error exporting version:", error);
      toast.error("Không thể xuất MapCode");
    }
  };

  // Load versions on mount
  useEffect(() => {
    if (isAuthenticated && canManageMapCode) {
      loadVersions();
    }
  }, [isAuthenticated, canManageMapCode]);

  // Show loading state
  if (!isAuthenticated || isLoading) {
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
            onClick={() => router.push(toSecretPath("/admin/questions"))}
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
              /* TODO: Implement import */
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
            // TODO: Implement save logic
            console.log("Saving version:", versionData);
            setShowEditor(false);
            setSelectedVersion(null);
            await loadVersions();
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
