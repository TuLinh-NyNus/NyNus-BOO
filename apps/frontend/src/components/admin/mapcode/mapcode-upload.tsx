"use client";

/**
 * MapCode Upload Component
 * Cho phép admin upload file MapCode.md mới qua UI
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { MapCodeClient } from "@/lib/grpc/mapcode-client";
import { toast } from "sonner";

interface MapCodeUploadProps {
  onUploadSuccess?: (versionId: string) => void;
  className?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export function MapCodeUpload({ onUploadSuccess, className }: MapCodeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [versionName, setVersionName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);

  /**
   * Validate MapCode file content
   */
  const validateMapCodeFile = async (file: File): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      errors.push({
        field: "file",
        message: "File quá lớn (tối đa 10MB)"
      });
    }

    // Check file extension
    if (!file.name.endsWith('.md')) {
      errors.push({
        field: "file",
        message: "File phải có định dạng .md"
      });
    }

    // Validate content
    try {
      const content = await file.text();

      // Check minimum length
      if (content.length < 100) {
        errors.push({
          field: "content",
          message: "Nội dung file quá ngắn (tối thiểu 100 ký tự)"
        });
      }

      // Check for level definitions
      const levelPattern = /\[N\]\s*Nhận biết/;
      if (!levelPattern.test(content)) {
        errors.push({
          field: "content",
          message: "File không chứa cấu hình mức độ chuẩn ([N] Nhận biết)"
        });
      }

      // Check for required hierarchy patterns
      const requiredPatterns = [
        { pattern: /-\[.\]/, name: "Grade (Lớp)" },
        { pattern: /----\[.\]/, name: "Subject (Môn)" },
        { pattern: /-------\[.\]/, name: "Chapter (Chương)" },
      ];

      for (const { pattern, name } of requiredPatterns) {
        if (!pattern.test(content)) {
          errors.push({
            field: "structure",
            message: `Thiếu section bắt buộc: ${name}`
          });
        }
      }

      // Check for Vietnamese encoding
      if (!content.includes('Lớp') && !content.includes('Chương')) {
        errors.push({
          field: "encoding",
          message: "File có thể bị lỗi encoding (không tìm thấy text tiếng Việt)"
        });
      }

    } catch (error) {
      errors.push({
        field: "file",
        message: "Không thể đọc nội dung file"
      });
    }

    return errors;
  };

  /**
   * Handle file selection
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationSuccess(false);
    setValidationErrors([]);

    // Validate file
    toast.info("Đang kiểm tra file...");
    const errors = await validateMapCodeFile(selectedFile);
    setValidationErrors(errors);

    if (errors.length === 0) {
      setValidationSuccess(true);
      toast.success("File hợp lệ! Sẵn sàng upload.");
    } else {
      toast.error(`Tìm thấy ${errors.length} lỗi trong file`);
    }
  };

  /**
   * Handle upload
   */
  const handleUpload = async () => {
    if (!file || validationErrors.length > 0) {
      toast.error("Vui lòng chọn file hợp lệ");
      return;
    }

    // Validate version name
    if (!versionName.trim()) {
      toast.error("Vui lòng nhập tên version");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Read file content
      const content = await file.text();
      setUploadProgress(30);

      // Generate version string if needed
      const versionString = versionName.startsWith('v') 
        ? versionName 
        : `v${versionName}`;

      setUploadProgress(50);

      // Call API to create version
      // Note: File content upload will be handled separately (manual script for now)
      const result = await MapCodeClient.createVersion(
        versionString,
        versionName,
        description || `MapCode version ${versionString}`,
        "admin" // TODO: Get from auth context
      );

      setUploadProgress(100);

      if (result) {
        toast.success(`Version ${versionString} đã được tạo thành công!`);
        toast.info("Lưu ý: Cần copy file MapCode.md vào thư mục version sau khi tạo");
        
        // Reset form
        setFile(null);
        setVersionName("");
        setDescription("");
        setValidationSuccess(false);
        setValidationErrors([]);
        setUploadProgress(0);

        // Notify parent
        onUploadSuccess?.(result.id);

        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Upload thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setFile(null);
    setVersionName("");
    setDescription("");
    setValidationErrors([]);
    setValidationSuccess(false);
    setUploadProgress(0);

    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload MapCode File
        </CardTitle>
        <CardDescription>
          Upload file MapCode.md mới để tạo version trong hệ thống
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">MapCode.md File *</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".md"
              onChange={handleFileChange}
              disabled={uploading}
              className="flex-1"
            />
            {file && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            )}
          </div>
        </div>

        {/* Validation Results */}
        {validationSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              File hợp lệ! Đã kiểm tra định dạng và cấu trúc.
            </AlertDescription>
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <p className="font-semibold mb-2">Tìm thấy {validationErrors.length} lỗi:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i}>
                    <span className="font-medium">{error.field}:</span> {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Version Info */}
        <div className="space-y-2">
          <Label htmlFor="version-name">Version Name *</Label>
          <Input
            id="version-name"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            placeholder="2025-11-15 hoặc v2025-11-15"
            disabled={uploading}
          />
          <p className="text-xs text-gray-500">
            Sẽ tự động thêm prefix "v" nếu chưa có
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm chương mới cho lớp 11, cập nhật chương 5..."
            rows={3}
            disabled={uploading}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Đang upload...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Warning */}
        {file && validationSuccess && !uploading && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Lưu ý:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Version mới sẽ được tạo ở trạng thái <strong>inactive</strong></li>
                <li>Cần kích hoạt thủ công sau khi kiểm tra</li>
                <li>File sẽ được lưu vào <code>docs/resources/latex/mapcode/</code></li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleUpload}
            disabled={!file || validationErrors.length > 0 || !versionName.trim() || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Import
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={uploading}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

