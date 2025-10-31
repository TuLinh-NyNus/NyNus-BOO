/**
 * Admin MapCode Management Page
 * Page cho quản lý MapCode versions trong admin panel
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Map,
  ArrowLeft,
  Settings,
  Languages, // Thay thế Translate bằng Languages
  Database,
} from "lucide-react";

// Import MapCode components
import {
  VersionSelector,
  TranslationDisplay,
  VersionManagement,
  MapCodeUpload,
  MetricsDashboard,
  VersionDiff
} from "@/components/admin/mapcode";
import { MapCodeVersionData } from "@/lib/grpc/mapcode-client";

/**
 * MapCode Management Page Component
 */
export default function MapCodeManagementPage() {
  const router = useRouter();
  const [versions, setVersions] = React.useState<MapCodeVersionData[]>([]);

  // Load versions for VersionDiff component
  React.useEffect(() => {
    const loadVersions = async () => {
      try {
        const result = await import("@/lib/grpc/mapcode-client").then(m => 
          m.MapCodeClient.getVersions(1, 50)
        );
        setVersions(result.versions);
      } catch (error) {
        console.error("Failed to load versions:", error);
      }
    };
    loadVersions();
  }, []);

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
            <p className="text-muted-foreground">
              Quản lý hệ thống phân loại và mã hóa câu hỏi với gRPC backend
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard - Full Width */}
      <MetricsDashboard />

      {/* Version Comparison Tool - Full Width */}
      <VersionDiff versions={versions} />

      {/* Upload Section - Full Width */}
      <MapCodeUpload 
        onUploadSuccess={(versionId) => {
          // Reload page or refresh version list
          window.location.reload();
        }}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Version Management */}
        <div className="space-y-6">
          {/* Version Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Version Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VersionSelector />
            </CardContent>
          </Card>

          {/* Translation Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Translation Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TranslationDisplay />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Version Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Version Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VersionManagement />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
