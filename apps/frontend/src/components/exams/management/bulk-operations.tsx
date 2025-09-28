/**
 * Enhanced Bulk Operations Component
 * Provides comprehensive bulk operations for exam management
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Trash2, 
  Archive, 
  Play, 
  Download, 
  Upload,
  Edit,
  Copy,
  CheckCircle,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam } from '@/lib/types/exam';
import { ExamExportService, ExportOptions } from '@/lib/services/exam-export.service';
import { ExamImportService, ImportOptions } from '@/lib/services/exam-import.service';

export interface BulkOperationsProps {
  selectedExams: Exam[];
  onClearSelection: () => void;
  onBulkDelete?: (examIds: string[]) => Promise<void>;
  onBulkPublish?: (examIds: string[]) => Promise<void>;
  onBulkArchive?: (examIds: string[]) => Promise<void>;
  onBulkEdit?: (examIds: string[], updates: Partial<Exam>) => Promise<void>;
  onBulkDuplicate?: (examIds: string[]) => Promise<void>;
  onImportComplete?: (importedExams: number) => void;
  className?: string;
}

interface BulkOperation {
  type: 'delete' | 'publish' | 'archive' | 'edit' | 'duplicate' | 'export' | 'import';
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  requiresConfirmation: boolean;
}

interface OperationProgress {
  isRunning: boolean;
  current: number;
  total: number;
  operation: string;
  errors: string[];
}

export function BulkOperations({
  selectedExams,
  onClearSelection,
  onBulkDelete,
  onBulkPublish,
  onBulkArchive,
  onBulkEdit,
  onBulkDuplicate,
  onImportComplete,
  className
}: BulkOperationsProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BulkOperation | null>(null);
  const [progress, setProgress] = useState<OperationProgress>({
    isRunning: false,
    current: 0,
    total: 0,
    operation: '',
    errors: []
  });

  // Edit form state
  const [editUpdates, setEditUpdates] = useState<Partial<Exam>>({});
  
  // Export options
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeAnswers: false,
    includeStatistics: true,
    template: 'standard'
  });

  // Import options
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    format: 'excel',
    validateData: true,
    skipErrors: false
  });

  const operations: BulkOperation[] = [
    {
      type: 'publish',
      label: 'Xuất bản',
      icon: <Play className="h-4 w-4" />,
      variant: 'default',
      requiresConfirmation: true
    },
    {
      type: 'archive',
      label: 'Lưu trữ',
      icon: <Archive className="h-4 w-4" />,
      variant: 'outline',
      requiresConfirmation: true
    },
    {
      type: 'edit',
      label: 'Chỉnh sửa',
      icon: <Edit className="h-4 w-4" />,
      variant: 'outline',
      requiresConfirmation: false
    },
    {
      type: 'duplicate',
      label: 'Nhân bản',
      icon: <Copy className="h-4 w-4" />,
      variant: 'outline',
      requiresConfirmation: true
    },
    {
      type: 'export',
      label: 'Xuất file',
      icon: <Download className="h-4 w-4" />,
      variant: 'outline',
      requiresConfirmation: false
    },
    {
      type: 'delete',
      label: 'Xóa',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      requiresConfirmation: true
    }
  ];

  const handleOperation = async (operation: BulkOperation) => {
    setCurrentOperation(operation);

    if (operation.type === 'edit') {
      setShowEditDialog(true);
      return;
    }

    if (operation.type === 'export') {
      setShowExportDialog(true);
      return;
    }

    if (operation.requiresConfirmation) {
      setShowConfirmDialog(true);
      return;
    }

    await executeOperation(operation);
  };

  const executeOperation = async (operation: BulkOperation) => {
    const examIds = selectedExams.map(exam => exam.id);
    
    setProgress({
      isRunning: true,
      current: 0,
      total: selectedExams.length,
      operation: operation.label,
      errors: []
    });

    try {
      switch (operation.type) {
        case 'delete':
          if (onBulkDelete) {
            await onBulkDelete(examIds);
          }
          break;
        case 'publish':
          if (onBulkPublish) {
            await onBulkPublish(examIds);
          }
          break;
        case 'archive':
          if (onBulkArchive) {
            await onBulkArchive(examIds);
          }
          break;
        case 'duplicate':
          if (onBulkDuplicate) {
            await onBulkDuplicate(examIds);
          }
          break;
        case 'edit':
          if (onBulkEdit) {
            await onBulkEdit(examIds, editUpdates);
          }
          break;
      }

      setProgress(prev => ({ ...prev, current: prev.total }));
      onClearSelection();
      
    } catch (error) {
      setProgress(prev => ({
        ...prev,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Có lỗi xảy ra']
      }));
    } finally {
      setTimeout(() => {
        setProgress({
          isRunning: false,
          current: 0,
          total: 0,
          operation: '',
          errors: []
        });
      }, 2000);
    }

    setShowConfirmDialog(false);
    setShowEditDialog(false);
    setCurrentOperation(null);
  };

  const handleExport = async () => {
    setProgress({
      isRunning: true,
      current: 0,
      total: selectedExams.length,
      operation: 'Xuất file',
      errors: []
    });

    try {
      if (selectedExams.length === 1) {
        // Single exam export
        const exam = selectedExams[0];
        const result = await ExamExportService.exportExam(exam, [], exportOptions);
        
        if (result.success && result.blob) {
          ExamExportService.downloadBlob(result.blob, result.filename);
        } else {
          throw new Error(result.error || 'Export failed');
        }
      } else {
        // Multiple exams export
        const examsWithQuestions = selectedExams.map(exam => ({
          exam,
          questions: [] // TODO: Fetch questions for each exam
        }));
        
        const result = await ExamExportService.exportMultipleExams(examsWithQuestions, exportOptions);
        
        if (result.success && result.blob) {
          ExamExportService.downloadBlob(result.blob, result.filename);
        } else {
          throw new Error(result.error || 'Export failed');
        }
      }

      setProgress(prev => ({ ...prev, current: prev.total }));
      
    } catch (error) {
      setProgress(prev => ({
        ...prev,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Export failed']
      }));
    } finally {
      setTimeout(() => {
        setProgress({
          isRunning: false,
          current: 0,
          total: 0,
          operation: '',
          errors: []
        });
        setShowExportDialog(false);
      }, 2000);
    }
  };

  const handleImport = async (file: File) => {
    setProgress({
      isRunning: true,
      current: 0,
      total: 100,
      operation: 'Nhập file',
      errors: []
    });

    try {
      const result = await ExamImportService.importFromFile(file, importOptions);
      
      if (result.success) {
        onImportComplete?.(result.summary.successfulExams);
        setProgress(prev => ({ ...prev, current: 100 }));
      } else {
        setProgress(prev => ({
          ...prev,
          errors: result.errors.map(e => e.message)
        }));
      }
      
    } catch (error) {
      setProgress(prev => ({
        ...prev,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Import failed']
      }));
    } finally {
      setTimeout(() => {
        setProgress({
          isRunning: false,
          current: 0,
          total: 0,
          operation: '',
          errors: []
        });
        setShowImportDialog(false);
      }, 2000);
    }
  };

  const downloadTemplate = (format: 'excel' | 'csv') => {
    const blob = ExamImportService.generateImportTemplate(format);
    const filename = `exam_import_template.${format === 'excel' ? 'xlsx' : 'csv'}`;
    ExamExportService.downloadBlob(blob, filename);
  };

  if (selectedExams.length === 0 && !showImportDialog) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportDialog(true)}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Nhập đề thi
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={cn("flex items-center gap-3 p-4 bg-muted/50 rounded-lg", className)}>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            {selectedExams.length} đã chọn
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {operations.map((operation) => (
            <Button
              key={operation.type}
              variant={operation.variant}
              size="sm"
              onClick={() => handleOperation(operation)}
              disabled={progress.isRunning}
              className="gap-2"
            >
              {operation.icon}
              {operation.label}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportDialog(true)}
          className="gap-2 ml-auto"
        >
          <Upload className="h-4 w-4" />
          Nhập đề thi
        </Button>
      </div>

      {/* Progress Indicator */}
      {progress.isRunning && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-medium">{progress.operation}</span>
            <span className="text-sm text-muted-foreground">
              {progress.current}/{progress.total}
            </span>
          </div>
          <Progress value={(progress.current / progress.total) * 100} className="h-2" />
          
          {progress.errors.length > 0 && (
            <div className="mt-3 space-y-1">
              {progress.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thao tác</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {currentOperation?.label.toLowerCase()} {selectedExams.length} đề thi đã chọn?
              {currentOperation?.type === 'delete' && (
                <span className="block mt-2 text-destructive font-medium">
                  Thao tác này không thể hoàn tác.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Hủy
            </Button>
            <Button
              variant={currentOperation?.variant}
              onClick={() => currentOperation && executeOperation(currentOperation)}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hàng loạt</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin cho {selectedExams.length} đề thi đã chọn
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Môn học</label>
              <Select
                value={editUpdates.subject || ''}
                onValueChange={(value) => setEditUpdates(prev => ({ ...prev, subject: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Toán học</SelectItem>
                  <SelectItem value="physics">Vật lý</SelectItem>
                  <SelectItem value="chemistry">Hóa học</SelectItem>
                  <SelectItem value="biology">Sinh học</SelectItem>
                  <SelectItem value="literature">Ngữ văn</SelectItem>
                  <SelectItem value="english">Tiếng Anh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={editUpdates.status || ''}
                onValueChange={(value) => setEditUpdates(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Hủy
            </Button>
            <Button onClick={() => currentOperation && executeOperation(currentOperation)}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xuất đề thi</DialogTitle>
            <DialogDescription>
              Chọn định dạng và tùy chọn xuất cho {selectedExams.length} đề thi
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Định dạng</label>
              <Select
                value={exportOptions.format}
                onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                  <SelectItem value="word">Word (.doc)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAnswers}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeAnswers: e.target.checked }))}
                />
                <span className="text-sm">Bao gồm đáp án</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeStatistics}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeStatistics: e.target.checked }))}
                />
                <span className="text-sm">Bao gồm thống kê</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleExport}>
              Xuất file
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập đề thi</DialogTitle>
            <DialogDescription>
              Nhập đề thi từ file Excel, CSV hoặc JSON
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Định dạng file</label>
              <Select
                value={importOptions.format}
                onValueChange={(value) => setImportOptions(prev => ({ ...prev, format: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={importOptions.validateData}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, validateData: e.target.checked }))}
                />
                <span className="text-sm">Kiểm tra dữ liệu</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={importOptions.skipErrors}
                  onChange={(e) => setImportOptions(prev => ({ ...prev, skipErrors: e.target.checked }))}
                />
                <span className="text-sm">Bỏ qua lỗi</span>
              </label>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Tải template mẫu:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('excel')}
                >
                  Template Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('csv')}
                >
                  Template CSV
                </Button>
              </div>
            </div>

            <div>
              <input
                type="file"
                accept=".xlsx,.csv,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImport(file);
                  }
                }}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
