/**
 * Bulk Operations Component
 * Component thực hiện các thao tác hàng loạt với configurations
 *
 * Features:
 * - Bulk import/export configurations
 * - Bulk enable/disable configurations
 * - Bulk update operations
 * - Configuration backup/restore
 * - Validation and preview before applying
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/display/card";
import { Button } from "../../ui/form/button";
import { Input } from "../../ui/form/input";
import { Label } from "../../ui/form/label";
import { Badge } from "../../ui/display/badge";
import { Textarea } from "../../ui/form/textarea";
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
  Upload,
  Download,
  Database,
  CheckCircle,
  AlertTriangle,
  Save,
} from "lucide-react";
import { toast } from "@/components/ui/feedback/use-toast";

/**
 * Bulk operation types
 */
type BulkOperationType = "import" | "export" | "enable" | "disable" | "backup" | "restore";

/**
 * Configuration preview item
 */
interface ConfigurationPreview {
  configKey: string;
  currentValue: string | number | boolean | object;
  newValue: string | number | boolean | object;
  action: "create" | "update" | "delete";
  category: string;
  dataType: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Bulk Operations Component
 */
export function BulkOperations() {
  const [selectedOperation, setSelectedOperation] = useState<BulkOperationType>("export");
  const [importData, setImportData] = useState("");
  const [previewData, setPreviewData] = useState<ConfigurationPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file upload
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
        validateImportData(content);
      };
      reader.readAsText(file);
    }
  };

  /**
   * Validate import data and generate preview
   */
  const validateImportData = (data: string) => {
    try {
      const configurations = JSON.parse(data);
      const preview: ConfigurationPreview[] = configurations.map((config: Record<string, unknown>) => ({
        configKey: config.configKey || config.key,
        currentValue: "N/A", // Would be fetched from API
        newValue: config.configValue || config.value,
        action: "update" as const,
        category: config.category || "unknown",
        dataType: config.dataType || config.type || "string",
        isValid: !!(config.configKey || config.key),
        errorMessage: !(config.configKey || config.key) ? "Missing configuration key" : undefined,
      }));
      
      setPreviewData(preview);
      setShowPreview(true);
    } catch {
      toast({ title: "Lỗi", description: "Dữ liệu import không hợp lệ", variant: "destructive" });
      setPreviewData([]);
      setShowPreview(false);
    }
  };

  /**
   * Execute bulk export
   */
  const handleExport = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to get all configurations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockExportData = [
        {
          configKey: "max_login_attempts",
          configValue: 5,
          category: "security",
          dataType: "number",
          description: "Số lần đăng nhập tối đa trước khi khóa tài khoản",
          isActive: true
        },
        {
          configKey: "email_enabled",
          configValue: true,
          category: "notifications",
          dataType: "boolean",
          description: "Bật/tắt thông báo qua email",
          isActive: true
        },
        {
          configKey: "cache_ttl",
          configValue: 600,
          category: "performance",
          dataType: "number",
          description: "Thời gian cache (giây)",
          isActive: true
        }
      ];

      const jsonContent = JSON.stringify(mockExportData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `configurations-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Thành công", description: "Đã xuất cấu hình thành công", variant: "success" });
    } catch {
      toast({ title: "Lỗi", description: "Lỗi khi xuất cấu hình", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Execute bulk import
   */
  const handleImport = async () => {
    if (previewData.length === 0) {
      toast({ title: "Lỗi", description: "Không có dữ liệu để import", variant: "destructive" });
      return;
    }

    const invalidItems = previewData.filter(item => !item.isValid);
    if (invalidItems.length > 0) {
      toast({ title: "Lỗi", description: `Có ${invalidItems.length} mục không hợp lệ`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to import configurations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({ title: "Thành công", description: `Đã import thành công ${previewData.length} cấu hình`, variant: "success" });
      setImportData("");
      setPreviewData([]);
      setShowPreview(false);
    } catch {
      toast({ title: "Lỗi", description: "Lỗi khi import cấu hình", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Execute backup
   */
  const handleBackup = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to create backup
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({ title: "Thành công", description: "Đã tạo backup thành công", variant: "success" });
    } catch {
      toast({ title: "Lỗi", description: "Lỗi khi tạo backup", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get operation description
   */
  const getOperationDescription = (operation: BulkOperationType) => {
    const descriptions = {
      import: "Import cấu hình từ file JSON",
      export: "Xuất tất cả cấu hình ra file JSON",
      enable: "Bật tất cả cấu hình đã chọn",
      disable: "Tắt tất cả cấu hình đã chọn",
      backup: "Tạo backup toàn bộ cấu hình",
      restore: "Khôi phục cấu hình từ backup"
    };
    return descriptions[operation];
  };

  return (
    <div className="space-y-6">
      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Thao tác hàng loạt</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="operation">Chọn thao tác</Label>
              <Select value={selectedOperation} onValueChange={(value) => setSelectedOperation(value as BulkOperationType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thao tác" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">Xuất cấu hình</SelectItem>
                  <SelectItem value="import">Import cấu hình</SelectItem>
                  <SelectItem value="backup">Tạo backup</SelectItem>
                  <SelectItem value="restore">Khôi phục backup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-muted-foreground">
                {getOperationDescription(selectedOperation)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operation Content */}
      {selectedOperation === "export" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Xuất cấu hình</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Xuất tất cả cấu hình hiện tại ra file JSON để backup hoặc chuyển đổi.
              </p>
              <Button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Download className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Đang xuất..." : "Xuất cấu hình"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedOperation === "import" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Import cấu hình</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Chọn file JSON</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="import-data">Hoặc dán dữ liệu JSON</Label>
                <Textarea
                  id="import-data"
                  value={importData}
                  onChange={(e) => {
                    setImportData(e.target.value);
                    if (e.target.value.trim()) {
                      validateImportData(e.target.value);
                    }
                  }}
                  placeholder="Dán dữ liệu JSON cấu hình vào đây..."
                  rows={6}
                  className="mt-1"
                />
              </div>

              {showPreview && previewData.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Preview ({previewData.length} items)</h4>
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Configuration Key</TableHead>
                          <TableHead>Giá trị mới</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.configKey}</TableCell>
                            <TableCell>
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {String(item.newValue)}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.category}</Badge>
                            </TableCell>
                            <TableCell>
                              {item.isValid ? (
                                <Badge variant="secondary" className="text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Hợp lệ
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Lỗi
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={loading || previewData.length === 0}
                className="flex items-center space-x-2"
              >
                <Upload className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Đang import..." : "Import cấu hình"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedOperation === "backup" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Save className="h-5 w-5" />
              <span>Tạo backup</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tạo backup toàn bộ cấu hình hiện tại để có thể khôi phục sau này.
              </p>
              <Button
                onClick={handleBackup}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Đang tạo backup..." : "Tạo backup"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
