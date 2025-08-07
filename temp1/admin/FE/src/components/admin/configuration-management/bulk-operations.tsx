/**
 * Bulk Operations Component
 * Component thực hiện các thao tác hàng loạt với configurations
 *
 * Features:
 * - Bulk import/export configurations
 * - Bulk update operations
 * - Configuration validation
 * - Cache management
 * - Backup and restore
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/layout/card";
import { Button } from "../../ui/forms/button";
import { Badge } from "../../ui/data-display/badge";
import { Textarea } from "../../ui/forms/textarea";
import { Switch } from "../../ui/forms/switch";
import { Label } from "../../ui/forms/label";
import {
  Upload,
  Download,
  Database,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Settings,
  Trash2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Bulk operation result interface
 */
interface BulkOperationResult {
  success: boolean;
  updated: number;
  failed: number;
  errors: string[];
}

/**
 * Bulk Operations Component
 */
export function BulkOperations() {
  const [importData, setImportData] = useState("");
  const [exportData, setExportData] = useState("");
  const [loading, setLoading] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [skipValidation, setSkipValidation] = useState(false);
  const [lastResult, setLastResult] = useState<BulkOperationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Export all configurations
   */
  const handleExportAll = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      // const response = await fetch('/api/configuration/export', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ categories: [] }) // Empty = all categories
      // });
      // const data = await response.json();

      // Mock export data
      const mockExportData = {
        security: {
          max_login_attempts: {
            value: 5,
            dataType: "number",
            description: "Số lần đăng nhập tối đa",
          },
          session_timeout: {
            value: 3600,
            dataType: "number",
            description: "Thời gian timeout session",
          },
        },
        notifications: {
          email_enabled: {
            value: true,
            dataType: "boolean",
            description: "Bật/tắt email notifications",
          },
        },
      };

      setExportData(JSON.stringify(mockExportData, null, 2));
      toast.success("Xuất cấu hình thành công");
    } catch (error) {
      toast.error("Lỗi khi xuất cấu hình");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download export data as file
   */
  const handleDownloadExport = () => {
    if (!exportData) {
      toast.error("Không có dữ liệu để tải xuống");
      return;
    }

    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nynus-configurations-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File đã được tải xuống");
  };

  /**
   * Import configurations from file
   */
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        setImportData(JSON.stringify(parsed, null, 2));
        toast.success("File đã được tải lên");
      } catch (error) {
        toast.error("File không hợp lệ");
      }
    };
    reader.readAsText(file);
  };

  /**
   * Import configurations
   */
  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error("Vui lòng nhập dữ liệu cấu hình");
      return;
    }

    try {
      const configData = JSON.parse(importData);
      setLoading(true);

      // TODO: Implement API call
      // const response = await fetch('/api/configuration/import', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     configData,
      //     overwrite: overwriteExisting,
      //     skipValidation
      //   })
      // });
      // const result = await response.json();

      // Mock result
      const mockResult: BulkOperationResult = {
        success: true,
        updated: 15,
        failed: 2,
        errors: [
          "security.invalid_key: Configuration not found",
          "ui.theme_color: Invalid color format",
        ],
      };

      setLastResult(mockResult);

      if (mockResult.success) {
        toast.success(`Import thành công: ${mockResult.updated} cấu hình được cập nhật`);
        if (mockResult.failed > 0) {
          toast.warning(`${mockResult.failed} cấu hình thất bại`);
        }
      } else {
        toast.error("Import thất bại");
      }
    } catch (error) {
      toast.error("Dữ liệu JSON không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear cache
   */
  const handleClearCache = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      // await fetch('/api/configuration/cache', { method: 'DELETE' });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Cache đã được xóa");
    } catch (error) {
      toast.error("Lỗi khi xóa cache");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate configurations
   */
  const handleValidateAll = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to validate all configurations
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockValidationResult = {
        total: 156,
        valid: 152,
        invalid: 4,
        errors: [
          "security.password_complexity: Invalid regex pattern",
          "notifications.smtp_port: Port must be between 1-65535",
          "performance.max_connections: Value exceeds system limit",
          "ui.logo_url: Invalid URL format",
        ],
      };

      if (mockValidationResult.invalid > 0) {
        toast.warning(`Validation hoàn thành: ${mockValidationResult.invalid} lỗi được tìm thấy`);
      } else {
        toast.success("Tất cả cấu hình đều hợp lệ");
      }
    } catch (error) {
      toast.error("Lỗi khi validate cấu hình");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Thao tác hàng loạt</h2>
        <p className="text-muted-foreground">Import/Export và quản lý configurations hàng loạt</p>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Xuất cấu hình</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleExportAll}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Xuất tất cả cấu hình</span>
            </Button>

            {exportData && (
              <Button
                variant="outline"
                onClick={handleDownloadExport}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Tải xuống file</span>
              </Button>
            )}
          </div>

          {exportData && (
            <div className="space-y-2">
              <Label>Dữ liệu xuất:</Label>
              <Textarea
                value={exportData}
                readOnly
                className="font-mono text-sm h-40"
                placeholder="Dữ liệu xuất sẽ hiển thị ở đây..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Nhập cấu hình</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Options */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch checked={overwriteExisting} onCheckedChange={setOverwriteExisting} />
              <Label>Ghi đè cấu hình hiện có</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch checked={skipValidation} onCheckedChange={setSkipValidation} />
              <Label>Bỏ qua validation</Label>
            </div>
          </div>

          {/* File Upload */}
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Chọn file JSON</span>
            </Button>

            <span className="text-sm text-muted-foreground">
              hoặc dán dữ liệu JSON vào ô bên dưới
            </span>
          </div>

          {/* Import Data */}
          <div className="space-y-2">
            <Label>Dữ liệu cấu hình (JSON):</Label>
            <Textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="font-mono text-sm h-40"
              placeholder="Dán dữ liệu JSON cấu hình vào đây..."
            />
          </div>

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={loading || !importData.trim()}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Nhập cấu hình</span>
          </Button>

          {/* Import Result */}
          {lastResult && (
            <div
              className={`p-4 rounded-lg ${lastResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {lastResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  Kết quả import: {lastResult.updated} thành công, {lastResult.failed} thất bại
                </span>
              </div>

              {lastResult.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Lỗi:</div>
                  {lastResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 font-mono">
                      • {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Thao tác hệ thống</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleClearCache}
              disabled={loading}
              className="flex items-center space-x-2 h-auto p-4 flex-col"
            >
              <Database className="h-6 w-6 mb-2" />
              <span className="font-medium">Xóa Cache</span>
              <span className="text-xs text-muted-foreground text-center">
                Xóa toàn bộ configuration cache
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={handleValidateAll}
              disabled={loading}
              className="flex items-center space-x-2 h-auto p-4 flex-col"
            >
              <CheckCircle className="h-6 w-6 mb-2" />
              <span className="font-medium">Validate All</span>
              <span className="text-xs text-muted-foreground text-center">
                Kiểm tra tính hợp lệ của tất cả cấu hình
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 h-auto p-4 flex-col"
            >
              <RefreshCw className="h-6 w-6 mb-2" />
              <span className="font-medium">Reload Page</span>
              <span className="text-xs text-muted-foreground text-center">
                Tải lại trang để cập nhật
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
